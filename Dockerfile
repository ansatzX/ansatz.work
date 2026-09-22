FROM node:22-bookworm-slim AS build
WORKDIR /usr/src/app
ARG SOURCE_DATE_EPOCH
ENV SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} TIKZ_STRICT=1 TIKZ_CONCURRENCY=2 TIKZ_TIMEOUT_MS=30000
# TeX exists only in the build stage. apt verifies repository signatures.
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-extra texlive-fonts-recommended dvisvgm \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime-deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /usr/src/app
COPY --from=runtime-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node package.json app.js ./
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "app.js"]
