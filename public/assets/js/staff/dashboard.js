const staffDashboardUser = requireDoctorType(["Lab", "Radiology"]);
if (staffDashboardUser) {
  fillSharedLayout("staff-dashboard");

  const statusFilter = document.getElementById("requestStatus");
  const search = document.getElementById("requestSearch");
  const table = document.getElementById("requestsTable");

  const isLab = staffDashboardUser.role === "Lab";
  document.getElementById("staffPageTitle").textContent = isLab ? "طلبات التحاليل" : "طلبات الأشعة";
  document.getElementById("requestTypeHead").textContent = isLab ? "التحليل المطلوب" : "نوع الأشعة";

  function authHeaders() {
    return {
      "Authorization": `Bearer ${getToken()}`,
      "Accept": "application/json"
    };
  }

  // القيم الفعلية من الـ API هي "pending" / "done"، وهنا نحوّلها لنفس
  // الأسماء اللي تعتمد عليها كلاسات الـ CSS الحالية (Pending / Completed)
  function statusLabel(status) {
    return status === "done" ? "Completed" : "Pending";
  }

  async function loadRequests() {
    const params = new URLSearchParams();
    if (statusFilter.value !== "All") params.set("status", statusFilter.value);
    if (search.value.trim()) params.set("search", search.value.trim());

    try {
      const response = await fetch(`${API_URL}/staff/requests?${params.toString()}`, {
        headers: authHeaders()
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر تحميل قائمة الطلبات");
      }

      const data = await response.json();
      renderStats(data.stats);
      renderRequests(data.requests);
    } catch (error) {
      table.innerHTML = `<tr><td colspan="6" class="text-muted">${error.message || "حدث خطأ غير متوقع"}</td></tr>`;
    }
  }

  function renderStats(stats) {
    document.querySelector('[data-stat="pending"]').textContent = stats.pending;
    document.querySelector('[data-stat="completed"]').textContent = stats.completed;
    document.querySelector('[data-stat="total"]').textContent = stats.total;
  }

  function renderRequests(requests) {
    table.innerHTML = requests.map((request) => `
      <tr>
        <td>${request.patient_name ?? "-"}</td>
        <td>${request.requested_by_name ?? "-"}</td>
        <td>${request.request_name ?? "-"}</td>
        <td>${badge(statusLabel(request.status))}</td>
        <td>${request.created_at}</td>
        <td><a class="btn btn-outline-secondary" href="request-details.html?id=${request.id}">فتح الطلب</a></td>
      </tr>
    `).join("");
  }

  statusFilter.addEventListener("change", loadRequests);
  search.addEventListener("input", loadRequests);
  loadRequests();
}