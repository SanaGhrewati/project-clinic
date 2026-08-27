const staffRequestUser = requireDoctorType(["Lab", "Radiology"]);
if (staffRequestUser) {
  fillSharedLayout("staff-request");

  const params = new URLSearchParams(location.search);
  const requestId = params.get("id");
  const isLab = staffRequestUser.role === "Lab";

  document.getElementById("requestTitle").textContent = isLab ? "تفاصيل طلب التحليل" : "تفاصيل طلب الأشعة";
  document.getElementById("resultHeading").textContent = isLab ? "نتيجة التحليل" : "تقرير الأشعة";
  document.getElementById("resultLabel").textContent = isLab ? "نتيجة التحليل" : "تقرير الأشعة";
  document.getElementById("saveResultBtn").textContent = isLab ? "حفظ النتيجة" : "حفظ التقرير";

  const requestNameEl = document.getElementById("requestName");
  const resultText = document.getElementById("resultText");
  const currentFileInfo = document.getElementById("currentFileInfo");
  const saveBtn = document.getElementById("saveResultBtn");

  let currentRequest = null;

  function renderRequest() {
    if (!currentRequest) return;

    document.getElementById("requestSubtitle").textContent = currentRequest.patient_name ?? "";
    // file_type يحدد نوع الطلب (Lab / Radiology) — لا يوجد اسم تحليل محدد في الباك اند.
    requestNameEl.textContent = currentRequest.file_type ?? "";
    resultText.value = currentRequest.result || "";

    if (currentRequest.file_url) {
      currentFileInfo.innerHTML = `الملف الحالي: <a href="${resolveFileUrl(currentRequest.file_url)}" target="_blank" rel="noopener noreferrer">فتح الملف</a>`;
    } else {
      currentFileInfo.textContent = "لا يوجد ملف مرفوع بعد";
    }

    document.getElementById("requestInfo").innerHTML = `
      <li><span>اسم المريض</span><strong>${currentRequest.patient_name ?? "-"}</strong></li>
      <li><span>الطبيب الطالب</span><strong>${currentRequest.doctor_name ?? "-"}</strong></li>
      <li><span>نوع الطلب</span><strong>${currentRequest.file_type ?? "-"}</strong></li>
      <li><span>الحالة الحالية</span><strong>${badge(statusToDisplay(currentRequest.status))}</strong></li>
      <li><span>تاريخ الطلب</span><strong>${formatDateTime(currentRequest.created_at)}</strong></li>
    `;
  }

  async function loadRequest() {
    if (!requestId) {
      showAlert("requestMessage", "لم يتم تحديد رقم الطلب في الرابط", "danger");
      saveBtn.disabled = true;
      return;
    }

    try {
      currentRequest = await staffApiFetch(`/staff/requests/${requestId}`);
      if (currentRequest) renderRequest();
    } catch (error) {
      showAlert("requestMessage", error.message, "danger");
      saveBtn.disabled = true;
    }
  }

  saveBtn.addEventListener("click", async () => {
    if (!currentRequest || !requestId) return;

    // نرسل فقط result كما هو محدد. file_url لا يُرسل هنا لعدم وجود نقطة رفع ملفات فعلية
    // بعد (راجع ملاحظة الفحص) — ولن يُختلق له أي قيمة وهمية من اسم الملف المحلي.
    const payload = { result: resultText.value.trim() };

    saveBtn.disabled = true;
    try {
      const updated = await staffApiFetch(`/staff/requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      currentRequest = updated && typeof updated === "object" ? updated : { ...currentRequest, ...payload };
      renderRequest();
      showAlert("requestMessage", isLab ? "تم حفظ نتيجة التحليل" : "تم حفظ تقرير الأشعة");
    } catch (error) {
      showAlert("requestMessage", error.message, "danger");
    } finally {
      saveBtn.disabled = false;
    }
  });

  loadRequest();
}
