<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");
require_once('functions.inc.php');

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

$total_ips=getTotalIPs($items);

$output = array(
    "error" => false,
    "items" => $items,
    "total_ips" => $total_ips
);
echo json_encode($output);
exit();
