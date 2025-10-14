# ---------- Stage 1: Composer Dependencies ----------
FROM php:8.2-fpm-alpine AS vendor

RUN apk add --no-cache git unzip libzip-dev curl bash \
    && docker-php-ext-install zip pdo pdo_mysql \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader


# ---------- Stage 2: Node Build for Frontend (Vite) ----------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# ---------- Stage 3: Runtime (Nginx + PHP-FPM) ----------
FROM php:8.2-fpm-alpine AS runtime

# Install Nginx, PHP extensions, and envsubst (gettext)
RUN apk add --no-cache nginx bash git unzip libzip-dev libpng-dev libxml2-dev oniguruma-dev curl gettext \
    && docker-php-ext-install pdo pdo_mysql zip bcmath \
    && mkdir -p /run/nginx /var/www/html

WORKDIR /var/www/html

# Copy Laravel app and built assets
COPY --from=vendor /app ./
COPY --from=frontend /app/public/build ./public/build

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Render automatically assigns a port via $PORT
EXPOSE 80

# Start both PHP-FPM and Nginx with envsubst for dynamic port
CMD php-fpm & \
    envsubst '\$PORT' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp && \
    mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf && \
    nginx -g 'daemon off;'
