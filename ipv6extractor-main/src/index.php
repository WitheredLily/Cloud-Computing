<?php

use function Ipv6Extractor\expandIPv6s;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'functions.inc.php';
$items = $_REQUEST['items'];

if(empty($items)){
    http_response_code(422);
    $output = [
        "error" => true,
        "message" => "No IP addresses provided."
    ];
}

$output = [
    "error" => false,
    "items" => $items,
    "expandedIPs" => expandIPv6s($items)
];

echo json_encode($output);
exit();