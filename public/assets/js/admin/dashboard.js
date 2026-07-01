const adminUser = requireRole("Admin");
if (adminUser) {
  fillSharedLayout("admin-dashboard");
  const doctors = getDoctors();
  const appointments = getAppointments();
  const consultations = getConsultations();
  const files = getMedicalFiles();
  const stats = {
    totalDoctors: doctors.length,
    generalDoctors: doctors.filter((doctor) => doctor.type === "General").length,
    labUsers: doctors.filter((doctor) => doctor.type === "Lab").length,
    radiologyUsers: doctors.filter((doctor) => doctor.type === "Radiology").length,
    patients: getPatients().length,
    appointments: appointments.length,
    openConsultations: consultations.filter((item) => item.status === "Open").length,
    pendingLab: files.filter((item) => item.file_type === "Lab" && item.status === "Pending").length,
    pendingRadiology: files.filter((item) => item.file_type === "Radiology" && item.status === "Pending").length
  };

  Object.entries(stats).forEach(([key, value]) => {
    document.querySelector(`[data-stat="${key}"]`).textContent = value;
  });
}
