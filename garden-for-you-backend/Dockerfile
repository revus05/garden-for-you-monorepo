FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=deps /app/node_modules ./node_modules

COPY --from=build /app/.medusa ./.medusa

COPY --from=build /app/medusa-config.ts ./medusa-config.ts
COPY --from=build /app/src ./src
COPY --from=build /app/static ./.medusa/server/static

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
