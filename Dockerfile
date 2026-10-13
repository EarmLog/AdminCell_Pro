# ============================================================================
#  Dockerfile de AdminCell Pro
# ----------------------------------------------------------------------------
#  Contenedor Docker multi-etapa para la aplicación Next.js:
#    - dependencias : instala las dependencias de Node.js.
#    - desarrollo   : servidor de desarrollo (usado por docker-compose).
#    - build        : genera la exportación estática (carpeta `out/`).
#    - produccion   : sirve el sitio estático con Nginx.
# ============================================================================

# ---- Etapa 1: dependencias compartidas ----
FROM node:20-alpine AS dependencias
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json ./
RUN npm install

# ---- Etapa 2: entorno de desarrollo ----
FROM node:20-alpine AS desarrollo
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Etapa 3: compilación de la exportación estática ----
FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Etapa 4: producción (sitio estático con Nginx) ----
FROM nginx:1.27-alpine AS produccion
COPY --from=build /app/out /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
