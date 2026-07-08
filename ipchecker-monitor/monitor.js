const axios = require("axios");

const {
    saveMetric
} = require("./database");

const {
    urls
} = require("./config");



function generateIPs(){

    return [
        "192.168.1.10",
        "8.8.8.8",
        "",
        "127.0.0.1"
    ].join(",");

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