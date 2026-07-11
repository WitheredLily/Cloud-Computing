const axios = require("axios");

const {
    saveMetric
} = require("./database");

const { urls } = require("../utility/config.json");
const { urls } = require("../utility/config.json");

const ip_type =  {
    Private  : "Private",
    Loopback : "Loopback",
    Public   : "Public"
}

function generateIPs(){

    return [
        "192.168.1.10",
        "8.8.8.8",
        "",
        "127.0.0.1"
    ].join(",");

}

function generateIPv4(classification){
    switch(classification){
        case ip_type.Private:
            let ip_start = [`10.${getRandomNumber(0, 255)}`,`192.168`]
            return ip_start[Math.round(Math.random())]+`${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`;
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

    const count = max - min - excluding.length;
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
    for (let i = 0; i < length; i++)
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



async function checkEndpoint(serviceName, url){

    const ips = generateIPs();

    const start = Date.now();


    try {

        const response = await axios.get(
            url,
            {
                params:{
                    items: ips
                },
                timeout:5000
            }
        );


        const responseTime = Date.now() - start;


        let correct = false;


        switch(serviceName){


            case "ipcheckertotalips":

                correct =
                    response.data.total_ips === ips.split(",").length;

                break;



            case "ipcheckertotalemptyips":

                correct =
                    response.data.total_empty_ips === 1;

                break;



            default:

                correct = true;

        }



        saveMetric(
            serviceName,
            correct ? 1 : 0,
            responseTime,
            correct ? "OK" : "Incorrect response"
        );


        if(!correct){

            console.log(
                "ALERT:",
                serviceName,
                "returned incorrect result"
            );

        }


    }
    catch(error){


        const responseTime = Date.now() - start;


        saveMetric(
            serviceName,
            0,
            responseTime,
            error.message
        );


        console.log(
            "ALERT:",
            serviceName,
            "failed:",
            error.message
        );

    }

}





async function checkService(serviceName, serviceConfig){


    for(const url of serviceConfig.urls){

        await checkEndpoint(
            serviceName,
            url
        );

    }

}



async function runMonitor(){


    for(const service in urls){

        await checkService(
            service,
            urls[service]
        );

    }

}



module.exports = {
    runMonitor
};