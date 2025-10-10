# Stage 1: Build environment
FROM node:18-bookworm-slim AS build

# RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

WORKDIR /usr/src/app

# Copy package files to install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# (Optional) Build the application if there's a build step, but make sure to skip it gracefully if it's missing
RUN if [ -f package.json ] && grep -q "build" package.json; then npm run build; npm cache clean --force; else echo "No build step"; fi

# RUN npm run get-theme

# RUN npm run build:*
# Stage 2: Production environment
FROM node:18-bookworm-slim

# Set environment variables for production
ENV NODE_ENV=production
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/bin
# Set the working directory
WORKDIR /usr/src/app

# Copy the package files (for production dependencies)
COPY package*.json ./

RUN apt update && apt install perl wget curl -y && apt-get clean && rm -rf /var/lib/apt/lists/* && \
    export OSNAME=Linux; export OSTYPE=linux-gnu;mkdir -p /root/.local/bin; \
    wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh && tlmgr install dvisvgm pgf siunitx preview standalone fp && \
    npm ci && \ 
    npm cache clean --force


# Copy the application code and built files from the build stage
COPY --from=build /usr/src/app .

# Expose the port that the app will run on
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]