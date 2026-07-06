<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");
require('functions.inc.php');


if(empty($items)){
    http_response_code(422);
    $output = [
        "error" => true,
        "message" => "No IP addresses provided."
    ];
}

$items = $_REQUEST['items'];
$total_ips=getTotalIPs($items);

$output = array(
    "error" => false,
    "items" => $items,
    "total_ips" => $total_ips
);
echo json_encode($output);
exit();
