<?php
namespace Ipv4PrivateDetector;

function isIPv4($ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
}

function isIP($ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP) !== false;
}

function invalidIPv4(): string
{
    return "The provided IP address is not an IPv4 address.";
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

function classifyIP($ip){
    if (!isIP($ip)) {
        return [invalidIP(),true];
    }
    if (!isIPv4($ip)) {
        return [invalidIPv4(),true];
    }
    $octets = explode(".", $ip);
    if (($octets[0] == 192 && $octets[1] == 168) || $octets[0] == 10) {
        return [ip_type::Type_Private, false];
    } else if ($octets[0] == 127) {
        return [ip_type::Type_Loopback, false];
    } else {
        return [ip_type::Type_Public, false];
    }
}

function classifyIPs($ips): array
{
    return [array_map(__NAMESPACE__ . "\\classifyIP", explode(",", preg_replace('/\s+/', '', $ips))), $error];
}


