FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATA_DIR=/data

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Seed file used by src/lib/storage.ts on first boot to populate $DATA_DIR.
# Not the runtime source of truth — the Railway Volume at /data is.
COPY --from=builder --chown=nextjs:nodejs /app/benchmarks.json /app/seed/benchmarks.json

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
