const nodemailer = require("nodemailer");
const { alerts } = require("./config.json");
const {createAlert, resolveAlert, getActiveAlerts} = require("./database");
const { urls } = require("./config.json");

require('dotenv').config();

const counters = Object.fromEntries(
    Object.keys(urls).map(service => [service, [0, Date.now(), 0, 0]])
);

const activeAlerts = getActiveAlerts();

activeAlerts.forEach(alert => {
    if (counters[alert.service]) {
        counters[alert.service][0] = alerts.minTriggers;
        counters[alert.service][1] = new Date(alert.created_at).getTime();
        counters[alert.service][2] = 1;
    }
});

function alertCheck(service, increase = false, error){
    if(alerts.enabled){
        if (!increase){
            counters[service][0] = 0;
            if (counters[service][2]>0){
                counters[service][3]++;
                if(counters[service][3] >= alerts.recoveryCountReq && alerts.recoveryTime <= Date.now()-counters[service][1]) {
                    counters[service][2] = 0;
                    counters[service][3] = 0
                    resolveAlert(service)
                    sendAlertResolution(service);
                }
            }
        } else {
            counters[service][3] = 0
            counters[service][0]++;
            if (alerts.minTriggerBetweenAlerts*counters[service][2] <= (counters[service][0]-alerts.minTriggers)){
                if (counters[service][2] === 0 || Date.now()-counters[service][1]>alerts.minTimeBetweenAlerts){
                    if (counters[service][2] === 0) {
                        createAlert(service, error)
                    }
                    sendAlert(service, counters[service][0], error);
                    counters[service][2]++;
                    counters[service][1] = Date.now();
                }
            }
        }
    }
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

async function sendAlert(service, count, error) {
    const subject = `[ALERT] ${service} has failed ${count} times`;

    const body = `
Service: ${service}

Failure Count: ${count}

Time: ${new Date().toISOString()}

Error:
${error}
`;

    try {
        await transporter.sendMail({
            from: `"Health Checker" <${process.env.SMTP_USER}>`,
            to: alerts.email.recipients.join(", "),
            subject,
            text: body,
        });

        console.log(`Alert sent for ${service}`);
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

async function sendAlertResolution(service) {
    const subject = `[RESOLVED] ${service} is now healthy`;

    const body = `
Service: ${service}

Time: ${new Date().toISOString()}
`;

    try {
        await transporter.sendMail({
            from: `"Health Checker" <${process.env.SMTP_USER}>`,
            to: alerts.email.recipients.join(", "),
            subject,
            text: body,
        });

        console.log(`Alert resolved for ${service}`);
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = {
    alertCheck
};