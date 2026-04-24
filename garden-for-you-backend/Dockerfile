# syntax=docker/dockerfile:1.7

# Stage 1 — deps
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json .npmrc ./
COPY patches ./patches

RUN npm ci --prefer-offline --no-audit --no-fund
# Stage 2 — build
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3 — runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.npmrc ./.npmrc
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/patches ./patches

COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/static ./.medusa/server/static

COPY --from=deps /app/node_modules ./node_modules

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
