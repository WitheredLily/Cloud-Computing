const serviceNames = {
  IPCheckerTotalEmptyIPs: "ipcheckertotalemptyips",
  IPCheckerTotalIPs: "ipcheckertotalips",
  IPv4PrivateDetector: "ipv4privatedetector",
  IPv6Extractor: "ipv6extractor"
};


const urls = {
  [serviceNames.IPCheckerTotalIPs]: {
    urls: [
      "http://localhost:7000/",
      "http://localhost:7001/",
      "http://localhost:7002/"
    ]
  },

  [serviceNames.IPCheckerTotalEmptyIPs]: {
    urls: [
      "http://localhost:9000/",
      "http://localhost:9001/",
      "http://localhost:9002/"
    ]
  },

  [serviceNames.IPv4PrivateDetector]: {
    urls: [
      "http://localhost:8000/",
      "http://localhost:8001/",
      "http://localhost:8002/"
    ]
  },

  [serviceNames.IPv6Extractor]: {
    urls: [
      "http://localhost:6500/",
      "http://localhost:6501/",
      "http://localhost:6502/"
    ]
  }
};


module.exports = {
  serviceNames,
  urls
};