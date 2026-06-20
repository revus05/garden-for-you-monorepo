FROM oven/bun:1.2-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are inlined at build, so all required
# public vars must be passed here — see env.ts validation)
ARG NEXT_PUBLIC_MEDUSA_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_REGION_ID
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CONTENT_TABLE_URL

ENV NEXT_PUBLIC_MEDUSA_URL=$NEXT_PUBLIC_MEDUSA_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_REGION_ID=$NEXT_PUBLIC_REGION_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CONTENT_TABLE_URL=$NEXT_PUBLIC_CONTENT_TABLE_URL

RUN bun run build

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["bun", "run", "start"]
