<?php
require_once 'functions.inc.php';

use PHPUnit\Framework\TestCase;
use function Ipv6Extractor\expandedIPv6;
use function Ipv6Extractor\expandIPv6s;
use function Ipv6Extractor\invalidIP;
use function Ipv6Extractor\invalidIPv6;


use PHPUnit\Event\Test\Failed;
use PHPUnit\Event\Test\FailedSubscriber;

final class Ipv6FailureLogger implements FailedSubscriber
{
    public function notify(Failed $event): void
    {
        $test = $event->test();
        $throwable = $event->throwable();

        // Only target your specific test class/method
        if ($test->className() !== expandedIPv6Test::class) {
            return;
        }

        error_log("IPv6 test failed:");
        error_log("Test: " . $test->name());
        error_log("Message: " . $throwable->getMessage());

        // optional: dump full exception trace
        error_log($throwable->getTraceAsString());
    }
}

final class expandedIPv6Test extends TestCase {
    public function ipDataProvider(){
        return [
            ["Expanded IPv6", '2001:0db8:85a3:0000:0000:8a2e:0370:7334', '2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
            ["Compressed IPv6", '0001:db8:a3::8a2e:0:7334', '0001:0db8:00a3:0000:0000:8a2e:0000:7334'],
            ["Compressed at start IPv6", '::85a3:0000:0000:8a2e:0370:7334', '0000:0000:85a3:0000:0000:8a2e:0370:7334'],
            ["Compressed at end IPv6", '2001:0db8:85a3:0000:8a2e:0370::', '2001:0db8:85a3:0000:8a2e:0370:0000:0000'],
            ["Invalid IPv6", 'NonsenseIP', invalidIP()],
            ["IPv4", '192.168.1.1', invalidIPv6()],
            ["IPv4 with port", '192.168.1.1:80', invalidIP()],
            ["IPv4 with port and path", '192.168.1.1:80/path', invalidIP()],
            ["IPv4 with path", '192.168.1.1/path', invalidIP()],
            ["Double Compressed IPv6", '::85a3:0000::8a2e:0370:7334', invalidIP()],
            ["IPv6 with port", '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:80', invalidIP()]
        ];
    }

    public function testExpandedIPv6() {
        foreach ($this->ipDataProvider() as $test) {
            $ip = $test[1];
            $expected = $test[2];
            $this->assertSame($expected, expandedIPv6($ip));
        }
    }

    public function testExpandIPv6s() {
        $ips = implode(',', array_column($this->ipDataProvider(), 1));
        $result = expandIPv6s($ips);

        $this->assertSame(array_column($this->ipDataProvider(), 2), $result);
    }
}