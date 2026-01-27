FROM node:20-bookworm

WORKDIR /app/storefront

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copy storefront files
COPY storefront/package.json storefront/yarn.lock ./

# Configure standalone Yarn (non-workspace)
RUN yarn config set enableGlobalCache false && \
    yarn config set nodeLinker node-modules

# Install dependencies
RUN yarn install --no-immutable

# Copy the rest of the storefront code
COPY storefront .

# Set the Backend URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 8000

# Run in development mode (no build required)
CMD ["./node_modules/.bin/next", "dev", "-p", "8000", "-H", "0.0.0.0"]
