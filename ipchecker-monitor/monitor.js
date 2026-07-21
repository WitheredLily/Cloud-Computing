const axios = require("axios");

const {
    saveMetric, createAlert
} = require("./database");

const { urls } = require("./config.json");
const { alertCheck } = require("./alert");

const ip_type =  {
    Private  : "Private",
    Loopback : "Loopback",
    Public   : "Public"
}

function generateIPv4(classification){
    switch(classification){
        case ip_type.Private:
            let ip_start = [`10.${getRandomNumber(0, 255)}`,`192.168`]
            return ip_start[Math.round(Math.random())]+`.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`;
        case ip_type.Loopback:
            return `127.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`;
        case ip_type.Public:
            let octet_one = getRandomNumber(0, 255, [127, 10]);
            let octet_two
            if(octet_one === 192){
                octet_two = getRandomNumber(0, 255, [168]);
            } else {
                octet_two = getRandomNumber(0, 255);
            }
            return `${octet_one}.${octet_two}.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`;
        default:
            return `${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`;
    }
}

function getRandomNumber(min, max, excluding = []) {
    excluding = [...new Set(excluding)]
        .filter(x => x >= min && x < max)
        .sort((a, b) => a - b);

    const count = max - min + 1 - excluding.length;
    if (count <= 0) {
        throw new Error("No valid numbers available.");
    }

    let n = Math.floor(Math.random() * count) + min;

    for (const x of excluding) {
        if (n >= x) {
            n++;
        } else {
            break;
        }
    }

    return n;
}

function generateIPv6Segment(){
    let length = getRandomNumber(1, 4);
    let letters = "000000123456789ABCDEF";
    let number = ""
    for (let i = 0; i < 4; i++)
        number += letters[(Math.floor(Math.random() * letters.length))];
    return number;
}

function generateIPv6(){
    let ipArray = [];
    let ipArrayCompressed = [];
    for(let i=0;i<8;i++) {
        let segment = generateIPv6Segment();
        ipArray.push(segment);
        ipArrayCompressed.push(segment.replace(/^0+/, '') || '0');
    }
    return [ipArray.join(":"), compressIPv6Array(ipArrayCompressed).join(":")];
}

function compressIPv6Array(ipArray){
    let ipCompressibleSections = []
    let firstSection = -1
    for(let i=0;i<8;i++) {
        if(ipArray[i] === "0") {
            if(firstSection === -1) {
                firstSection = i;
            }
        } else {
            if(firstSection !== -1 && i - 1 - firstSection > 1) {
                ipCompressibleSections.push([firstSection, i-1]);
            }
            firstSection = -1;
        }
    }
    if (firstSection !== -1 && 7 - firstSection >= 1) {
        ipCompressibleSections.push([firstSection, 7]);
    }
    let sectionToCompress = [-1,-1]
    for(let i=0;i<ipCompressibleSections.length;i++) {
        if(sectionToCompress[1] - sectionToCompress[0] < ipCompressibleSections[i][1] - ipCompressibleSections[i][0]) {
            sectionToCompress = ipCompressibleSections[i];
        }
    }
    if(sectionToCompress[0] !== -1) {
        let spliceContent = ""
        if(sectionToCompress[0] === 0 || sectionToCompress[1] === 7) {
            spliceContent = ":"
        }
        ipArray.splice(sectionToCompress[0], sectionToCompress[1] - sectionToCompress[0] + 1, spliceContent)
    }
    return ipArray;
}

function getRandomIps(minAmount, maxAmount){
    let ips = []
    for(let i=0;i<getRandomNumber(minAmount, maxAmount);i++){
        if (Math.random() > 0.5) {
            ips.push(generateIPv4());
        } else {
            ips.push(generateIPv6()[0]);
        }
    }
    return ips;
}

function getRandomIpsWithBlanks(minAmount, maxAmount){
    let ips = []
    let blankCount = 0
    for(let i=0;i<getRandomNumber(minAmount, maxAmount);i++){
        if (Math.random() < (1/3)) {
            ips.push(generateIPv4());
        } else if (Math.random() < (2/3)) {
            ips.push(generateIPv6()[0]);
        } else {
            if (i === 0){
                if (Math.random() < 0.5) {
                    ips.push(generateIPv4());
                } else {
                    ips.push(generateIPv6()[0]);
                }
            } else {
                ips.push("");
                blankCount++;
            }
        }
    }
    return [ips, blankCount];
}

function getRandomIpv4s(minAmount, maxAmount){
    let ips = []
    let ipClasses = []
    for(let i=0;i<getRandomNumber(minAmount, maxAmount);i++){
        if (Math.random() < (1/3)) {
            ips.push(generateIPv4(ip_type.public));
            ipClasses.push(ip_type.Public);
        } else if (Math.random() < (2/3)) {
            ips.push(generateIPv4(ip_type.Loopback));
            ipClasses.push(ip_type.Loopback);
        } else {
            ips.push(generateIPv4(ip_type.Private));
            ipClasses.push(ip_type.Private);
        }
    }
    return [ips, ipClasses];
}

function getRandomIpv6s(minAmount, maxAmount){
    let uncompressedIps = []
    let compressedIps = []
    for(let i=0;i<getRandomNumber(minAmount, maxAmount);i++){
        let ip = generateIPv6();
        uncompressedIps.push(ip[0]);
        compressedIps.push(ip[1]);
    }
    return [compressedIps, uncompressedIps];
}

async function checkEndpoint(serviceName, url){
    let ips = []
    let answers = []
    let blankCount = 0
    switch (serviceName) {
        case "ipcheckertotalips":
            ips = getRandomIps(1, 10);
            break;
        case "ipcheckertotalemptyips":
            ips = getRandomIpsWithBlanks(1, 10);
            [ips, blankCount] = getRandomIpsWithBlanks(1, 10);
            break;
        case "ipv4privatedetector":
            [ips, answers] = getRandomIpv4s(1, 10);
            break;
        case "ipv6extractor":
            [ips, answers] = getRandomIpv6s(1, 10);
            break;
        default:
            console.warn("Unknown service:", serviceName);
            break;
    }

    const start = Date.now();

    try {
        const response = await axios.get(
            url,
            {
                params:{
                    items: ips.join(",")
                },
                timeout:5000
            }
        );

        const responseTime = Date.now() - start;
        let correct = false;

        switch(serviceName){
            case "ipcheckertotalips":
                correct = response.data.total_ips === ips.length;
                break;
            case "ipcheckertotalemptyips":
                correct = response.data.total_empty_ips === blankCount;
                break;
            case "ipv4privatedetector":
                correct = JSON.stringify(answers) === JSON.stringify(response.data.IPType.map(function(value,index) { return value[0]; }));
                break;
            case "ipv6extractor":
                correct = JSON.stringify(answers) === JSON.stringify(response.data.expandedIPs.map(function(value,index) { return value[0]; }));
                break;
        }
        if(!correct){
            alertCheck(serviceName, true, "Incorrect response")
            console.warn(
                "ALERT:",
                serviceName,
                "returned incorrect result" ,
                "Expected: ", answers,
                "Received: ", response.data
            );
        } else {
            alertCheck(serviceName);
            console.log(
                serviceName,
                "returned correct result"
            );
        }
        saveMetric(
            serviceName,
            correct ? 1 : 0,
            responseTime,
            correct ? "OK" : "Incorrect response"
        );
    }
    catch(error){
        console.error(error.stack);
        const responseTime = Date.now() - start;
        const message = error.response
            ? `${error.response.status} ${error.response.statusText}`
            : error.message;

        saveMetric(
            serviceName,
            0,
            responseTime,
            message
        );
        alertCheck(serviceName, true, message);
        console.warn(
            "ALERT:",
            serviceName,
            "failed:",
            message
        );
    }
}

async function checkService(serviceName, serviceConfig){
    await Promise.all(
        serviceConfig.urls.map(url =>
            checkEndpoint(serviceName, url)
        )
    );
}

async function runMonitor(){
    await Promise.all(
        Object.entries(urls).map(([service, config]) =>
            checkService(service, config)
        )
    );
}

module.exports = {
    runMonitor
};