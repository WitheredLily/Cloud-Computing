let sorter;

async function loadMetrics() {
    const params = new URLSearchParams();

    params.set("amount", document.getElementById("quantity").value);

    const success = document.getElementById("statusChoice").value;
    if (success !== "") {
        params.set("success", success);
    }

    const firstDate = document.getElementById("firstDate").value;
    if (firstDate) params.set("firstDate", firstDate);

    const lastDate = document.getElementById("lastDate").value;
    if (lastDate) params.set("lastDate", lastDate);

    const idMin = document.getElementById("idRange1").value;
    if (idMin) params.set("idMin", idMin);

    const idMax = document.getElementById("idRange2").value;
    if (idMax) params.set("idMax", idMax);

    const services = Array.from(
        document.querySelectorAll(".toggle-content input[type=checkbox]:checked")
    ).map(cb => cb.id);

    if (services.length) {
        params.set("services", services.join(","));
    }

    const response = await fetch(`/api/metrics?${params.toString()}`);
    const data = await response.json();

    const table = document.getElementById("metrics");
    table.innerHTML = "";

    data.forEach(metric => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${metric.id}</td>
            <td>${metric.service}</td>
            <td class="${metric.success ? "success" : "failure"}">
                ${metric.success ? "SUCCESS" : "FAILED"}
            </td>
            <td>${metric.response_time} ms</td>
            <td>${metric.message ?? ""}</td>
            <td>${metric.timestamp}</td>
        `;

        table.appendChild(row);
        if (!sorter) {
            sorter = new Tablesort(document.getElementById("my-table"));
        }
    });
}

async function runMonitor() {
    await fetch("/api/run");
    await loadMetrics();
}

loadMetrics();
setInterval(loadMetrics, 10000);
