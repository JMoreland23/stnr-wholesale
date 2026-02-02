FROM node:20-bookworm

WORKDIR /app/storefront

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copy storefront files
COPY package.json yarn.lock ./

# Configure standalone Yarn (non-workspace)
RUN yarn config set enableGlobalCache false && \
    yarn config set nodeLinker node-modules

# Install dependencies
RUN yarn install --no-immutable

# Copy the rest of the storefront code
COPY . .

# Set the Backend URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ENV NEXT_TELEMETRY_DISABLED=1

# Default port for the storefront. Coolify can override with an environment variable.
ENV PORT=3000
EXPOSE 3000

# Run in development mode (no build required). Use shell form so $PORT is expanded.
CMD sh -c "./node_modules/.bin/next dev -p ${PORT} -H 0.0.0.0"
