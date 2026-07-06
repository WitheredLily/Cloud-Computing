<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'functions.inc.php';

$items = $_REQUEST['items'];

$output = [
    "error" => false,
    "items" => $items,
    "IPType" => classifyIPs($items)
];

echo json_encode($output);
exit();