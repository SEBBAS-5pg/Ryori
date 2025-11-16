# ryori/app/Dockerfile

# --- Stage 1: Dependencias ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY src ./src
COPY public ./public

# Ejecuta el build
RUN npm run build

# --- ¡ESTE ES EL PASO DE DEPURACIÓN CRUCIAL! ---
# Vamos a listar el contenido de la carpeta .next
RUN echo "Contenido de /app/.next:" && ls -la /app/.next
# --- FIN DEL PASO DE DEPURACIÓN ---

# --- Stage 3: Final (Producción) ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
# ¡El comando que falla!
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]