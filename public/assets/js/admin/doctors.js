const adminDoctorUser = requireRole("Admin");
if (adminDoctorUser) {
  fillSharedLayout("admin-doctors");

  const table = document.getElementById("doctorsTable");
  const search = document.getElementById("doctorSearch");
  const filter = document.getElementById("doctorTypeFilter");
  const modal = document.getElementById("doctorModal");
  const form = document.getElementById("doctorForm");
  const modalTitle = document.getElementById("doctorModalTitle");
  let editingId = null;

  function openModal(doctor) {
    editingId = doctor ? doctor.id : null;
    modalTitle.textContent = doctor ? "تعديل طبيب" : "إضافة طبيب";
    form.reset();
    form.elements.id.value = doctor?.id || "";
    form.elements.name.value = doctor?.name || "";
    form.elements.email.value = doctor?.email || "";
    form.elements.password.value = "";
    form.elements.phone.value = doctor?.phone || "";
    form.elements.department.value = doctor?.department || "";
    form.elements.type.value = doctor?.type || "General";
    modal.classList.add("show");
  }

  function closeModal() {
    modal.classList.remove("show");
    form.reset();
    editingId = null;
  }

  function renderDoctorsTable() {
    const query = search.value.trim().toLowerCase();
    const type = filter.value;
    const doctors = getDoctors().filter((doctor) => {
      const matchesQuery = [doctor.name, doctor.email, doctor.phone, doctor.department].join(" ").toLowerCase().includes(query);
      const matchesType = type === "All" || doctor.type === type;
      return matchesQuery && matchesType;
    });

    table.innerHTML = doctors.map((doctor) => `
      <tr>
        <td>${doctor.name}</td>
        <td>${doctor.email}</td>
        <td>${doctor.phone}</td>
        <td>${doctor.department}</td>
        <td>${badge(doctor.type)}</td>
        <td>
          <div class="actions">
            <button class="btn btn-outline-secondary" type="button" data-edit="${doctor.id}">تعديل</button>
            <button class="btn btn-danger" type="button" data-delete="${doctor.id}">حذف</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  document.getElementById("addDoctorBtn").addEventListener("click", () => openModal(null));
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  search.addEventListener("input", renderDoctorsTable);
  filter.addEventListener("change", renderDoctorsTable);

  table.addEventListener("click", (event) => {
    const editId = event.target.closest("[data-edit]")?.dataset.edit;
    const deleteId = event.target.closest("[data-delete]")?.dataset.delete;

    if (editId) openModal(getDoctors().find((doctor) => doctor.id === Number(editId)));
    if (deleteId && confirm("هل تريد حذف هذا المستخدم؟")) {
      setStored("doctors", getDoctors().filter((doctor) => doctor.id !== Number(deleteId)));
      renderDoctorsTable();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const doctor = {
      id: editingId || Date.now(),
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      phone: String(data.get("phone")).trim(),
      department: String(data.get("department")).trim(),
      type: String(data.get("type"))
    };

    if (editingId) {
      setStored("doctors", getDoctors().map((item) => item.id === editingId ? doctor : item));
    } else {
      setStored("doctors", [...getDoctors(), doctor]);
    }

    closeModal();
    renderDoctorsTable();
  });

  renderDoctorsTable();
}
