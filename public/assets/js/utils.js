const MOCK_USERS = [
  { email: "admin@clinic.test", password: "123456", name: "مدير النظام", role: "Admin", department: "الإدارة" },
  { email: "doctor@clinic.test", password: "123456", name: "د. سارة ناصر", role: "General", department: "العيادة العامة" },
  { email: "lab@clinic.test", password: "123456", name: "أخصائي المختبر", role: "Lab", department: "المختبر" },
  { email: "radiology@clinic.test", password: "123456", name: "أخصائي الأشعة", role: "Radiology", department: "الأشعة" }
];

const SEED_DOCTORS = [
  { id: 1, name: "د. سارة ناصر", email: "doctor@clinic.test", phone: "0551002003", department: "العيادة العامة", type: "General" },
  { id: 2, name: "أخصائي المختبر", email: "lab@clinic.test", phone: "0551002004", department: "المختبر", type: "Lab" },
  { id: 3, name: "أخصائي الأشعة", email: "radiology@clinic.test", phone: "0551002005", department: "الأشعة", type: "Radiology" },
  { id: 4, name: "د. ماجد الحربي", email: "majed@clinic.test", phone: "0551002006", department: "الباطنية", type: "General" }
];

const SEED_PATIENTS = [
  { id: 101, name: "محمد العتيبي", birthDate: "1984-02-14", age: 42, gender: "ذكر", phone: "0508891122", address: "الرياض - حي النرجس", file: "P-1024" },
  { id: 102, name: "نورة القحطاني", birthDate: "1992-09-20", age: 34, gender: "أنثى", phone: "0557784411", address: "جدة - حي السلامة", file: "P-1025" },
  { id: 103, name: "خالد الشهري", birthDate: "1975-03-05", age: 51, gender: "ذكر", phone: "0541127788", address: "الدمام - حي الفيصلية", file: "P-1026" }
];

const SEED_APPOINTMENTS = [
  { id: 9001, patientId: 101, doctorId: 1, date: "2026-06-22", time: "09:30", status: "Pending", diagnosis: "", reason: "كشف عام" },
  { id: 9002, patientId: 102, doctorId: 1, date: "2026-06-22", time: "10:15", status: "Pending", diagnosis: "", reason: "متابعة نتائج" },
  { id: 9003, patientId: 103, doctorId: 1, date: "2026-06-20", time: "11:00", status: "Completed", diagnosis: "ارتفاع ضغط مستقر", reason: "استشارة" }
];

const SEED_CONSULTATIONS = [
  { id: 301, patientId: 101, message: "أشعر بتعب وخفقان عند صعود الدرج، هل أحتاج مراجعة عاجلة؟", reply: "", status: "Open", date: "2026-06-22" },
  { id: 302, patientId: 102, message: "هل أستمر على جرعة الدواء الحالية بعد تحليل السكر؟", reply: "نعم، استمري حتى موعد المراجعة.", status: "Answered", date: "2026-06-21" },
  { id: 303, patientId: 103, message: "هل أدوية الضغط تؤخذ صباحًا أم مساءً؟", reply: "", status: "Closed", date: "2026-06-18" }
];

const SEED_MEDICAL_FILES = [
  { id: 5001, patientId: 101, appointmentId: 9001, requestBy: "د. سارة ناصر", file_type: "Lab", requestName: "CBC", notes: "تقييم فقر الدم", result: "Pending", file_url: "", performed_by: "", status: "Pending", date: "2026-06-22" },
  { id: 5002, patientId: 102, appointmentId: 9002, requestBy: "د. سارة ناصر", file_type: "Lab", requestName: "HbA1c", notes: "متابعة السكري", result: "HbA1c = 7.1", file_url: "", performed_by: "أخصائي المختبر", status: "Completed", date: "2026-06-21" },
  { id: 6001, patientId: 101, appointmentId: 9001, requestBy: "د. سارة ناصر", file_type: "Radiology", requestName: "X-Ray", notes: "ألم صدر", result: "Pending", file_url: "", performed_by: "", status: "Pending", date: "2026-06-22" },
  { id: 6002, patientId: 103, appointmentId: 9003, requestBy: "د. ماجد الحربي", file_type: "Radiology", requestName: "Ultrasound", notes: "ألم متقطع", result: "No acute abnormality.", file_url: "", performed_by: "أخصائي الأشعة", status: "Completed", date: "2026-06-19" }
];

const SEED_PRESCRIPTIONS = [
  { id: 7001, appointmentId: 9003, patientId: 103, medication: "Amlodipine", dosage: "5mg", instruction: "مرة يوميًا صباحًا" }
];

function getRootPrefix() {
  return location.pathname.includes("/pages/") || location.pathname.includes("\\pages\\") ? "../../" : "";
}

function getStored(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedStore(key, value) {
  if (!localStorage.getItem(key)) setStored(key, value);
}

function seedAllData() {
  seedStore("doctors", SEED_DOCTORS);
  seedStore("patients", SEED_PATIENTS);
  seedStore("appointments", SEED_APPOINTMENTS);
  seedStore("consultations", SEED_CONSULTATIONS);
  seedStore("medical_files", SEED_MEDICAL_FILES);
  seedStore("prescriptions", SEED_PRESCRIPTIONS);
}

function getDoctors() {
  seedAllData();
  return getStored("doctors", []);
}

function getPatients() {
  seedAllData();
  return getStored("patients", []);
}

function getAppointments() {
  seedAllData();
  return getStored("appointments", []);
}

function getConsultations() {
  seedAllData();
  return getStored("consultations", []);
}

function getMedicalFiles() {
  seedAllData();
  return getStored("medical_files", []);
}

function getPrescriptions() {
  seedAllData();
  return getStored("prescriptions", []);
}

function patientById(id) {
  return getPatients().find((patient) => patient.id === Number(id));
}

function appointmentById(id) {
  return getAppointments().find((appointment) => appointment.id === Number(id));
}

function todayString() {
  return "2026-06-22";
}

function badge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function showAlert(targetId, message, type = "success") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.textContent = message;
  target.className = `alert alert-${type === "success" ? "success" : "danger"}`;
  target.classList.remove("d-none");
}

function shortText(value, length = 48) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function updateAppointment(id, patch) {
  const updated = getAppointments().map((appointment) => appointment.id === Number(id) ? { ...appointment, ...patch } : appointment);
  setStored("appointments", updated);
}

function addMedicalFile(file) {
  const files = getMedicalFiles();
  const created = { id: Date.now(), date: todayString(), status: "Pending", result: "Pending", file_url: "", performed_by: "", ...file };
  setStored("medical_files", [...files, created]);
  return created;
}

function updateMedicalFile(id, patch) {
  const updated = getMedicalFiles().map((file) => file.id === Number(id) ? { ...file, ...patch } : file);
  setStored("medical_files", updated);
}

function addPrescription(prescription) {
  setStored("prescriptions", [...getPrescriptions(), { id: Date.now() + Math.random(), ...prescription }]);
}
