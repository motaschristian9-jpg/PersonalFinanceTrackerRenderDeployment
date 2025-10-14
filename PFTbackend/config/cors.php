<?php

// Read FRONTEND_URL from .env; supports multiple origins separated by commas
$frontend = env('FRONTEND_URL', '*');
$allowed_origins = is_string($frontend) && strpos($frontend, ',') !== false
    ? array_map('trim', explode(',', $frontend))
    : [$frontend];

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowed_origins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

