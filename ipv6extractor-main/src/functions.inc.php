<?php

function expandedIPv6($ip){
    if (!isIP($ip)) {
        return [invalidIP(), true, -1, -1];
    }
    if (!isIPv6($ip)) {
        return [invalidIPv6(), true, -1, -1];
    }
    $groups = explode(":", $ip);
    $group_size = count($groups);
    $expanded_ip = array();
    $double_size = 9 - ($group_size);
    $found_empty = false;
    foreach ($groups as $group) {
        if (strlen($group) == 0 && !$found_empty) {
            $found_empty = true;
            for ($i = 0; $i < $double_size; $i++) {
                $expanded_ip[] = "0000";
            }
        } else {
            $expanded_ip[] = str_repeat("0", 4 - strlen($group)).$group;
        }
    }
    return [implode(":", $expanded_ip), false, $group_size, count($expanded_ip)];
}

function expandIPv6s($ips): array
{
    return array_map(__NAMESPACE__ . "\\expandedIPv6", explode(",", preg_replace('/\s+/', '', $ips)));
}

function isIPv6($ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false;
}

function isIP($ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP) !== false;
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