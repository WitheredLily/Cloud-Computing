const Database = require("better-sqlite3");

const db = new Database("/app/data/metrics.db");

function createDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS metrics (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               service TEXT NOT NULL,
                                               success INTEGER NOT NULL,
                                               response_time REAL NOT NULL,
                                               message TEXT,
                                               timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_metrics_timestamp
            ON metrics(timestamp);

        CREATE INDEX IF NOT EXISTS idx_metrics_service
            ON metrics(service);
        CREATE TABLE IF NOT EXISTS alerts (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              service TEXT NOT NULL,
                                              message TEXT NOT NULL,
                                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                              resolved INTEGER DEFAULT 0,
                                              resolved_at DATETIME
        );
    `);

}
createDatabase()

const insertMetric = db.prepare(`
    INSERT INTO metrics
    (service, success, response_time, message)
    VALUES (?, ?, ?, ?)
`);

function saveMetric(service, success, responseTime, message) {
    insertMetric.run(
        service,
        success ? 1 : 0,
        responseTime,
        message,
    );
}

function getMetrics({
                        amount = 100,
                        firstDate,
                        lastDate,
                        success,
                        idMin,
                        idMax,
                        services = [],
                    } = {}) {

    let sql = `
        SELECT *
        FROM metrics
        WHERE 1=1
    `;

    const params = [];

    if (success !== undefined) {
        sql += " AND success = ?";
        params.push(success);
    }

    if (idMin !== undefined) {
        sql += " AND id >= ?";
        params.push(idMin);
    }

    if (idMax !== undefined) {
        sql += " AND id <= ?";
        params.push(idMax);
    }

    if (firstDate) {
        sql += " AND timestamp >= ?";
        params.push(firstDate);
    }

    if (lastDate) {
        sql += " AND timestamp <= ?";
        params.push(lastDate);
    }

    if (services.length) {
        sql += ` AND service IN (${services.map(() => "?").join(",")})`;
        params.push(...services);
    }

    sql += `
        ORDER BY timestamp DESC
        LIMIT ?
    `;
    params.push(amount);

    return db.prepare(sql).all(...params);
}

const insertAlert = db.prepare(`
    INSERT INTO alerts
    (service, message)
    VALUES (?, ?)
`);

function createAlert(service, message){
    insertAlert.run(
        service,
        message
    );
}


function getActiveAlerts(){
    return db.prepare(`
        SELECT *
        FROM alerts
        WHERE resolved = 0
        ORDER BY created_at DESC
    `).all();
}


function resolveAlert(service){
    db.prepare(`
        UPDATE alerts
        SET resolved = 1,
            resolved_at = CURRENT_TIMESTAMP
        WHERE service = ?
        AND resolved = 0
    `).run(service);
}

function getAlerts({
                       amount = 100,
                       firstCreateDate,
                       lastCreateDate,
                       firstResolveDate,
                       lastResolveDate,
                       resolved,
                       idMin,
                       idMax,
                       services = [],
                   } = {}) {

    let sql = `
        SELECT *
        FROM alerts
        WHERE 1=1
    `;

    const params = [];

    if (resolved !== undefined) {
        sql += " AND success = ?";
        params.push(resolved);
    }

    if (idMin !== undefined) {
        sql += " AND id >= ?";
        params.push(idMin);
    }

    if (idMax !== undefined) {
        sql += " AND id <= ?";
        params.push(idMax);
    }

    if (firstCreateDate) {
        sql += " AND created_at >= ?";
        params.push(firstCreateDate);
    }

    if (lastCreateDate) {
        sql += " AND created_at <= ?";
        params.push(lastCreateDate);
    }

    if (firstResolveDate) {
        sql += " AND resolved_at >= ?";
        params.push(firstResolveDate);
    }

    if (lastResolveDate) {
        sql += " AND resolved_at <= ?";
        params.push(lastResolveDate);
    }

    if (services.length) {
        sql += ` AND service IN (${services.map(() => "?").join(",")})`;
        params.push(...services);
    }

    sql += `
        ORDER BY created_at DESC
        LIMIT ?
    `;
    params.push(amount);

    return db.prepare(sql).all(...params);
}


module.exports = {
    createDatabase,
    saveMetric,
    getMetrics,
    createAlert,
    getActiveAlerts,
    resolveAlert,
    getAlerts,
}