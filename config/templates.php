<?php

return [
    'wordpress' => [
        'name' => 'WordPress CMS',
        'description' => 'Deploy a full WordPress website linked to a MySQL database in one click.',
        'project_type' => 'application',
        'build_strategy' => 'nixpacks',
        'repository_url' => 'https://github.com/WordPress/WordPress',
        'repository_branch' => 'master',
        'install_command' => null,
        'build_command' => null,
        'database_type' => 'mysql',
        'container_port' => 80,
        'env_vars' => [
            ['key' => 'WP_DEBUG', 'value' => 'false']
        ],
        'volumes' => [
            ['name' => 'wp_content', 'path' => '/var/www/html/wp-content']
        ]
    ],
    'wordpress_pro' => [
        'name' => 'WordPress Pro (Redis Cached)',
        'description' => 'High-performance WordPress template equipped with Redis caching and isolated database.',
        'project_type' => 'compose',
        'build_strategy' => 'nixpacks',
        'repository_url' => null,
        'repository_branch' => null,
        'install_command' => null,
        'build_command' => null,
        'database_type' => 'none',
        'container_port' => 80,
        'env_vars' => [],
        'volumes' => [],
        'compose_file' => 'version: "3.8"
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "80:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: super_secure_db_pass_123
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_CONFIG_EXTRA: |
        define("WP_REDIS_HOST", "redis");
        define("WP_CACHE", true);
    volumes:
      - wp_data:/var/www/html
    depends_on:
      - db
      - redis

  db:
    image: mariadb:10.5
    environment:
      MYSQL_ROOT_PASSWORD: super_secure_db_pass_123
      MYSQL_DATABASE: wordpress
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:alpine
volumes:
  wp_data:
  db_data:'
    ],
    'laravel' => [
        'name' => 'Laravel PHP Framework',
        'description' => 'Fast deployment for clean PHP web applications with auto-configured DB.',
        'project_type' => 'application',
        'build_strategy' => 'nixpacks',
        'repository_url' => 'https://github.com/laravel/laravel',
        'repository_branch' => '11.x',
        'install_command' => 'composer install && npm install',
        'build_command' => 'npm run build',
        'database_type' => 'mysql',
        'container_port' => 80,
        'env_vars' => [
            ['key' => 'APP_ENV', 'value' => 'production'],
            ['key' => 'APP_DEBUG', 'value' => 'false'],
            ['key' => 'APP_KEY', 'value' => 'GENERATE_KEY']
        ],
        'volumes' => []
    ],
    'nodejs' => [
        'name' => 'Node.js / Express',
        'description' => 'Deploy robust, scalable backend APIs or web servers.',
        'project_type' => 'application',
        'build_strategy' => 'nixpacks',
        'repository_url' => 'https://github.com/expressjs/express',
        'repository_branch' => 'master',
        'install_command' => 'npm install',
        'build_command' => 'npm run build',
        'database_type' => 'none',
        'container_port' => 3000,
        'env_vars' => [
            ['key' => 'NODE_ENV', 'value' => 'production']
        ],
        'volumes' => []
    ],
    'react' => [
        'name' => 'React Static (Vite)',
        'description' => 'Ultra-fast deployment for modern frontend static sites.',
        'project_type' => 'application',
        'build_strategy' => 'nixpacks',
        'repository_url' => 'https://github.com/vitejs/vite',
        'repository_branch' => 'main',
        'install_command' => 'npm install',
        'build_command' => 'npm run build',
        'database_type' => 'none',
        'container_port' => 3000,
        'env_vars' => [],
        'volumes' => []
    ]
];
