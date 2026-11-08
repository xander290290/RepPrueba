FROM php:8.5-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite

COPY app/ /var/www/app/
COPY public/ /var/www/html/

WORKDIR /var/www/html
