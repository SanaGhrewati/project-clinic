const staffRequestUser = requireDoctorType(["Lab", "Radiology"]);
if (staffRequestUser) {
  fillSharedLayout("staff-request");

  const params = new URLSearchParams(location.search);
  const ownRequests = getMedicalFiles().filter((file) => file.file_type === staffRequestUser.role);
  const request = ownRequests.find((file) => file.id === Number(params.get("id"))) || ownRequests[0];
  const patient = patientById(request.patientId);
  const isLab = staffRequestUser.role === "Lab";

  document.getElementById("requestTitle").textContent = isLab ? "تفاصيل طلب التحليل" : "تفاصيل طلب الأشعة";
  document.getElementById("requestSubtitle").textContent = patient.name;
  document.getElementById("resultHeading").textContent = isLab ? "نتيجة التحليل" : "تقرير الأشعة";
  document.getElementById("resultLabel").textContent = isLab ? "نتيجة التحليل" : "تقرير الأشعة";
  document.getElementById("saveResultBtn").textContent = isLab ? "حفظ النتيجة" : "حفظ التقرير";
  document.getElementById("requestName").textContent = request.requestName;
  document.getElementById("requestNotes").textContent = request.notes || "لا توجد ملاحظات إضافية";
  document.getElementById("resultText").value = request.status === "Completed" ? request.result : "";

  document.getElementById("requestInfo").innerHTML = `
    <li><span>اسم المريض</span><strong>${patient.name}</strong></li>
    <li><span>الطبيب الطالب</span><strong>${request.requestBy}</strong></li>
    <li><span>نوع الطلب</span><strong>${request.file_type}</strong></li>
    <li><span>الحالة الحالية</span><strong>${badge(request.status)}</strong></li>
    <li><span>تاريخ الطلب</span><strong>${request.date}</strong></li>
  `;

  document.getElementById("saveResultBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("resultFile");
    updateMedicalFile(request.id, {
      result: document.getElementById("resultText").value.trim(),
      file_url: fileInput.files[0]?.name || request.file_url || "",
      performed_by: staffRequestUser.name,
      status: "Completed"
    });
    showAlert("requestMessage", isLab ? "تم حفظ نتيجة التحليل" : "تم حفظ تقرير الأشعة");
  });
}
