<?php

require_once __DIR__ . '/../../utility/ip-functions.inc.php';
use function IpFunctions\isIP;
use function IpFunctions\isIPv6;
use function IpFunctions\invalidIP;
use function IpFunctions\invalidIPv6;

function expandedIPv6($ip){
    if (!isIP($ip)) {
        return [invalidIP(), true];
    }
    if (!isIPv6($ip)) {
        return [invalidIPv6(), true];
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
    return [implode(":", $expanded_ip), false];
}

function expandIPv6s($ips): array
{
    return array_map(__NAMESPACE__ . "\\expandedIPv6", explode(",", preg_replace('/\s+/', '', $ips)));
}