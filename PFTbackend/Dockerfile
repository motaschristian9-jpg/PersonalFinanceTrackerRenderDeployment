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

# Install Nginx and PHP extensions
RUN apk add --no-cache nginx bash git unzip libzip-dev libpng-dev libxml2-dev oniguruma-dev curl \
    && docker-php-ext-install pdo pdo_mysql zip bcmath \
    && mkdir -p /run/nginx

WORKDIR /var/www/html

# Copy Laravel app and built assets
COPY --from=vendor /app ./
COPY --from=frontend /app/public/build ./public/build

# Copy your Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose the port Render expects
EXPOSE 80

# Start both PHP-FPM and Nginx together
CMD php-fpm & nginx -g 'daemon off;'
