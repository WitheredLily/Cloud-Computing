<?php
require_once 'functions.inc.php';

use Ipv4PrivateDetector\ip_type;
use function Ipv4PrivateDetector\classifyIP;
use function Ipv4PrivateDetector\classifyIPs;
use function Ipv4PrivateDetector\invalidIP;
use function Ipv4PrivateDetector\invalidIPv4;

use PHPUnit\Framework\TestCase;

final class privateDetectorTest extends TestCase {
    public function ipDataProvider(){
        return [
            ['Private Ipv4 1', '192.168.1.1', ip_type::Type_Private],
            ['Private Ipv4 2', '10.0.0.1', ip_type::Type_Private],
            ['Public Ipv4 1', '192.168.1.2', ip_type::Type_Private],
            ['Public Ipv4 2', '0.0.0.0', ip_type::Type_Public],
            ['Public Ipv4 3', '8.8.8.8', ip_type::Type_Public],
            ['Public Ipv4 4', '172.16.58.3', ip_type::Type_Public],
            ['Loopback Ipv4', '127.0.0.1', ip_type::Type_Loopback],
            ['Invalid Ipv4 1', '192.168.1', invalidIP()],
            ['Invalid Ipv4 2', '192.168.1.1.1', invalidIP()],
            ['Invalid Ipv4 3', '-3.168.1.1.1', invalidIP()],
            ['Invalid Ipv4 4', 'Non.sense.IP.Adress', invalidIP()],
            ["Expanded IPv6", '2001:0db8:85a3:0000:0000:8a2e:0370:7334', invalidIPv4()],
            ["Compressed IPv6", '0001:db8:a3::8a2e:0:7334', invalidIPv4()],
            ["Compressed at start IPv6", '::85a3:0000:0000:8a2e:0370:7334', invalidIPv4()],
            ["Compressed at end IPv6", '2001:0db8:85a3:0000:8a2e:0370::', invalidIPv4()],
            ["IPv4 with port", '192.168.1.1:80', invalidIP()],
            ["IPv4 with port and path", '192.168.1.1:80/path', invalidIP()],
            ["IPv4 with path", '192.168.1.1/path', invalidIP()],
            ["Double Compressed IPv6", '::85a3:0000::8a2e:0370:7334', invalidIP()],
            ["IPv6 with port", '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:80', invalidIP()]
        ];
    }

    public function testExpandedIPv4() {
        foreach ($this->ipDataProvider() as $test) {
            $ip = $test[1];
            $expected = $test[2];
            $this->assertSame($expected, classifyIP($ip), $test[0]);
        }
    }

    public function testExpandIPv4s() {
        $ips = implode(',', array_column($this->ipDataProvider(), 1));
        $result = classifyIPs($ips);

        $this->assertSame(array_column($this->ipDataProvider(), 2), $result, "Failed to classify IPv4 addresses");
    }
}