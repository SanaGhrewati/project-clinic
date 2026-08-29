const appointmentsUser = requireRole("General");
if (appointmentsUser) {
    fillSharedLayout("doctor-appointments");

    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const patientSearch = document.getElementById("patientSearch");
    const table = document.getElementById("appointmentsTable");

    let allAppointments = [];

    function todayISODate() {
        return new Date().toISOString().split("T")[0];
    }

    function splitDatetime(value) {
        const [datePart = "", timePart = ""] = String(value || "").split(" ");
        return { date: datePart, time: timePart.slice(0, 5) };
    }

    dateFilter.value = todayISODate();

    function renderAppointmentsTable() {
        const status = statusFilter.value;
        const date = dateFilter.value;
        const query = patientSearch.value.trim().toLowerCase();

        const rows = allAppointments.filter((appointment) => {
            const patientName =
                appointment.patient?.user?.name ||
                appointment.patient?.name ||
                "";
            const { date: appointmentDate } = splitDatetime(
                appointment.appointment_datetime,
            );
            const matchesStatus =
                status === "All" || appointment.status === status;
            const matchesDate = !date || appointmentDate === date;
            const matchesSearch =
                !query || patientName.toLowerCase().includes(query);
            return matchesStatus && matchesDate && matchesSearch;
        });

        table.innerHTML = rows
            .map((appointment) => {
                const patient = appointment.patient || null;
                const patientName = patient?.user?.name || patient?.name || "-";
                const { date: appointmentDate, time: appointmentTime } =
                    splitDatetime(appointment.appointment_datetime);
                const openFileLink = patient
                    ? `<a class="btn btn-outline-secondary" href="patient-details.html?appointmentId=${appointment.id}&patientId=${patient.id}">فتح الملف</a>`
                    : "";

                return `
        <tr>
          <td>${patientName}</td>
          <td>${appointmentDate}</td>
          <td>${appointmentTime}</td>
          <td>${badge(appointment.status)}</td>
          <td>${appointment.diagnosis || "-"}</td>
          <td>
            <div class="actions">
              ${openFileLink}
              <button class="btn btn-success" type="button" data-complete="${appointment.id}">Completed</button>
            </div>
          </td>
        </tr>
      `;
            })
            .join("");
    }

    // GET /doctor/appointments: مفترض أنه يُرجع مصفوفة مواعيد الطبيب الحالي (يُعرف من التوكن، بدون إرسال doctor_id)
    // كل عنصر متوقع: id, appointment_datetime, status, diagnosis
    // وإن كان الموعد محجوزًا: patient (يحتوي id، واسم المريض عبر patient.user.name)
    async function fetchAppointments() {
        try {
            const response = await fetch(`${API_URL}/doctor/appointments`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "تعذر تحميل المواعيد");
            }

            allAppointments = Array.isArray(data) ? data : data.data || [];
            document
                .getElementById("appointmentsMessage")
                .classList.add("d-none");
            renderAppointmentsTable();
        } catch (error) {
            allAppointments = [];
            table.innerHTML = "";
            showAlert("appointmentsMessage", error.message, "danger");
        }
    }

    table.addEventListener("click", async (event) => {
        const completeButton = event.target.closest("[data-complete]");
        const appointmentId = completeButton?.dataset.complete;
        if (!appointmentId) return;

        // PATCH /doctor/appointments/{id}: الجسم المفترض { "status": "completed" } (نفس قيمة enum الحقيقية في الـ migration)
        completeButton.disabled = true;
        try {
            const response = await fetch(
                `${API_URL}/doctor/appointments/${appointmentId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ status: "completed" }),
                },
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "تعذر تحديث حالة الموعد");
            }

            await fetchAppointments();
        } catch (error) {
            showAlert("appointmentsMessage", error.message, "danger");
            completeButton.disabled = false;
        }
    });

    statusFilter.addEventListener("change", renderAppointmentsTable);
    dateFilter.addEventListener("change", renderAppointmentsTable);
    patientSearch.addEventListener("input", renderAppointmentsTable);

    fetchAppointments();

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
        document
            .getElementById("appointmentFormMessage")
            .classList.add("d-none");
        appointmentDateInput.min = todayISODate();
        addedTimesThisSession.length = 0;
        renderAddedTimes();
        appointmentModal.classList.add("show");
    }

    function closeAppointmentModal() {
        appointmentModal.classList.remove("show");
    }

    document
        .getElementById("addAppointmentBtn")
        .addEventListener("click", openAppointmentModal);
    appointmentModal
        .querySelectorAll("[data-close-modal]")
        .forEach((button) =>
            button.addEventListener("click", closeAppointmentModal),
        );

    appointmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const date = appointmentDateInput.value;
        const time = appointmentTimeInput.value;

        if (!date || !time) {
            showAlert(
                "appointmentFormMessage",
                "يرجى اختيار التاريخ والوقت",
                "danger",
            );
            return;
        }

        // appointment_datetime بصيغة YYYY-MM-DD HH:mm:ss تمامًا كما هو متفق عليه في عقد الـ API
        const appointmentDatetime = `${date} ${time}:00`;
        const submitButton = appointmentForm.querySelector(
            'button[type="submit"]',
        );
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_URL}/doctor/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    appointment_datetime: appointmentDatetime,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "تعذر إنشاء الموعد");
            }

            addedTimesThisSession.push(`${date} - ${time}`);
            renderAddedTimes();
            appointmentTimeInput.value = "";
            showAlert("appointmentFormMessage", "تمت إضافة الموعد بنجاح");
            await fetchAppointments();
        } catch (error) {
            showAlert("appointmentFormMessage", error.message, "danger");
        } finally {
            submitButton.disabled = false;
        }
    });
}
