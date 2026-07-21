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
        document.querySelectorAll("#logs .toggle-content input[type=checkbox]:checked")
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

function openPage(button, tabName) {
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab-links");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    button.className += " active";
}

document.getElementById("default-tab").click();

async function loadAlerts() {
    const params = new URLSearchParams();

    params.set("amount", document.getElementById("quantity-alert").value);

    const success = document.getElementById("resolvedStatus").value;
    if (success !== "") {
        params.set("success", success);
    }

    const firstCreateDate = document.getElementById("firstCreateDate").value;
    if (firstCreateDate) params.set("firstCreateDate", firstCreateDate);

    const lastCreateDate = document.getElementById("lastCreateDate").value;
    if (lastCreateDate) params.set("lastCreateDate", lastCreateDate);

    const firstResolvedDate = document.getElementById("firstResolvedDate").value;
    if (firstResolvedDate) params.set("firstResolvedDate", firstResolvedDate);

    const lastResolvedDate = document.getElementById("lastResolvedDate").value;
    if (lastResolvedDate) params.set("lastResolvedDate", lastResolvedDate);

    const idMin = document.getElementById("idRange1-alert").value;
    if (idMin) params.set("idMin", idMin);

    const idMax = document.getElementById("idRange2-alert").value;
    if (idMax) params.set("idMax", idMax);

    const services = Array.from(
        document.querySelectorAll("#alerts-logs .toggle-content input[type=checkbox]:checked")
    ).map(cb => cb.id.replace(/-alert$/, ""));

    if (services.length) {
        params.set("services", services.join(",").replace(/-alert/g, ''));
    }

    const response = await fetch(`/api/alerts?${params.toString()}`);
    const data = await response.json();

    const table = document.getElementById("alerts");
    table.innerHTML = "";

    data.forEach(alert => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${alert.id}</td>
            <td>${alert.service}</td>
            <td>${alert.message ?? ""}</td>
            <td>${alert.created_at}</td>
            <td class="${alert.resolved ? "success" : "failure"}">
                ${alert.resolved ? "RESOLVED" : "UNRESOLVED"}
            </td>
            <td>${alert.resolved_at}</td>
        `;

        table.appendChild(row);
        if (!sorter) {
            sorter = new Tablesort(document.getElementById("my-table-alert"));
        }
    });
}
loadAlerts();
setInterval(loadAlerts, 10000);