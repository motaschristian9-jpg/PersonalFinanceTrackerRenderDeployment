<?php

$frontend = env('FRONTEND_URL', '*');
$allowed_origins = is_string($frontend) && strpos($frontend, ',') !== false
    ? array_map('trim', explode(',', $frontend))
    : [$frontend];

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowed_origins,
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // JWT does not need cookies
];
