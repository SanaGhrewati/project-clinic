const staffDashboardUser = requireDoctorType(["Lab", "Radiology"]);
if (staffDashboardUser) {
  fillSharedLayout("staff-dashboard");

  const statusFilter = document.getElementById("requestStatus");
  const search = document.getElementById("requestSearch");
  const table = document.getElementById("requestsTable");

  const isLab = staffDashboardUser.role === "Lab";
  document.getElementById("staffPageTitle").textContent = isLab ? "طلبات التحاليل" : "طلبات الأشعة";
  document.getElementById("requestTypeHead").textContent = isLab ? "التحليل المطلوب" : "نوع الأشعة";

  function ownRequests() {
    return getMedicalFiles().filter((file) => file.file_type === staffDashboardUser.role);
  }

  function renderStats() {
    const requests = ownRequests();
    document.querySelector('[data-stat="pending"]').textContent = requests.filter((item) => item.status === "Pending").length;
    document.querySelector('[data-stat="completed"]').textContent = requests.filter((item) => item.status === "Completed").length;
    document.querySelector('[data-stat="total"]').textContent = requests.length;
  }

  function renderRequests() {
    const status = statusFilter.value;
    const query = search.value.trim().toLowerCase();
    const rows = ownRequests().filter((request) => {
      const patient = patientById(request.patientId);
      const matchesStatus = status === "All" || request.status === status;
      const matchesSearch = patient.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });

    table.innerHTML = rows.map((request) => {
      const patient = patientById(request.patientId);
      return `
        <tr>
          <td>${patient.name}</td>
          <td>${request.requestBy}</td>
          <td>${request.requestName}</td>
          <td>${badge(request.status)}</td>
          <td>${request.date}</td>
          <td><a class="btn btn-outline-secondary" href="request-details.html?id=${request.id}">فتح الطلب</a></td>
        </tr>
      `;
    }).join("");
  }

  statusFilter.addEventListener("change", renderRequests);
  search.addEventListener("input", renderRequests);
  renderStats();
  renderRequests();
}
