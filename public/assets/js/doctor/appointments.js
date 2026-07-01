const appointmentsUser = requireRole("General");
if (appointmentsUser) {
  fillSharedLayout("doctor-appointments");

  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");
  const patientSearch = document.getElementById("patientSearch");
  const table = document.getElementById("appointmentsTable");
  dateFilter.value = todayString();

  function loadAppointments() {
    const status = statusFilter.value;
    const date = dateFilter.value;
    const query = patientSearch.value.trim().toLowerCase();

    const rows = getAppointments().filter((appointment) => {
      const patient = patientById(appointment.patientId);
      const matchesStatus = status === "All" || appointment.status === status;
      const matchesDate = !date || appointment.date === date;
      const matchesSearch = patient.name.toLowerCase().includes(query);
      return matchesStatus && matchesDate && matchesSearch;
    });

    table.innerHTML = rows.map((appointment) => {
      const patient = patientById(appointment.patientId);
      return `
        <tr>
          <td>${patient.name}</td>
          <td>${appointment.date}</td>
          <td>${appointment.time}</td>
          <td>${badge(appointment.status)}</td>
          <td>${appointment.diagnosis || "-"}</td>
          <td>
            <div class="actions">
              <a class="btn btn-outline-secondary" href="patient-details.html?appointmentId=${appointment.id}&patientId=${patient.id}">فتح الملف</a>
              <button class="btn btn-success" type="button" data-complete="${appointment.id}">Completed</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  table.addEventListener("click", (event) => {
    const appointmentId = event.target.closest("[data-complete]")?.dataset.complete;
    if (!appointmentId) return;
    updateAppointment(appointmentId, { status: "Completed" });
    loadAppointments();
  });

  statusFilter.addEventListener("change", loadAppointments);
  dateFilter.addEventListener("change", loadAppointments);
  patientSearch.addEventListener("input", loadAppointments);
  loadAppointments();
}
