const express=require("express");

const cron=require("node-cron");


const {
    createDatabase,
    getMetrics
}=require("./database");


const {
    runMonitor
}=require("./monitor");



const app=express();


createDatabase();



/*
Run every minute
*/
cron.schedule(
    "* * * * *",
    ()=>{
        console.log(
            "Running monitor..."
        );

        runMonitor();
    }
);



app.get(
    "/",
    (req,res)=>{

        res.json({
            service:
                "IPChecker Monitoring Service"
        });

    });



app.get(
    "/run",
    async(req,res)=>{

        await runMonitor();

        res.json({
            status:
                "completed"
        });

    });



app.get(
    "/metrics",
    (req,res)=>{


        getMetrics(
            (error,rows)=>{

                res.json(rows);

            }
        );

    });



app.listen(
    5500,
    ()=>{

        console.log(
            "Monitor running on port 5500"
        );

    });