<?php
namespace IpFunction;

use RuntimeException;

function isIPv4($ip): bool
{
return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
}

function isIPv6($ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false;
}

function isIP($ip): bool
{
return filter_var($ip, FILTER_VALIDATE_IP) !== false;
}

function invalidIPv4(): string
{
return "The provided IP address is not an IPv4 address.";
}

function invalidIPv6(): string
{
    return "The provided IP address is not an IPv6 address.";
}

function invalidIP(): string
{
    return "Invalid IP address.";
}

class ip_type {
    const string Type_Private    = "Private";
    const string Type_Loopback    = "Loopback";
    const string Type_Public   = "Public";
}

function loadUrls(): array
{
    $file = __DIR__ . '../src/config.json';

    if (!file_exists($file)) {
        throw new RuntimeException("config.json not found: $file");
    }

    $json = file_get_contents($file);

    $urls = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException(json_last_error_msg());
    }

    return $urls;
}