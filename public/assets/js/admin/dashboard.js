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

        const stats = await response.json();

        Object.entries(stats).forEach(([key, value]) => {

            const element = document.querySelector(`[data-stat="${key}"]`);

            if (element) {
                element.textContent = value;
            }

        });

    } catch (error) {

        console.log(error);

    }

}

