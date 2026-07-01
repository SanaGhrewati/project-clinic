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
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
  
    const data = await response.json().catch(() => ({}));
  
    if (!response.ok) {
      throw new Error(data.message || "فشل تسجيل الدخول");
    }
  
    if (!data.token || !data.user) {
      throw new Error("استجابة تسجيل الدخول غير مكتملة");
    }
  
    const user = normalizeUser(data.user);
    saveAuth(data.token, user);
    return user;
  }
  