<?php

require_once __DIR__ . '/ip-functions.inc.php';

use PHPUnit\Framework\TestCase;
use function IpFunction\invalidIP;
use function IpFunction\invalidIPv6;
use function IpFunction\invalidIPv4;
use IpFunction\ip_type;
use function IpFunction\loadUrls;

final class HttpTest  extends TestCase
{
    private array $urls;
    public static function decompressIPv6DataProvider(){
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

    public static function privateDetectorDataProvider()
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
    public function setUp(): void{
        $this->urls = loadUrls();
    }

    public function testExpandingIPv6s()
    {
        $data = $this->decompressIPv6DataProvider();
        $ipsToExpand = implode(',', array_column($data, 1));
        $expectedIps =  array_column($data, 2);
        $serviceUrls = $this->urls['urls']['ipv6extractor']['urls'];
        $this->assertIsArray($serviceUrls, "Service URLs for IPv6 Extractor should be an array. Received: " . $serviceUrls);
        foreach ($serviceUrls as $url) {
            $response = file_get_contents($url . "?items=" . $ipsToExpand);
            $this->assertNotFalse($response, (error_get_last()['message'] ?? 'Unknown error')."On URL: ".$url);
            $json = json_decode($response, true);

            $this->assertTrue($json["error"]);
            preg_match('/([0-9])\d+/',$http_response_header[0],$matches);
            $this->assertEquals(200, intval($matches[0]));
            $this->assertEquals($expectedIps, $json["expandedIPs"]);
        }
    }

    public function testIPDetector()
    {
        $data = $this->privateDetectorDataProvider();
        $ipsToClassify = implode(',', array_column($data, 1));
        $expectedClassifications =  array_column($data, 2);
        $serviceUrls = $this->urls['urls']['ipv4privatedetector']['urls'];
        $this->assertIsArray($serviceUrls, "Service URLs for IPv4 Private Detector should be an array. Received: " . $serviceUrls);
        foreach ($serviceUrls as $url) {
            $response = file_get_contents($url . "?items=" . $ipsToClassify);
            $this->assertNotFalse($response, (error_get_last()['message'] ?? 'Unknown error')."On URL: ".$url);
            $json = json_decode($response, true);

            $this->assertTrue($json["error"]);
            preg_match('/([0-9])\d+/',$http_response_header[0],$matches);
            $this->assertEquals(200, intval($matches[0]));
            $this->assertEquals($expectedClassifications, $json["IPType"]);
        }
    }
}


