/**
 * طبقة اتصال مشتركة لصفحات المختص (Lab / Radiology) بالـ Backend الفعلي فقط.
 * لا تحتوي على أي بيانات وهمية أو تخزين محلي (localStorage/sessionStorage) للتجربة —
 * كل البيانات المعروضة في صفحات المختص تُجلب من الـ API مباشرة.
 */

async function staffApiFetch(path, options = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
  } catch (networkError) {
    throw new Error("تعذر الاتصال بالخادم، تحقق من اتصال الشبكة");
  }

  // انتهاء صلاحية الجلسة/التوكن: نسجّل الخروج فورًا بدل عرض بيانات قديمة أو فاسدة.
  if (response.status === 401) {
    logout();
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error((data && data.message) || "حدث خطأ أثناء الاتصال بالخادم");
  }

  return data;
}

// بعض نقاط Laravel تُعيد القوائم كمصفوفة مباشرة، وبعضها يغلّفها داخل { data: [...] }.
// هذه الدالة تتعامل مع الشكلين دون افتراض أو اختلاق بيانات غير موجودة.
function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.requests)) return payload.requests;
  return [];
}

// أسماء مفاتيح GET /api/staff/stats غير مؤكدة لعدم وجود StaffController فعلي في الباك اند بعد
// (راجع ملاحظة الفحص). لذلك نجرّب أكثر من اسم محتمل بدل افتراض اسم واحد أو حساب الإحصائيات
// يدويًا داخل الواجهة، لأن الحساب اليدوي هو بالضبط ما طُلب إزالته.
function pickCount(source, keys) {
  if (!source) return 0;
  for (const key of keys) {
    if (typeof source[key] === "number") return source[key];
  }
  return 0;
}

// تحويل شكلي للعرض فقط. القيمة الفعلية المُرسلة إلى الـ API والمستقبلة منه تبقى دائمًا
// pending / done كما هي مخزّنة في قاعدة البيانات.
function statusToDisplay(status) {
  if (status === "pending") return "Pending";
  if (status === "done") return "Completed";
  return status || "-";
}

// تنسيق يدوي بالتقويم الميلادي الصريح لتفادي أن يقوم toLocaleString("ar", ...) بعرض
// تقويم هجري في بعض المتصفحات، ولإبقاء شكل التاريخ متسقًا مع بقية الواجهة.
function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${datePart} ${timePart}`;
}

// file_url المخزّن في قاعدة البيانات مسار نسبي (مثل storage/medical-files/report.pdf)
// وليس رابطًا كاملاً، فنبنيه فوق جذر التطبيق (بدون /api) ليصبح قابلاً للفتح فعليًا.
function resolveFileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const root = API_URL.replace(/\/api\/?$/, "");
  return `${root}/${String(path).replace(/^\/+/, "")}`;
}
