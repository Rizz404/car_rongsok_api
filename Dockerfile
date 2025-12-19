# Use Bun's official image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
# Copy lockfile if it exists
COPY --chown=bun:bun bun.lock /temp/dev/bun.lock
RUN cd /temp/dev && bun install

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
# Copy lockfile if it exists
COPY --chown=bun:bun bun.lock /temp/prod/bun.lock
RUN cd /temp/prod && bun install --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
# RUN bun test
# RUN bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/drizzle ./drizzle

# Expose port (Railway akan set PORT env variable)
EXPOSE 3000

# Run the app
USER bun
CMD ["bun", "run", "src/index.ts"]
