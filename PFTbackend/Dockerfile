# ---------- Stage 1: Composer Dependencies ----------
FROM php:8.2-fpm-alpine AS vendor

# Install PHP extensions and Composer
RUN apk add --no-cache git unzip libzip-dev curl bash \
    && docker-php-ext-install zip pdo pdo_mysql \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copy all source files first (artisan needed for post-autoload scripts)
COPY . .

# Install dependencies (production only)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader


# ---------- Stage 2: Node Build for Frontend (Vite) ----------
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci)
RUN npm install

# Copy source files for frontend build
COPY . .

# Build assets
RUN npm run build


# ---------- Stage 3: Runtime PHP-FPM ----------
FROM php:8.2-fpm-alpine AS runtime

# Install required PHP extensions and system packages
RUN apk add --no-cache \
    git unzip libzip-dev libpng-dev libxml2-dev curl oniguruma-dev bash \
    && docker-php-ext-install pdo pdo_mysql zip bcmath \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

# Copy Laravel app with vendor dependencies
COPY --from=vendor /app ./

# Copy built frontend assets from Node stage
COPY --from=frontend /app/public/build ./public/build

# Fix permissions for Laravel writable directories
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]