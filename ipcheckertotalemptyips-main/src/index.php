<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");
require('functions.inc.php');

$items = $_REQUEST['items'];
$total_empty_ips=getTotalEmptyIPs($items);

if(empty($items)){
    http_response_code(422);
    $output = [
        "error" => true,
        "message" => "No IP addresses provided."
    ];
}


$output = array(
    "error" => $total_empty_ips[1],
    "items" => $items,
    "total_empty_ips" => $total_empty_ips[0]
);


echo json_encode($output);
exit();
