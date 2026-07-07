<?php

use function Ipv6Extractor\expandIPv6s;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'functions.inc.php';
$items = $_REQUEST['items'] ?? '';

if(empty($items)){
    http_response_code(422);
    $output = [
        "error" => true,
        "message" => "No IP addresses provided."
    ];
    echo json_encode($output);
    exit();
}
$ips = expandIPv6s($items);
$error = in_array(true, array_column($ips, 1));
$output = [
    "error" => $error,
    "items" => $items,
    "expandedIPs" => array_column($ips, 0)
];

echo json_encode($output);
exit();