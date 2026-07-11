<?php
require_once __DIR__ . '/../../utility/ip-functions.inc.php';

use function IpFunctions\isIP;
use function IpFunctions\isIPv4;
use function IpFunctions\invalidIP;
use function IpFunctions\invalidIPv4;
use IpFunctions\ip_type;

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
    return array_map(__NAMESPACE__ . "\\classifyIP", explode(",", preg_replace('/\s+/', '', $ips)));
}


