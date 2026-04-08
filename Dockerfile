FROM oven/bun:1 AS builder

WORKDIR /app

# Build arguments (needed at nuxt build time)
ARG NUXT_PROXY_TARGET=http://host.docker.internal
ARG MIDTRANS_CLIENT_KEY=

# Set as env vars so nuxt.config.ts can read them during build
ENV NUXT_PROXY_TARGET=$NUXT_PROXY_TARGET
ENV MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY

# Copy dependency files first
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Nuxt for production (SSR)
RUN bun run build

FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy only the built output
COPY --from=builder /app/.output .output

# Nuxt SSR server listens on port 3000 by default
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Start the Nuxt production server
CMD ["bun", ".output/server/index.mjs"]
