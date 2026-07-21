<?php
require_once 'functions.inc.php';

use PHPUnit\Framework\TestCase;

final class privateDetectorTest extends TestCase {
    public function ipDataProvider(): array
    {
        return [
            ['Private Ipv4 1', '192.168.1.1', ip_type::Type_Private, false],
            ['Private Ipv4 2', '10.0.0.1', ip_type::Type_Private, false],
            ['Public Ipv4 1', '0.0.0.0', ip_type::Type_Public, false],
            ['Public Ipv4 2', '8.8.8.8', ip_type::Type_Public, false],
            ['Public Ipv4 3', '172.16.58.3', ip_type::Type_Public, false],
            ['Loopback Ipv4', '127.0.0.1', ip_type::Type_Loopback, false],
            ['Invalid Ipv4 1', '192.168.1', invalidIP(), true],
            ['Invalid Ipv4 2', '192.168.1.1.1', invalidIP(), true],
            ['Invalid Ipv4 3', '-3.168.1.1.1', invalidIP(), true],
            ['Invalid Ipv4 4', 'Non.sense.IP.Adress', invalidIP(), true],
            ["Expanded IPv6", '2001:0db8:85a3:0000:0000:8a2e:0370:7334', invalidIPv4(), true],
            ["Compressed IPv6", '0001:db8:a3::8a2e:0:7334', invalidIPv4(), true],
            ["Compressed at start IPv6", '::85a3:0000:0000:8a2e:0370:7334', invalidIPv4(), true],
            ["Compressed at end IPv6", '2001:0db8:85a3:0000:8a2e:0370::', invalidIPv4(), true],
            ["IPv4 with port", '192.168.1.1:80', invalidIP(), true],
            ["IPv4 with port and path", '192.168.1.1:80/path', invalidIP(), true],
            ["IPv4 with path", '192.168.1.1/path', invalidIP(), true],
            ["Double Compressed IPv6", '::85a3:0000::8a2e:0370:7334', invalidIP(), true],
            ["IPv6 with port", '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:80', invalidIP(), true],
            ["Boundary - Lowest 10.x Private", "10.0.0.0", ip_type::Type_Private, false],
            ["Boundary - Highest 10.x Private", "10.255.255.255", ip_type::Type_Private, false],
            ["Boundary - Just Outside 10.x", "11.0.0.0", ip_type::Type_Public, false],
            ["Boundary - Lowest 192.168 Private", "192.168.0.0", ip_type::Type_Private, false],
            ["Boundary - Highest 192.168 Private", "192.168.255.255", ip_type::Type_Private, false],
            ["Boundary - Below 192.168 Range", "192.167.255.255", ip_type::Type_Public, false],
            ["Boundary - Above 192.168 Range", "192.169.0.0", ip_type::Type_Public, false],
            ["Boundary - Lowest Loopback", "127.0.0.0", ip_type::Type_Loopback, false],
            ["Boundary - Highest Loopback", "127.255.255.255", ip_type::Type_Loopback, false],
            ["Boundary - Just Below Loopback", "126.255.255.255", ip_type::Type_Public, false],
            ["Boundary - Just Above Loopback", "128.0.0.0", ip_type::Type_Public, false],
        ];
    }

    public function testClassifyIPv4() {
        foreach ($this->ipDataProvider() as $test) {
            $ip_type = classifyIP($test[1]);

            $this->assertSame($test[2], $ip_type[0], $test[0] . " -> Expected: {$test[2]}, Got: {$ip_type[0]}");
            $this->assertSame($test[3], $ip_type[1], $test[0] . " -> Expected: {$test[3]}, Got: {$ip_type[1]}");
        }
    }

    public function testClassifyIPv4s() {
        $ips = implode(',', array_column($this->ipDataProvider(), 1));
        $result = classifyIPs($ips);

        $this->assertSame(array_column($this->ipDataProvider(), 2), array_column($result, 0), "Failed to classify IPv4 addresses");
        $this->assertSame(in_array(true,array_column($this->ipDataProvider(), 3)), in_array(true, array_column($result, 1)), "Failed to flag invalid IPv4 addresses");
    }
}