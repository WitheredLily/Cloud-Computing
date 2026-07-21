<?php
require_once 'functions.inc.php';

use PHPUnit\Framework\TestCase;

final class expandedIPv6Test extends TestCase {
    public function ipDataProvider(): array
    {
        return [
            ["Expanded IPv6", '2001:0db8:85a3:0000:0000:8a2e:0370:7334', '2001:0db8:85a3:0000:0000:8a2e:0370:7334', false],
            ["Compressed IPv6", '0001:db8:a3::8a2e:0:7334', '0001:0db8:00a3:0000:0000:8a2e:0000:7334', false],
            ["Compressed at start IPv6", '::85a3:0000:0000:8a2e:0370:7334', '0000:0000:85a3:0000:0000:8a2e:0370:7334', false],
            ["Compressed at end IPv6", '2001:0db8:85a3:0000:8a2e:0370::', '2001:0db8:85a3:0000:8a2e:0370:0000:0000', false],
            ["Invalid IPv6", 'NonsenseIP', invalidIP(), true],
            ["IPv4", '192.168.1.1', invalidIPv6(), true],
            ["IPv4 with port", '192.168.1.1:80', invalidIP(), true],
            ["IPv4 with port and path", '192.168.1.1:80/path', invalidIP(), true],
            ["IPv4 with path", '192.168.1.1/path', invalidIP(), true],
            ["Double Compressed IPv6", '::85a3:0000::8a2e:0370:7334', invalidIP(), true],
            ["IPv6 with port", '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:80', invalidIP(), true],

        ];
    }

    public function testExpandedIPv6() {
        foreach ($this->ipDataProvider() as $test) {
            $result = expandedIPv6($test[1]);
            $this->assertSame($test[2], $result[0], $test[0] . " -> Expected: {$test[2]}, Got: {$result[0]}");
            $this->assertSame($test[3], $result[1], $test[0] . " -> Expected: {$test[3]}, Got: {$result[1]}");
        }
    }

    public function testMixedExpandIPv6s() {
        $ips = implode(',', array_column($this->ipDataProvider(), 1));
        $result = expandIPv6s($ips);

        $this->assertSame(array_column($this->ipDataProvider(), 2), array_column($result, 0), "Mixed - Failed to expand IPv6 addresses");
        $this->assertSame(in_array(true,array_column($this->ipDataProvider(), 3)), in_array(true, array_column($result, 1)), "Failed to flag invalid IPv6 addresses");
    }

    public function testCorrectExpandIPv6s() {
        $filtered = array_filter($this->ipDataProvider(), function ($var) {
            return ($var[3] == false);
        });
        $ips = implode(',', array_column($filtered, 1));
        $result = expandIPv6s($ips);

        $this->assertSame(array_column($filtered, 2), array_column($result, 0), "Correct - Failed to expand IPv6 addresses");
        $this->assertSame(false, in_array(true, array_column($result, 1)), "Incorrectly flagged IPv6 addresses");
    }
}