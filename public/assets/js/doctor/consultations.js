const consultationsUser = requireRole("General");
if (consultationsUser) {
  fillSharedLayout("doctor-consultations");

  const statusFilter = document.getElementById("consultationStatus");
  const search = document.getElementById("consultationSearch");
  const table = document.getElementById("consultationsTable");
  const details = document.getElementById("consultationDetails");
  const reply = document.getElementById("replyText");
  let selectedId = null;

  function renderConsultations() {
    const status = statusFilter.value;
    const query = search.value.trim().toLowerCase();
    const rows = getConsultations().filter((consultation) => {
      const patient = patientById(consultation.patientId);
      const matchesStatus = status === "All" || consultation.status === status;
      const matchesSearch = patient.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });

    table.innerHTML = rows.map((consultation) => {
      const patient = patientById(consultation.patientId);
      return `
        <tr>
          <td>${patient.name}</td>
          <td>${shortText(consultation.message, 70)}</td>
          <td>${badge(consultation.status)}</td>
          <td>${consultation.date}</td>
          <td><button class="btn btn-outline-secondary" type="button" data-open-consultation="${consultation.id}">فتح / الرد</button></td>
        </tr>
      `;
    }).join("");
  }

  function openConsultation(id) {
    selectedId = Number(id);
    const consultation = getConsultations().find((item) => item.id === selectedId);
    const patient = patientById(consultation.patientId);
    details.innerHTML = `
      <strong>${patient.name}</strong>
      <p class="mt-2">${consultation.message}</p>
      <div class="mb-2">${badge(consultation.status)}</div>
      <p class="text-muted mb-0">${consultation.reply || "لا يوجد رد بعد"}</p>
    `;
    reply.value = consultation.reply || "";
  }

  table.addEventListener("click", (event) => {
    const id = event.target.closest("[data-open-consultation]")?.dataset.openConsultation;
    if (id) openConsultation(id);
  });

  document.getElementById("sendReplyBtn").addEventListener("click", () => {
    if (!selectedId) return;
    const updated = getConsultations().map((consultation) => consultation.id === selectedId ? {
      ...consultation,
      reply: reply.value.trim(),
      status: "Answered"
    } : consultation);
    setStored("consultations", updated);
    openConsultation(selectedId);
    renderConsultations();
  });

  statusFilter.addEventListener("change", renderConsultations);
  search.addEventListener("input", renderConsultations);
  renderConsultations();
}
