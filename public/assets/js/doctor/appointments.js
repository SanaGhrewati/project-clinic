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

  // ---- بداية الإضافة الخاصة بزر "إضافة موعد" ----
  const appointmentModal = document.getElementById("appointmentModal");
  const appointmentForm = document.getElementById("appointmentForm");
  const appointmentDateInput = document.getElementById("appointmentDate");
  const appointmentTimeInput = document.getElementById("appointmentTime");
  const addedTimesList = document.getElementById("addedTimesList");
  const addedTimesThisSession = [];

  function renderAddedTimes() {
    if (!addedTimesThisSession.length) {
      addedTimesList.innerHTML = "";
      return;
    }
    addedTimesList.innerHTML = `
      <div class="text-muted mb-2">تمت إضافتها في هذه الجلسة:</div>
      <ul class="info-list">
        ${addedTimesThisSession.map((item) => `<li><span>${item}</span></li>`).join("")}
      </ul>
    `;
  }

  function openAppointmentModal() {
    appointmentForm.reset();
    document.getElementById("appointmentFormMessage").classList.add("d-none");
    appointmentDateInput.min = new Date().toISOString().split("T")[0];
    addedTimesThisSession.length = 0;
    renderAddedTimes();
    appointmentModal.classList.add("show");
  }

  function closeAppointmentModal() {
    appointmentModal.classList.remove("show");
  }

  document.getElementById("addAppointmentBtn").addEventListener("click", openAppointmentModal);
  appointmentModal.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeAppointmentModal));

  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const date = appointmentDateInput.value;
    const time = appointmentTimeInput.value;

    if (!date || !time) {
      showAlert("appointmentFormMessage", "يرجى اختيار التاريخ والوقت", "danger");
      return;
    }

    // appointment_datetime هو نفس اسم الحقل الموجود في Appointment Model والـ migration بالضبط
    const appointmentDatetime = `${date} ${time}:00`;
    const submitButton = appointmentForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      // ملاحظة: هذا الـ endpoint (POST /doctor/appointments) غير موجود بعد في الباك إند الحالي.
      // هذا هو المسار المقترح فقط، بانتظار تأكيدك أو إنشائه فعليًا في routes/api.php
      const response = await fetch(`${API_URL}/doctor/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ appointment_datetime: appointmentDatetime })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "تعذر إنشاء الموعد");
      }

      addedTimesThisSession.push(`${date} - ${time}`);
      renderAddedTimes();
      appointmentTimeInput.value = "";
      showAlert("appointmentFormMessage", "تمت إضافة الموعد بنجاح");
    } catch (error) {
      showAlert("appointmentFormMessage", error.message, "danger");
    } finally {
      submitButton.disabled = false;
    }
  });
  // ---- نهاية الإضافة ----
}
