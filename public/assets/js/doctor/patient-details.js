const patientDetailsUser = requireRole("General");
if (patientDetailsUser) {
  fillSharedLayout("doctor-patient");

  const params = new URLSearchParams(location.search);
  const patientId = params.get("patientId");
  const appointmentIdParam = params.get("appointmentId");
  const prescriptionDraft = [];

  let currentAppointmentId = appointmentIdParam ? Number(appointmentIdParam) : null;

  function authHeaders(extra = {}) {
    return {
      "Authorization": `Bearer ${getToken()}`,
      "Accept": "application/json",
      ...extra
    };
  }

  const genderLabels = { male: "ذكر", female: "أنثى" };

  async function loadPatient() {
    if (!patientId) {
      showAlert("patientMessage", "لم يتم تحديد مريض", "danger");
      return;
    }

    try {
      const query = currentAppointmentId ? `?appointment_id=${currentAppointmentId}` : "";
      const response = await fetch(`${API_URL}/doctor/patients/${patientId}${query}`, {
        headers: authHeaders()
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر تحميل بيانات المريض");
      }

      const data = await response.json();
      renderPatient(data.patient);
      renderAppointment(data.appointment);
      renderMedicalHistory(data.labs, data.radiology, data.prescriptions, data.appointments);

      if (data.appointment) {
        currentAppointmentId = data.appointment.id;
      }
    } catch (error) {
      showAlert("patientMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  }

  function renderPatient(patient) {
    document.getElementById("patientTitle").textContent = patient.name ?? "-";
    document.getElementById("patientSubtitle").textContent = `رقم الملف ${patient.file_number}`;
    document.getElementById("patientInfo").innerHTML = `
      <li><span>العمر</span><strong>${patient.age ?? "-"}</strong></li>
      <li><span>تاريخ الميلاد</span><strong>${patient.birthdate ?? "-"}</strong></li>
      <li><span>الجنس</span><strong>${genderLabels[patient.gender] ?? patient.gender ?? "-"}</strong></li>
      <li><span>الهاتف</span><strong>${patient.mobile ?? "-"}</strong></li>
      <li><span>العنوان</span><strong>${patient.address ?? "-"}</strong></li>
    `;
  }

  function renderAppointment(appointment) {
    if (!appointment) {
      document.getElementById("appointmentInfo").innerHTML = `<li class="text-muted">لا يوجد موعد مرتبط</li>`;
      document.getElementById("diagnosisText").value = "";
      return;
    }
    const date = appointment.appointment_datetime?.substring(0, 10) ?? "-";
    const time = appointment.appointment_datetime?.substring(11, 16) ?? "-";
    document.getElementById("appointmentInfo").innerHTML = `
      <li><span>رقم الموعد</span><strong>${appointment.id}</strong></li>
      <li><span>التاريخ</span><strong>${date}</strong></li>
      <li><span>الوقت</span><strong>${time}</strong></li>
      <li><span>الحالة</span><strong>${badge(appointment.status)}</strong></li>
      <li><span>التشخيص الحالي</span><strong>${appointment.diagnosis || "-"}</strong></li>
    `;
    document.getElementById("diagnosisText").value = appointment.diagnosis || "";
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

  function renderMedicalHistory(labs, radiology, prescriptions, appointments) {
    document.getElementById("labsTab").innerHTML = makeHistoryTable(
      ["نوع التحليل", "النتيجة", "الحالة", "التاريخ"],
      labs.map((file) => `
        <tr><td>${file.request_name ?? "-"}</td><td>${file.result ?? "-"}</td><td>${badge(file.status)}</td><td>${file.created_at}</td></tr>
      `)
    );

    document.getElementById("radiologyTab").innerHTML = makeHistoryTable(
      ["نوع الأشعة", "التقرير", "الحالة", "التاريخ"],
      radiology.map((file) => `
        <tr><td>${file.request_name ?? "-"}</td><td>${file.result ?? "-"}</td><td>${badge(file.status)}</td><td>${file.created_at}</td></tr>
      `)
    );

    document.getElementById("prescriptionsTab").innerHTML = makeHistoryTable(
      ["الدواء", "الجرعة", "التعليمات"],
      prescriptions.map((item) => `
        <tr><td>${item.medication}</td><td>${item.dosage}</td><td>${item.instruction}</td></tr>
      `)
    );

    document.getElementById("appointmentsTab").innerHTML = makeHistoryTable(
      ["التاريخ", "التشخيص", "الحالة"],
      appointments.map((item) => `
        <tr><td>${item.appointment_datetime}</td><td>${item.diagnosis || "-"}</td><td>${badge(item.status)}</td></tr>
      `)
    );
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

  document.getElementById("saveDiagnosisBtn").addEventListener("click", async () => {
    if (!currentAppointmentId) {
      showAlert("patientMessage", "لا يوجد موعد لحفظ التشخيص عليه", "danger");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/doctor/appointments/${currentAppointmentId}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ diagnosis: document.getElementById("diagnosisText").value.trim() })
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("تعذر حفظ التشخيص");
      await loadPatient();
      showAlert("patientMessage", "تم حفظ التشخيص بنجاح");
    } catch (error) {
      showAlert("patientMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  });

  document.getElementById("completeAppointmentBtn").addEventListener("click", async () => {
    if (!currentAppointmentId) {
      showAlert("patientMessage", "لا يوجد موعد لإنهائه", "danger");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/doctor/appointments/${currentAppointmentId}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          status: "completed",
          diagnosis: document.getElementById("diagnosisText").value.trim()
        })
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("تعذر إنهاء الموعد");
      await loadPatient();
      showAlert("patientMessage", "تم إنهاء الموعد");
    } catch (error) {
      showAlert("patientMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  });

  async function sendMedicalFileRequest(fileType, requestNameElementId, notesElementId, successMessage) {
    try {
      const response = await fetch(`${API_URL}/doctor/medical-files`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          patient_id: Number(patientId),
          file_type: fileType,
          request_name: document.getElementById(requestNameElementId).value,
          notes: document.getElementById(notesElementId).value.trim()
        })
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("تعذر إرسال الطلب");
      document.getElementById(notesElementId).value = "";
      await loadPatient();
      showAlert("patientMessage", successMessage);
    } catch (error) {
      showAlert("patientMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  }

  document.getElementById("sendLabBtn").addEventListener("click", () => {
    sendMedicalFileRequest("Lab", "labType", "labNotes", "تم إرسال طلب التحليل");
  });

  document.getElementById("sendRadiologyBtn").addEventListener("click", () => {
    sendMedicalFileRequest("Radiology", "radiologyType", "radiologyNotes", "تم إرسال طلب الأشعة");
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

  document.getElementById("savePrescriptionsBtn").addEventListener("click", async () => {
    if (!prescriptionDraft.length) {
      showAlert("patientMessage", "لا توجد أدوية لحفظها", "danger");
      return;
    }
    if (!currentAppointmentId) {
      showAlert("patientMessage", "لا يوجد موعد لحفظ الوصفة عليه", "danger");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/doctor/prescriptions`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          appointment_id: currentAppointmentId,
          items: prescriptionDraft
        })
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("تعذر حفظ الوصفة");
      prescriptionDraft.length = 0;
      renderDraft();
      await loadPatient();
      showAlert("patientMessage", "تم حفظ الوصفة");
    } catch (error) {
      showAlert("patientMessage", error.message || "حدث خطأ غير متوقع", "danger");
    }
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });

  loadPatient();
}