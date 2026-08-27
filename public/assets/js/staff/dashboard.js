const staffDashboardUser = requireDoctorType(["Lab", "Radiology"]);
if (staffDashboardUser) {
  fillSharedLayout("staff-dashboard");

  const statusFilter = document.getElementById("requestStatus");
  const search = document.getElementById("requestSearch");
  const table = document.getElementById("requestsTable");

  // staffDashboardUser.role هنا هو doctor_type الحقيقي القادم من استجابة تسجيل الدخول
  // (Lab أو Radiology)، وليس قيمة ثابتة محليًا — راجع auth.js: normalizeUser().
  const isLab = staffDashboardUser.role === "Lab";
  document.getElementById("staffPageTitle").textContent = isLab ? "طلبات التحاليل" : "طلبات الأشعة";
  document.getElementById("requestTypeHead").textContent = "نوع الطلب";

  let searchDebounceId = null;

  function renderStats(stats) {
    document.querySelector('[data-stat="pending"]').textContent = pickCount(stats, ["pending", "Pending"]);
    document.querySelector('[data-stat="completed"]').textContent = pickCount(stats, ["done", "completed", "Completed", "Done"]);
    document.querySelector('[data-stat="total"]').textContent = pickCount(stats, ["total", "Total"]);
  }

  async function loadStats() {
    try {
      const stats = await staffApiFetch("/staff/stats");
      if (stats) renderStats(stats);
    } catch (error) {
      // الإحصائيات ثانوية: لا نمنع استخدام الصفحة إذا فشلت وحدها.
      console.error("GET /staff/stats:", error.message);
    }
  }

  function renderRequests(requests) {
    if (!requests.length) {
      table.innerHTML = `<tr><td colspan="6" class="text-muted text-center">لا توجد طلبات</td></tr>`;
      return;
    }

    table.innerHTML = requests.map((request) => `
      <tr>
        <td>${request.patient_name ?? "-"}</td>
        <td>${request.doctor_name ?? "-"}</td>
        <td>${request.file_type ?? "-"}</td>
        <td>${badge(statusToDisplay(request.status))}</td>
        <td>${formatDateTime(request.created_at)}</td>
        <td><a class="btn btn-outline-secondary" href="request-details.html?id=${request.id}">فتح الطلب</a></td>
      </tr>
    `).join("");
  }

  async function loadRequests() {
    table.innerHTML = `<tr><td colspan="6" class="text-muted text-center">...جاري التحميل</td></tr>`;

    const query = search.value.trim();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    // "All" قيمة داخلية فقط لعدم إرسال فلتر حالة؛ القيم الفعلية المُرسلة هي pending / done
    // كما هي في قاعدة البيانات، وليست Pending / Completed.
    if (statusFilter.value !== "All") params.set("status", statusFilter.value);
    const qs = params.toString();

    try {
      const payload = await staffApiFetch(`/staff/requests${qs ? `?${qs}` : ""}`);
      renderRequests(unwrapList(payload));
    } catch (error) {
      table.innerHTML = `<tr><td colspan="6" class="text-muted text-center">${error.message}</td></tr>`;
    }
  }

  statusFilter.addEventListener("change", loadRequests);
  search.addEventListener("input", () => {
    clearTimeout(searchDebounceId);
    searchDebounceId = setTimeout(loadRequests, 350);
  });

  loadStats();
  loadRequests();
}
