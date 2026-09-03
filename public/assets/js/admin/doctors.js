const adminDoctorUser = requireRole("Admin");

if (adminDoctorUser) {

    fillSharedLayout("admin-doctors");

    const table = document.getElementById("doctorsTable");
    const search = document.getElementById("doctorSearch");
    const filter = document.getElementById("doctorTypeFilter");
    const modal = document.getElementById("doctorModal");
    const form = document.getElementById("doctorForm");
    const modalTitle = document.getElementById("doctorModalTitle");

    let doctors = [];
    let editingId = null;

    async function loadDoctors() {

        try {

            const response = await fetch(API_URL + "/doctors", {
                headers: {
                    "Authorization": "Bearer " + getToken(),
                    "Accept": "application/json"
                }
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error((data && data.message) || "تعذر تحميل قائمة الأطباء");
            }

            doctors = Array.isArray(data) ? data : [];

            renderDoctorsTable();

        } catch (error) {

            doctors = [];
            table.innerHTML = "";
            showAlert("doctorsMessage", error.message || "حدث خطأ غير متوقع", "danger");

        }

    }

    function openModal(doctor = null) {

        editingId = doctor ? doctor.id : null;

        modalTitle.textContent = doctor ? "تعديل طبيب" : "إضافة طبيب";

        form.reset();

        if (doctor) {

            form.elements.id.value = doctor.id;
            form.elements.name.value = doctor.user.name;
            form.elements.email.value = doctor.user.email;
            form.elements.phone.value = doctor.mobile;
            form.elements.department.value = doctor.department_id;
            form.elements.type.value = doctor.doctor_type;

        }

        modal.classList.add("show");

    }

    function closeModal() {

        modal.classList.remove("show");

        form.reset();

        editingId = null;

    }

    function renderDoctorsTable() {

        const query = search.value.toLowerCase();

        const type = filter.value;

        const filtered = doctors.filter((doctor) => {

            const text = (
                doctor.user.name +
                doctor.user.email +
                doctor.mobile
            ).toLowerCase();

            const okSearch = text.includes(query);

            const okType = type === "All" || doctor.doctor_type === type;

            return okSearch && okType;

        });

        table.innerHTML = filtered.map(doctor =>
        `<tr>
            <td>${doctor.user.name}</td>
            <td>${doctor.user.email}</td>
            <td>${doctor.mobile}</td>
            <td>${doctor.department.name}</td>
            <td>${doctor.doctor_type}</td>
            <td>
                <button
                    class="btn btn-outline-secondary"
                    data-edit="${doctor.id}">
                    تعديل
                </button>

                <button
                    class="btn btn-danger"
                    data-delete="${doctor.id}">
                    حذف
                </button>
            </td>
        </tr>
        `).join("");
    }

    document.getElementById("addDoctorBtn")
        .addEventListener("click", () => openModal());

    document.querySelectorAll("[data-close-modal]")
        .forEach(btn => btn.addEventListener("click", closeModal));

    search.addEventListener("input", renderDoctorsTable);

    filter.addEventListener("change", renderDoctorsTable);

    table.addEventListener("click", async function (e) {

        const editId = e.target.dataset.edit;

        const deleteId = e.target.dataset.delete;

        if (editId) {

            const doctor = doctors.find(d => d.id == editId);

            openModal(doctor);

        }

        if (deleteId) {

            if (!confirm("هل تريد حذف الطبيب؟")) return;

            try {

                const response = await fetch(API_URL + "/doctors/" + deleteId, {

                    method: "DELETE",

                    headers: {

                        "Authorization": "Bearer " + getToken(),

                        "Accept": "application/json"

                    }

                });

                if (response.status === 401) {
                    logout();
                    return;
                }

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error((data && data.message) || "تعذر حذف الطبيب");
                }

                showAlert("doctorsMessage", (data && data.message) || "تم حذف الطبيب بنجاح");
                await loadDoctors();

            } catch (error) {

                showAlert("doctorsMessage", error.message || "حدث خطأ غير متوقع", "danger");

            }

        }

    });

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const body = {

            name: form.elements.name.value,email: form.elements.email.value,

            password: form.elements.password.value,

            mobile: form.elements.phone.value,

            department_id: form.elements.department.value,

            doctor_type: form.elements.type.value

        };

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {

            const response = editingId
                ? await fetch(API_URL + "/doctors/" + editingId, {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        "Authorization": "Bearer " + getToken(),

                        "Accept": "application/json"

                    },

                    body: JSON.stringify(body)

                })
                : await fetch(API_URL + "/doctors", {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        "Authorization": "Bearer " + getToken(),

                        "Accept": "application/json"

                    },

                    body: JSON.stringify(body)

                });

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error((data && data.message) || "تعذر حفظ بيانات الطبيب");
            }

            closeModal();
            showAlert("doctorsMessage", (data && data.message) || "تم الحفظ بنجاح");
            await loadDoctors();

        } catch (error) {

            showAlert("doctorsMessage", error.message || "حدث خطأ غير متوقع", "danger");

        } finally {

            submitButton.disabled = false;

        }

    });

    loadDoctors();

}
