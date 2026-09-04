# To generate Dockerfile for k8s deployment
FROM artifactory.itg.ti.com/docker-scs-public/base/node:24.11.1-alpine AS base
# disable nextJs telemetry to avoid sending anonymous data to Vercel which constitutes unrequired network traffic
ENV NEXT_TELEMETRY_DISABLED=1
# to tell pnpm that its a non-interactive CI system to avoid looking for .git file which increases size
ENV CI=true

# Stage 1 : Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm i -g corepack@latest
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm i -g corepack@latest
RUN corepack enable pnpm && pnpm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create a non-root user and group to run the application securely
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
