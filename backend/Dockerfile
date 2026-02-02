# We use Bookworm (Debian) instead of Alpine to ensure the patch utility works correctly
FROM node:20-bookworm

WORKDIR /server

# Enable Corepack
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copy everything FIRST (including your local .yarn/patches folder)
# This is key: Yarn needs your local patch files to apply them inside Docker
COPY . .

# Force the linker and install
# We use --no-immutable to allow Yarn to adjust to the Linux environment
RUN yarn config set nodeLinker node-modules && \
    yarn install --no-immutable

RUN chmod +x ./start.sh && test -f ./worker.sh && chmod +x ./worker.sh || true

# Expose the port Medusa runs on
EXPOSE 9000 5173

# Set default mode to server, can be overridden to "worker"
ENV SERVER_MODE=server

# Start with migrations and then the appropriate mode (server or worker)
CMD if [ "$SERVER_MODE" = "worker" ]; then ./worker.sh; else ./start.sh; fi
