const doctorDashboardUser = requireRole("General");
if (doctorDashboardUser) {
  fillSharedLayout("doctor-dashboard");

  const appointments = getAppointments();
  const todayAppointments = appointments.filter((appointment) => appointment.date === todayString());
  const patientIds = appointments.map((appointment) => appointment.patientId);
  const files = getMedicalFiles().filter((file) => patientIds.includes(file.patientId));
  const consultations = getConsultations();

  document.querySelector('[data-stat="todayAppointments"]').textContent = todayAppointments.length;
  document.querySelector('[data-stat="newConsultations"]').textContent = consultations.filter((item) => item.status === "Open").length;
  document.querySelector('[data-stat="pendingLab"]').textContent = files.filter((file) => file.file_type === "Lab" && file.status === "Pending").length;
  document.querySelector('[data-stat="pendingRadiology"]').textContent = files.filter((file) => file.file_type === "Radiology" && file.status === "Pending").length;

  document.getElementById("todayAppointmentsTable").innerHTML = todayAppointments.map((appointment) => {
    const patient = patientById(appointment.patientId);
    return `
      <tr>
        <td>${patient.name}</td>
        <td>${appointment.time}</td>
        <td>${badge(appointment.status)}</td>
        <td><a class="btn btn-outline-secondary" href="patient-details.html?appointmentId=${appointment.id}&patientId=${patient.id}">فتح الملف</a></td>
      </tr>
    `;
  }).join("");

  document.getElementById("latestConsultations").innerHTML = consultations.slice(0, 3).map((consultation) => {
    const patient = patientById(consultation.patientId);
    return `
      <article class="list-item">
        <strong>${patient.name}</strong>
        <p class="text-muted mb-2">${shortText(consultation.message, 70)}</p>
        ${badge(consultation.status)}
      </article>
    `;
  }).join("");
}
