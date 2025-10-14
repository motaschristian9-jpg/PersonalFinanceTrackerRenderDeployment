<?php

// Read FRONTEND_URL from .env; supports multiple origins separated by commas
$frontend = env('FRONTEND_URL', '*');
$allowed_origins = is_string($frontend) && strpos($frontend, ',') !== false
    ? array_map('trim', explode(',', $frontend))
    : [$frontend];

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'], // routes to allow CORS on

    'allowed_methods' => ['*'],                  // all HTTP methods
    'allowed_origins' => $allowed_origins,       // dynamically allow origins
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],                  // allow all headers
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,             // allow cookies / auth
];
