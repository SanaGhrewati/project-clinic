const staffRequestUser = requireDoctorType(["Lab", "Radiology"]);
if (staffRequestUser) {
    fillSharedLayout("staff-request");

    const params = new URLSearchParams(location.search);
    const requestId = params.get("id");
    const isLab = staffRequestUser.role === "Lab";

    function authHeaders(extra = {}) {
        return {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            ...extra,
        };
    }

    function statusLabel(status) {
        return status === "done" ? "Completed" : "Pending";
    }

    document.getElementById("requestTitle").textContent = isLab
        ? "تفاصيل طلب التحليل"
        : "تفاصيل طلب الأشعة";
    document.getElementById("resultHeading").textContent = isLab
        ? "نتيجة التحليل"
        : "تقرير الأشعة";
    document.getElementById("resultLabel").textContent = isLab
        ? "نتيجة التحليل"
        : "تقرير الأشعة";
    document.getElementById("saveResultBtn").textContent = isLab
        ? "حفظ النتيجة"
        : "حفظ التقرير";

    async function loadRequest() {
        if (!requestId) {
            showAlert("requestMessage", "لم يتم تحديد طلب", "danger");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/staff/requests/${requestId}`,
                {
                    headers: authHeaders(),
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error("تعذر تحميل تفاصيل الطلب");
            }

            const data = await response.json();
            renderRequest(data.request);
        } catch (error) {
            showAlert(
                "requestMessage",
                error.message || "حدث خطأ غير متوقع",
                "danger"
            );
        }
    }

    function renderRequest(request) {
        document.getElementById("requestSubtitle").textContent =
            request.patient_name ?? "-";
        document.getElementById("requestName").textContent =
            request.request_name ?? "-";
        document.getElementById("requestNotes").textContent =
            request.notes || "لا توجد ملاحظات إضافية";
        document.getElementById("resultText").value =
            request.status === "done" ? request.result || "" : "";

        document.getElementById("requestInfo").innerHTML = `
      <li><span>اسم المريض</span><strong>${
          request.patient_name ?? "-"
      }</strong></li>
      <li><span>الطبيب الطالب</span><strong>${
          request.requested_by_name ?? "-"
      }</strong></li>
      <li><span>نوع الطلب</span><strong>${request.file_type}</strong></li>
      <li><span>الحالة الحالية</span><strong>${badge(
          statusLabel(request.status)
      )}</strong></li>
      <li><span>تاريخ الطلب</span><strong>${request.created_at}</strong></li>
    `;
    }

    document
        .getElementById("saveResultBtn")
        .addEventListener("click", async () => {
            const resultText = document
                .getElementById("resultText")
                .value.trim();
            if (!resultText) {
                showAlert(
                    "requestMessage",
                    "يرجى إدخال النتيجة قبل الحفظ",
                    "danger"
                );
                return;
            }

            const formData = new FormData();
            formData.append("result", resultText);

            const fileInput = document.getElementById("resultFile");
            if (fileInput.files[0]) {
                formData.append("file", fileInput.files[0]);
            }

            try {
                const response = await fetch(
                    `${API_URL}/staff/requests/${requestId}/result`,
                    {
                        method: "POST",
                        headers: authHeaders(),
                        body: formData,
                    }
                );

                if (response.status === 401) {
                    logout();
                    return;
                }

                if (!response.ok) {
                    throw new Error("تعذر حفظ النتيجة");
                }

                await loadRequest();
                showAlert(
                    "requestMessage",
                    isLab ? "تم حفظ نتيجة التحليل" : "تم حفظ تقرير الأشعة"
                );
            } catch (error) {
                showAlert(
                    "requestMessage",
                    error.message || "حدث خطأ غير متوقع",
                    "danger"
                );
            }
        });

    loadRequest();
}
