const appointmentsUser = requireRole("General");
if (appointmentsUser) {
  fillSharedLayout("doctor-appointments");

  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");
  const patientSearch = document.getElementById("patientSearch");
  const table = document.getElementById("appointmentsTable");
  dateFilter.value = new Date().toISOString().slice(0, 10);

  async function loadAppointments() {
    const params = new URLSearchParams();
    if (statusFilter.value !== "All") params.set("status", statusFilter.value);
    if (dateFilter.value) params.set("date", dateFilter.value);
    if (patientSearch.value.trim()) params.set("search", patientSearch.value.trim());

    try {
      const response = await fetch(`${API_URL}/doctor/appointments?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Accept": "application/json"
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر تحميل قائمة المواعيد");
      }

      const data = await response.json();
      renderAppointments(data.appointments);
    } catch (error) {
      table.innerHTML = `<tr><td colspan="6" class="text-muted">${error.message || "حدث خطأ غير متوقع"}</td></tr>`;
    }
  }

  function renderAppointments(appointments) {
    table.innerHTML = appointments.map((appointment) => `
      <tr>
        <td>${appointment.patient_name ?? "-"}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
        <td>${badge(appointment.status)}</td>
        <td>${appointment.diagnosis || "-"}</td>
        <td>
          <div class="actions">
            <a class="btn btn-outline-secondary" href="patient-details.html?appointmentId=${appointment.id}&patientId=${appointment.patient_id}">فتح الملف</a>
            <button class="btn btn-success" type="button" data-complete="${appointment.id}">Completed</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  async function completeAppointment(appointmentId) {
    try {
      const response = await fetch(`${API_URL}/doctor/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ status: "completed" })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر تحديث حالة الموعد");
      }

      await loadAppointments();
    } catch (error) {
      alert(error.message || "حدث خطأ غير متوقع");
    }
  }

  table.addEventListener("click", (event) => {
    const appointmentId = event.target.closest("[data-complete]")?.dataset.complete;
    if (!appointmentId) return;
    completeAppointment(appointmentId);
  });

  statusFilter.addEventListener("change", loadAppointments);
  dateFilter.addEventListener("change", loadAppointments);
  patientSearch.addEventListener("input", loadAppointments);
  loadAppointments();
}