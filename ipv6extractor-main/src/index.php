<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'functions.inc.php';
require_once __DIR__ . '/../../utility/ip-functions.inc.php';
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
    "expandedIPs" => $ips
];

echo json_encode($output);
exit();