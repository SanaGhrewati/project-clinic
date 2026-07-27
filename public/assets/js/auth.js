function getToken() {
  return localStorage.getItem("token");
}

function normalizeUser(user) {
  const rawRole = String(user?.role || "").toLowerCase();
  const doctorType = user?.doctor_type || user?.doctorType || user?.type || "";
  let appRole = user?.role;

  if (rawRole === "doctor") {
      appRole = doctorType;
  } else if (rawRole === "admin") {
      appRole = "Admin";
  }

  return {
      ...user,
      role: appRole,
      doctor_type: doctorType || user?.doctor_type || appRole
  };
}

// نفترض أن دالتي getStored و setStored موجودتان في ملف utils.js
function getCurrentUser() {
  const sessionUser = getStored("sessionUser", null);
  if (sessionUser) return normalizeUser(sessionUser);

  const oldUser = getStored("user", null);
  if (!oldUser) return null;

  const normalized = normalizeUser(oldUser);
  setStored("sessionUser", normalized);
  return normalized;
}

function saveAuth(token, user) {
  const normalized = normalizeUser(user);
  localStorage.setItem("token", token);
  setStored("sessionUser", normalized);
  setStored("user", normalized);
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("sessionUser");
  localStorage.removeItem("user");
  location.href = `${getRootPrefix()}${APP_ROUTES.login}`;
}

function dashboardRouteFor(user) {
  const normalized = normalizeUser(user);

  if (normalized.role === "Admin") return APP_ROUTES.adminDashboard;
  if (normalized.role === "General") return APP_ROUTES.doctorDashboard;
  if (normalized.role === "Lab" || normalized.role === "Radiology") return APP_ROUTES.staffDashboard;

  throw new Error("نوع المستخدم غير معروف");
}

function redirectByUserType(user) {
  location.href = `${getRootPrefix()}${dashboardRouteFor(user)}`;
}

async function login(email, password) {
  // نفترض أن API_URL معرّف في ملف config.js
  const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json" // مهم جداً للتواصل مع Laravel API
      },
      body: JSON.stringify({
          email,
          password
      })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
      throw new Error(data.message || "فشل تسجيل الدخول، يرجى التأكد من البيانات.");
  }

  if (!data.token || !data.user) {
      throw new Error("استجابة السيرفر غير مكتملة، يرجى مراجعة الباك إند.");
  }

  const user = normalizeUser(data.user);
  saveAuth(data.token, user);
  return user;
}

// ------------------------------------------------------------------
// الجزء الجديد: ربط الدوال بنموذج الـ HTML (Form)
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError"); // الـ div المخصص للأخطاء في الصورة

  if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
          e.preventDefault(); // الأهم: إيقاف السلوك الافتراضي الذي يمسح الحقول

          // إخفاء رسالة الخطأ القديمة إن وجدت
          if (loginError) loginError.classList.add("d-none");

          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          const submitBtn = loginForm.querySelector("button[type='submit']");

          try {
              // تغيير حالة الزر أثناء التحميل لمنع الضغط المتكرر
              submitBtn.disabled = true;
              submitBtn.textContent = "جاري التحقق...";

              const user = await login(email, password);
              
              // توجيه المستخدم بعد نجاح تسجيل الدخول
              redirectByUserType(user);

          } catch (error) {
              // إظهار الخطأ للمستخدم
              if (loginError) {
                  loginError.textContent = error.message;
                  loginError.classList.remove("d-none");
              } else {
                  alert(error.message);
              }
          } finally {
              // إعادة الزر لحالته الطبيعية
              submitBtn.disabled = false;
              submitBtn.textContent = "دخول";
          }
      });
  }
});