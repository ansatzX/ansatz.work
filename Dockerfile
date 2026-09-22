# Stage 1: Build environment
FROM node:22-bookworm-slim AS build

# RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

WORKDIR /usr/src/app

# Pass the source commit timestamp from CI for reproducible generated dates:
# docker build --build-arg SOURCE_DATE_EPOCH=$(git log -1 --format=%ct) .
ARG SOURCE_DATE_EPOCH
ENV SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH}

# TikZ is compiled during Eleventy build, so the LaTeX toolchain must exist in
# the build stage rather than only in the runtime stage.
ENV TINYTEX_HOME=/root/.TinyTeX
ENV PATH="${TINYTEX_HOME}/bin/x86_64-linux:${PATH}"

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl perl wget xz-utils && \
    rm -rf /var/lib/apt/lists/* && \
    wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh && \
    tlmgr install dvisvgm pgf siunitx preview standalone fp

# Copy package files to install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies) from the lockfile.
RUN npm ci

# Copy rest of application code
COPY . .

# Build with the same toolchain that will serve the generated files.
RUN npm run build && npm cache clean --force

# Stage 2: Production environment
FROM node:22-bookworm-slim

# Set environment variables for production
ENV NODE_ENV=production
ENV TINYTEX_HOME=/root/.TinyTeX
ENV PATH="${TINYTEX_HOME}/bin/x86_64-linux:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/bin"
# Set working directory
WORKDIR /usr/src/app

# Copy package files (for production dependencies)
COPY package*.json ./

# Runtime uses the exact TinyTeX installation used by the build stage.
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    npm ci && npm cache clean --force
COPY --from=build ${TINYTEX_HOME} ${TINYTEX_HOME}

# Copy application code and built files from build stage
COPY --from=build /usr/src/app .

# Expose the port that the app will run on
EXPOSE 8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the application
CMD ["node", "app.js"]
