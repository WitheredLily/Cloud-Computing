<?php

function getTotalEmptyIPs($items)
{
    $error = false;
  $ips = explode(",", $items);
  $total_empty_ips = 0;
  for ($i = 0; $i < count($ips); $i++) {
    if ($ips[$i] == ""){
        $total_empty_ips += 1;
    } else if (filter_var($ips[$i], FILTER_VALIDATE_IP) !== True){
        $error = true;
    }
  }
  return [$total_empty_ips, $error];
}
