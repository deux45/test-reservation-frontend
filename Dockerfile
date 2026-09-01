# syntax=docker/dockerfile:1.9
# Production image. Relies on `output: 'standalone'` in next.config.ts.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is compiled into the browser bundle AT BUILD TIME. Passing it
# as `environment:` in docker-compose has no effect on the shipped JavaScript,
# which is the most common mistake when dockerising Next.js. Hence a build-arg:
# the image is environment-specific by construction.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0

# The three pieces standalone output produces, and nothing else.
COPY --from=build --chown=node:node /app/public           ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static     ./.next/static

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
