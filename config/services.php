<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'dokploy' => [
        'url' => env('DOKPLOY_API_URL'),
        'key' => env('DOKPLOY_API_KEY'),
        'webhook_secret' => env('DOKPLOY_WEBHOOK_SECRET'),
        'server_ip' => env('DOKPLOY_SERVER_IP', '192.168.2.254'),
    ],

    'cloudflare' => [
        'token' => env('CLOUDFLARE_API_TOKEN'),
        'zone_id' => env('CLOUDFLARE_ZONE_ID'),
        'tunnel_target' => env('CLOUDFLARE_TUNNEL_TARGET'),
    ],

    'uptime_kuma' => [
        'url' => env('UPTIME_KUMA_URL'),
        'key' => env('UPTIME_KUMA_API_KEY'),
    ],

    'hyperswitch' => [
        'url' => env('HYPERSWITCH_API_URL'),
        'secret' => env('HYPERSWITCH_SECRET_KEY'),
        'webhook_secret' => env('HYPERSWITCH_WEBHOOK_SECRET'),
    ],

    'proxmox' => [
        'url' => env('PROXMOX_URL'),
        'token' => env('PROXMOX_TOKEN'),
        'node' => env('PROXMOX_NODE', 'pve'),
    ],

    'pricing' => [
        'rates' => [
            'cpu' => (float) env('PRICING_RATE_CPU', 50.0),
            'ram' => (float) env('PRICING_RATE_RAM', 50.0),
            'storage' => (float) env('PRICING_RATE_STORAGE', 2.0),
        ]
    ],

];
