FROM node:20-bookworm-slim AS deps

WORKDIR /workspace

COPY package.json package-lock.json turbo.json biome.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace=apps/web --include-workspace-root

FROM deps AS builder

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

COPY --from=builder /workspace/apps/web/.next/standalone ./
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

USER nextjs

CMD ["node", "apps/web/server.js"]
