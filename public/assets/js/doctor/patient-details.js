const patientDetailsUser = requireRole("General");
if (patientDetailsUser) {
  fillSharedLayout("doctor-patient");

  const params = new URLSearchParams(location.search);
  const appointmentId = Number(params.get("appointmentId")) || getAppointments()[0].id;
  let appointment = appointmentById(appointmentId) || getAppointments()[0];
  const patient = patientById(Number(params.get("patientId")) || appointment.patientId);
  const prescriptionDraft = [];

  function refreshAppointment() {
    appointment = appointmentById(appointment.id);
    document.getElementById("appointmentInfo").innerHTML = `
      <li><span>رقم الموعد</span><strong>${appointment.id}</strong></li>
      <li><span>التاريخ</span><strong>${appointment.date}</strong></li>
      <li><span>الوقت</span><strong>${appointment.time}</strong></li>
      <li><span>الحالة</span><strong>${badge(appointment.status)}</strong></li>
      <li><span>التشخيص الحالي</span><strong>${appointment.diagnosis || "-"}</strong></li>
    `;
    document.getElementById("diagnosisText").value = appointment.diagnosis || "";
  }

  function renderPatient() {
    document.getElementById("patientTitle").textContent = patient.name;
    document.getElementById("patientSubtitle").textContent = `رقم الملف ${patient.file}`;
    document.getElementById("patientInfo").innerHTML = `
      <li><span>العمر</span><strong>${patient.age}</strong></li>
      <li><span>تاريخ الميلاد</span><strong>${patient.birthDate}</strong></li>
      <li><span>الجنس</span><strong>${patient.gender}</strong></li>
      <li><span>الهاتف</span><strong>${patient.phone}</strong></li>
      <li><span>العنوان</span><strong>${patient.address}</strong></li>
    `;
    refreshAppointment();
  }

  function makeHistoryTable(headers, rows) {
    if (!rows.length) return `<div class="text-muted">لا توجد بيانات سابقة</div>`;
    return `
      <div class="table-wrap">
        <table class="table">
          <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>
    `;
  }

  function loadMedicalHistory() {
    const files = getMedicalFiles().filter((file) => file.patientId === patient.id);
    const labs = files.filter((file) => file.file_type === "Lab");
    const radiology = files.filter((file) => file.file_type === "Radiology");
    const prescriptions = getPrescriptions().filter((item) => item.patientId === patient.id);
    const appointments = getAppointments().filter((item) => item.patientId === patient.id);

    document.getElementById("labsTab").innerHTML = makeHistoryTable(["نوع التحليل", "النتيجة", "الحالة", "التاريخ"], labs.map((file) => `
      <tr><td>${file.requestName}</td><td>${file.result}</td><td>${badge(file.status)}</td><td>${file.date}</td></tr>
    `));
    document.getElementById("radiologyTab").innerHTML = makeHistoryTable(["نوع الأشعة", "التقرير", "الحالة", "التاريخ"], radiology.map((file) => `
      <tr><td>${file.requestName}</td><td>${file.result}</td><td>${badge(file.status)}</td><td>${file.date}</td></tr>
    `));
    document.getElementById("prescriptionsTab").innerHTML = makeHistoryTable(["الدواء", "الجرعة", "التعليمات"], prescriptions.map((item) => `
      <tr><td>${item.medication}</td><td>${item.dosage}</td><td>${item.instruction}</td></tr>
    `));
    document.getElementById("appointmentsTab").innerHTML = makeHistoryTable(["التاريخ", "التشخيص", "الحالة"], appointments.map((item) => `
      <tr><td>${item.date}</td><td>${item.diagnosis || "-"}</td><td>${badge(item.status)}</td></tr>
    `));
  }

  function renderDraft() {
    document.getElementById("prescriptionDraft").innerHTML = prescriptionDraft.map((item, index) => `
      <tr>
        <td>${item.medication}</td>
        <td>${item.dosage}</td>
        <td>${item.instruction}</td>
        <td><button class="btn btn-danger" type="button" data-remove-prescription="${index}">حذف</button></td>
      </tr>
    `).join("");
  }

  document.getElementById("saveDiagnosisBtn").addEventListener("click", () => {
    updateAppointment(appointment.id, { diagnosis: document.getElementById("diagnosisText").value.trim() });
    refreshAppointment();
    loadMedicalHistory();
    showAlert("patientMessage", "تم حفظ التشخيص بنجاح");
  });

  document.getElementById("completeAppointmentBtn").addEventListener("click", () => {
    updateAppointment(appointment.id, { status: "Completed", diagnosis: document.getElementById("diagnosisText").value.trim() });
    refreshAppointment();
    loadMedicalHistory();
    showAlert("patientMessage", "تم إنهاء الموعد");
  });

  document.getElementById("sendLabBtn").addEventListener("click", () => {
    addMedicalFile({
      patientId: patient.id,
      appointmentId: appointment.id,
      requestBy: patientDetailsUser.name,
      file_type: "Lab",
      requestName: document.getElementById("labType").value,
      notes: document.getElementById("labNotes").value.trim()
    });
    document.getElementById("labNotes").value = "";
    loadMedicalHistory();
    showAlert("patientMessage", "تم إرسال طلب التحليل");
  });

  document.getElementById("sendRadiologyBtn").addEventListener("click", () => {
    addMedicalFile({
      patientId: patient.id,
      appointmentId: appointment.id,
      requestBy: patientDetailsUser.name,
      file_type: "Radiology",
      requestName: document.getElementById("radiologyType").value,
      notes: document.getElementById("radiologyNotes").value.trim()
    });
    document.getElementById("radiologyNotes").value = "";
    loadMedicalHistory();
    showAlert("patientMessage", "تم إرسال طلب الأشعة");
  });

  document.getElementById("addPrescriptionBtn").addEventListener("click", () => {
    const medication = document.getElementById("medication").value.trim();
    const dosage = document.getElementById("dosage").value.trim();
    const instruction = document.getElementById("instruction").value.trim();
    if (!medication || !dosage || !instruction) {
      showAlert("patientMessage", "أكملي بيانات الدواء قبل الإضافة", "danger");
      return;
    }
    prescriptionDraft.push({ medication, dosage, instruction });
    document.getElementById("medication").value = "";
    document.getElementById("dosage").value = "";
    document.getElementById("instruction").value = "";
    renderDraft();
  });

  document.getElementById("prescriptionDraft").addEventListener("click", (event) => {
    const index = event.target.closest("[data-remove-prescription]")?.dataset.removePrescription;
    if (index === undefined) return;
    prescriptionDraft.splice(Number(index), 1);
    renderDraft();
  });

  document.getElementById("savePrescriptionsBtn").addEventListener("click", () => {
    if (!prescriptionDraft.length) {
      showAlert("patientMessage", "لا توجد أدوية لحفظها", "danger");
      return;
    }
    prescriptionDraft.forEach((item) => addPrescription({ ...item, patientId: patient.id, appointmentId: appointment.id }));
    prescriptionDraft.length = 0;
    renderDraft();
    loadMedicalHistory();
    showAlert("patientMessage", "تم حفظ الوصفة");
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });

  renderPatient();
  loadMedicalHistory();
}
