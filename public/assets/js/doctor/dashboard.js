const doctorDashboardUser = requireRole("General");
if (doctorDashboardUser) {
  fillSharedLayout("doctor-dashboard");

  async function loadDashboard() {
    try {
      const response = await fetch(`${API_URL}/doctor/dashboard`, {
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
        throw new Error("تعذر تحميل بيانات لوحة التحكم");
      }

      const data = await response.json();
      renderStats(data.stats);
      renderTodayAppointments(data.today_appointments);
      renderLatestConsultations(data.latest_consultations);
    } catch (error) {
      showAlert("dashboardMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  }

  function renderStats(stats) {
    document.querySelector('[data-stat="todayAppointments"]').textContent = stats.today_appointments;
    document.querySelector('[data-stat="newConsultations"]').textContent = stats.new_consultations;
    document.querySelector('[data-stat="pendingLab"]').textContent = stats.pending_lab;
    document.querySelector('[data-stat="pendingRadiology"]').textContent = stats.pending_radiology;
  }

  function renderTodayAppointments(appointments) {
    document.getElementById("todayAppointmentsTable").innerHTML = appointments.map((appointment) => `
      <tr>
        <td>${appointment.patient_name ?? "-"}</td>
        <td>${appointment.time}</td>
        <td>${badge(appointment.status)}</td>
        <td><a class="btn btn-outline-secondary" href="patient-details.html?appointmentId=${appointment.id}&patientId=${appointment.patient_id}">فتح الملف</a></td>
      </tr>
    `).join("");
  }

  function renderLatestConsultations(consultations) {
    document.getElementById("latestConsultations").innerHTML = consultations.map((consultation) => `
      <article class="list-item">
        <strong>${consultation.patient_name ?? "-"}</strong>
        <p class="text-muted mb-2">${shortText(consultation.message, 70)}</p>
        ${badge(consultation.status)}
      </article>
    `).join("");
  }

  loadDashboard();
}