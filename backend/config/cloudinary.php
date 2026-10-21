<?php

return [
    'url' => env('CLOUDINARY_URL'),
    'enabled' => (bool) env('CLOUDINARY_ENABLED', false),
    'cloud_name' => parse_url((string) env('CLOUDINARY_URL'), PHP_URL_HOST) ?: env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => parse_url((string) env('CLOUDINARY_URL'), PHP_URL_USER) ?: env('CLOUDINARY_API_KEY'),
    'api_secret' => parse_url((string) env('CLOUDINARY_URL'), PHP_URL_PASS) ?: env('CLOUDINARY_API_SECRET'),
    'folder' => env('CLOUDINARY_FOLDER', 'visitflow/places'),
];
