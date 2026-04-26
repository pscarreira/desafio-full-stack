FROM node:20-bookworm-slim AS deps

WORKDIR /workspace

COPY package.json package-lock.json turbo.json biome.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci --workspace=apps/api --include-workspace-root

FROM deps AS builder

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api

RUN npm run build
RUN npm run build:seed

FROM node:20-bookworm-slim AS prod-deps

WORKDIR /workspace

COPY package.json package-lock.json turbo.json biome.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci --omit=dev --workspace=apps/api --include-workspace-root && npm cache clean --force

FROM node:20-bookworm-slim AS runtime

WORKDIR /workspace/apps/api

ENV NODE_ENV=production

COPY --from=prod-deps /workspace/node_modules /workspace/node_modules
COPY --from=builder /workspace/apps/api/dist ./dist
COPY --from=builder /workspace/apps/api/dist-seed ./dist-seed
COPY --from=builder /workspace/apps/api/package.json ./package.json
COPY data /workspace/data
COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
