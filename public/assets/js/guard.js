function requireAuth() {
  if (!getToken() || !getCurrentUser()) {
    location.href = `${getRootPrefix()}${APP_ROUTES.login}`;
    return null;
  }
  return getCurrentUser();
}

function requireRole(role) {
  const user = requireAuth();
  if (!user) return null;
  if (user.role !== role) {
    redirectByUserType(user);
    return null;
  }
  return user;
}

function requireDoctorType(types) {
  const user = requireAuth();
  if (!user) return null;
  if (!types.includes(user.role)) {
    redirectByUserType(user);
    return null;
  }
  return user;
}

function fillSharedLayout(activePage) {
  const user = requireAuth();
  if (!user) return null;
  const nameTarget = document.querySelector("[data-user-name]");
  const roleTarget = document.querySelector("[data-user-role]");
  const departmentTarget = document.querySelector("[data-user-department]");
  const avatarTarget = document.querySelector("[data-avatar]");
  const logoutButton = document.querySelector("[data-logout]");
  if (nameTarget) nameTarget.textContent = user.name;
  if (roleTarget) roleTarget.textContent = user.role;
  if (departmentTarget) departmentTarget.textContent = user.department || "";
  if (avatarTarget) avatarTarget.textContent = user.name.trim().charAt(0);
  if (logoutButton) logoutButton.addEventListener("click", logout);
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === activePage);
  });
  return user;
}
