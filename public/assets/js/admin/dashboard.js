const adminUser = requireRole("Admin");

if (adminUser) {

    fillSharedLayout("admin-dashboard");

    loadStats();

}

async function loadStats() {

    try {

        const response = await fetch(API_URL + "/admin/stats", {

            headers: {
                "Authorization": "Bearer " + getToken(),
                "Accept": "application/json"
            }

        });

        if (response.status === 401) {
            logout();
            return;
        }

        const stats = await response.json().catch(() => null);

        if (!response.ok || !stats) {
            throw new Error((stats && stats.message) || "تعذر تحميل إحصائيات لوحة الإدارة");
        }

        Object.entries(stats).forEach(([key, value]) => {

            const element = document.querySelector(`[data-stat="${key}"]`);

            if (element) {
                element.textContent = value;
            }

        });

    } catch (error) {

        showAlert("dashboardMessage", error.message || "حدث خطأ غير متوقع", "danger");

    }

}
