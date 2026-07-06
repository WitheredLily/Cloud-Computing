<?php
namespace Ipv6Extractor;

function invalidIPv6(){
    return "The provided IP address is not an IPv6 address.";
}

function invalidIP(){
    return "Invalid IP address.";
}


function isIPv6($ip){
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false;
}

function isIP($ip){
    return filter_var($ip, FILTER_VALIDATE_IP);
}

function expandedIPv6($ip){
    if (!isIP($ip)) {
        return invalidIP();
    }
    if (!isIPv6($ip)) {
        return invalidIPv6();
    }
    $groups = explode(":", $ip);
    $expanded_ip = array();
    $double_size = 9 - (count($groups));
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
    return implode(":", $expanded_ip);
}

function expandIPv6s($ips){
    return array_map(__NAMESPACE__ . "\\expandedIPv6", explode(",", preg_replace('/\s+/', '', $ips)));
}