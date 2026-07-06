<?php
namespace Ipv4PrivateDetector;

function isIPv4($ip){
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false;
}

function isIP($ip){
    return filter_var($ip, FILTER_VALIDATE_IP);
}

function invalidIPv4(){
    return "The provided IP address is not an IPv4 address.";
}

function invalidIP(){
    return "Invalid IP address.";
}

class ip_type {
    const Type_Private    = "Private";
    const Type_Loopback    = "Loopback";
    const Type_Public   = "Public";
}

function classifyIP($ip){
    if (!isIP($ip)) {
        return invalidIP();
    }
    if (!isIPv4($ip)) {
        return invalidIPv4();
    }
    $octets = explode(".", $ip);
    if (($octets[0] == 192 && $octets[1] == 168) || $octets[0] == 10) {
        return ip_type::Type_Private;
    } else if ($octets[0] == 127) {
        return ip_type::Type_Loopback;
    } else {
        return ip_type::Type_Public;
    }
}

function classifyIPs($ips){
    return array_map(__NAMESPACE__ . "\\classifyIP", explode(",", preg_replace('/\s+/', '', $ips)));
}


