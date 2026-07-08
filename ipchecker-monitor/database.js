const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("metrics.db");


function createDatabase(){

    db.run(`
        CREATE TABLE IF NOT EXISTS metrics(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT,
            success INTEGER,
            response_time REAL,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

}



function saveMetric(
    service,
    success,
    responseTime,
    message
){

    db.run(
        `
        INSERT INTO metrics
        (service,success,response_time,message)
        VALUES(?,?,?,?)
        `,
        [
            service,
            success,
            responseTime,
            message
        ]
    );

}



function getMetrics(callback){

    db.all(
        `
        SELECT *
        FROM metrics
        ORDER BY id DESC
        LIMIT 100
        `,
        callback
    );

}


module.exports={
    createDatabase,
    saveMetric,
    getMetrics
};