function getRootPrefix() {
    return location.pathname.includes("/pages/") ||
        location.pathname.includes("\\pages\\")
        ? "../../"
        : "";
}

function getStored(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function setStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function badge(status) {
    return `<span class="badge ${status}">${status}</span>`;
}

function showAlert(targetId, message, type = "success") {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.textContent = message;
    target.className = `alert alert-${type === "success" ? "success" : "danger"}`;
    target.classList.remove("d-none");
}

function shortText(value, length = 48) {
    return value.length > length ? `${value.slice(0, length)}...` : value;
}
