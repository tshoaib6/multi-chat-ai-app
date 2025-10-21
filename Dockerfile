# Multi-stage build: build frontend with Vite, then run Express server serving API + static UI

# ---------- Frontend build ----------
FROM node:20-alpine AS frontend
WORKDIR /app

# Install deps for frontend build
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm ci || yarn install || pnpm install

# Copy sources and build
COPY . .
RUN npm run build || yarn build || pnpm build

# Vite outputs to dist/

# ---------- Runtime image ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy server package files and install only production deps
COPY server/package.json ./server/package.json
COPY package.json ./package.json

# Install production deps for server (and needed shared deps)
RUN npm ci --omit=dev || yarn install --production || pnpm install --prod

# Copy server source
COPY server ./server

# Copy built frontend into server/public so Express can serve it
COPY --from=frontend /app/dist ./server/public

# Expose server port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production
WORKDIR /app/server

# Start the Express server
CMD ["node", "index.js"]
