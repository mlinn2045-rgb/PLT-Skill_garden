FROM php:8.3-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY . /var/www/html

# Configure Apache DocumentRoot to point to Backend directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/conf-available/*.conf

# Set permissions for uploads directory
RUN mkdir -p /var/www/html/public/uploads/videos && chmod -R 777 /var/www/html/public/uploads

EXPOSE 80
