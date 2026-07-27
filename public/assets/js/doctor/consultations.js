const consultationsUser = requireRole("General");
if (consultationsUser) {
  fillSharedLayout("doctor-consultations");

  const statusFilter = document.getElementById("consultationStatus");
  const search = document.getElementById("consultationSearch");
  const table = document.getElementById("consultationsTable");
  const details = document.getElementById("consultationDetails");
  const reply = document.getElementById("replyText");
  let selectedId = null;
  let consultationsCache = [];

  function authHeaders(extra = {}) {
    return {
      "Authorization": `Bearer ${getToken()}`,
      "Accept": "application/json",
      ...extra
    };
  }

  async function loadConsultations() {
    const params = new URLSearchParams();
    if (statusFilter.value !== "All") params.set("status", statusFilter.value.toLowerCase());
    if (search.value.trim()) params.set("search", search.value.trim());

    try {
      const response = await fetch(`${API_URL}/doctor/consultations?${params.toString()}`, {
        headers: authHeaders()
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر تحميل الاستشارات");
      }

      const data = await response.json();
      consultationsCache = data.consultations;
      renderConsultations();
    } catch (error) {
      table.innerHTML = `<tr><td colspan="5" class="text-muted">${error.message || "حدث خطأ غير متوقع"}</td></tr>`;
    }
  }

  function renderConsultations() {
    table.innerHTML = consultationsCache.map((consultation) => `
      <tr>
        <td>${consultation.patient_name ?? "-"}</td>
        <td>${shortText(consultation.message, 70)}</td>
        <td>${badge(consultation.status)}</td>
        <td>${consultation.created_at}</td>
        <td><button class="btn btn-outline-secondary" type="button" data-open-consultation="${consultation.id}">فتح / الرد</button></td>
      </tr>
    `).join("");
  }

  function openConsultation(id) {
    selectedId = Number(id);
    const consultation = consultationsCache.find((item) => item.id === selectedId);
    if (!consultation) return;

    details.innerHTML = `
      <strong>${consultation.patient_name ?? "-"}</strong>
      <p class="mt-2">${consultation.message}</p>
      <div class="mb-2">${badge(consultation.status)}</div>
      <p class="text-muted mb-0">${consultation.doctor_reply || "لا يوجد رد بعد"}</p>
    `;
    reply.value = consultation.doctor_reply || "";
  }

  table.addEventListener("click", (event) => {
    const id = event.target.closest("[data-open-consultation]")?.dataset.openConsultation;
    if (id) openConsultation(id);
  });

  document.getElementById("sendReplyBtn").addEventListener("click", async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`${API_URL}/doctor/consultations/${selectedId}/reply`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ doctor_reply: reply.value.trim() })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("تعذر إرسال الرد");
      }

      await loadConsultations();
      openConsultation(selectedId);
    } catch (error) {
      alert(error.message || "حدث خطأ غير متوقع");
    }
  });

  statusFilter.addEventListener("change", loadConsultations);
  search.addEventListener("input", loadConsultations);
  loadConsultations();
}