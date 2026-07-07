<?php

use function Ipv4PrivateDetector\classifyIPs;

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
$ipClasses = classifyIPs($items);
$error = in_array(true, array_column($ipClasses, 1));
$output = [
    "error" => $error,
    "items" => $items,
    "IPType" => array_column($ipClasses, 0)
];

echo json_encode($output);
exit();