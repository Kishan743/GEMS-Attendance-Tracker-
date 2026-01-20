console.log("GEMS Attendance Extension loaded");

/* ======================================================
   SUBJECT CODE → SUBJECT NAME MAP
   ====================================================== */
const SUBJECT_MAP = {
  "APTITUDE": "Aptitude Classes",
  "SOFTSKILLS": "Soft Skills",
  "TECHNICALTRAINING": "Technical Training",
  "23ENG101": "Communicative English",
  "23MAT101": "Linear Algebra and Calculus",
  "23CSE101": "Introduction to Programming",
  "23ENG201": "Communicative English Laboratory",
  "23CME101": "Basic Civil and Mechanical Engineering",
  "23CSE201": "Computer Programming Laboratory",
  "23ME201": "Engineering Workshop",
  "23CHE102": "Chemistry",
  "23CHE202": "Chemistry Laboratory",
  "23HUM201": "Health and Wellness, Yoga and Sports",
  "23MAT108": "Discrete Mathematical Structures",
  "23CHE901": "Environmental Science",
  "23CSD103": "Digital Logic and Computer Organization",
  "23CSD105": "Introduction to Data Science",
  "23CSD106": "Data Engineering",
  "23CSD203": "Data Science Laboratory",
  "23CSD204": "Data Engineering Laboratory",
  "23IIC5M06": "Understanding Incubation and Entrepreneurship",
  "23IIC5M03": "Product Engineering and Design Thinking",
  "CTDS1": "Code Tantra",
  "23CSD603": "DevOps"
};

/* ======================================================
   THEMES (DARK / LIGHT – SOFT PAPER)
   ====================================================== */
const THEMES = {
  dark: {
    card: "#0f172a",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "rgba(255,255,255,0.08)"
  },
  light: {
    card: "#ffffff",
    text: "#0f172a",
    muted: "#475569",
    border: "#e5e7eb"
  }
};

function getTheme() {
  const saved = localStorage.getItem("attendanceTheme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return "dark"; // safe default
}


function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  localStorage.setItem("attendanceTheme", next);
  const oldBox = document.getElementById("attendance-info-box");
if (oldBox) oldBox.remove();
  showAttendanceInfo();
}

/* ======================================================
   UTILITY
   ====================================================== */
function toNumber(text) {
  const n = parseFloat(text.replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function getSubjectName(code) {
  return SUBJECT_MAP[code] || code;
}

/* ======================================================
   STUDENT INFO
   ====================================================== */
function extractStudentInfo() {
  const fields = document.querySelectorAll(".x-form-display-field");

  let studentName = "Unknown";
  let studentRollNumber = "Unknown";

  fields.forEach(el => {
    const text = el.textContent.trim();

    if (
      studentName === "Unknown" &&
      /^[A-Z ]{3,}$/.test(text) &&
      !/\d/.test(text)
    ) {
      studentName = text;
    }

    if (
      studentRollNumber === "Unknown" &&
      /^[A-Z0-9]{5,}$/.test(text) &&
      /\d/.test(text)
    ) {
      studentRollNumber = text;
    }
  });

  return { studentName, studentRollNumber };
}

/* ======================================================
   ATTENDANCE DATA
   ====================================================== */
function extractAttendanceData() {
  const rows = document.querySelectorAll(
    "fieldset.x-fieldset.bottom-border.x-fieldset-default"
  );

  let totalPresent = 0;
  let totalConducted = 0;
  let subjects = [];

  rows.forEach(row => {
    const fields = row.querySelectorAll(".x-form-display-field");
    if (fields.length < 4) return;

    const subjectCode = fields[1].textContent.trim();
    const present = toNumber(fields[2].textContent);
    const conducted = toNumber(fields[3].textContent);

    if (conducted > 0) {
      const percent = ((present / conducted) * 100).toFixed(1);

      subjects.push({
        name: getSubjectName(subjectCode),
        percent
      });

      totalPresent += present;
      totalConducted += conducted;
    }
  });

  return { totalPresent, totalConducted, subjects };
}

/* ======================================================
   BUTTON
   ====================================================== */
function createAttendanceButton() {
  if (document.getElementById("attendance-btn")) return;

  const btn = document.createElement("button");
  btn.id = "attendance-btn";
  btn.textContent = "📊 Attendance Summary";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.left = "50%";
  btn.style.transform = "translateX(-50%)";
  btn.style.zIndex = "9999";
  btn.style.padding = "12px 26px";
  btn.style.borderRadius = "30px";
  btn.style.border = "none";
  btn.style.background = "#2563eb";
  btn.style.color = "white";
  btn.style.fontSize = "15px";
  btn.style.cursor = "pointer";
  btn.style.fontFamily = "system-ui, sans-serif";

  btn.onclick = showAttendanceInfo;
  document.body.appendChild(btn);
}

/* ======================================================
   UI CARD
   ====================================================== */
function showAttendanceInfo() {
  const existing = document.getElementById("attendance-info-box");
  if (existing) {
    existing.remove();
    return;
  }

const themeKey = getTheme();
const theme = THEMES[themeKey] || THEMES.dark;


  const { totalPresent, totalConducted, subjects } = extractAttendanceData();
  const { studentName, studentRollNumber } = extractStudentInfo();

  if (totalConducted === 0) {
    alert("Attendance data not found.");
    return;
  }

  const totalAbsent = totalConducted - totalPresent;
  const percentage = ((totalPresent / totalConducted) * 100).toFixed(1);

  const subjectList = subjects.map(s => `
    <div style="
      display:flex;
      justify-content:space-between;
      padding:6px 0;
      border-bottom:1px solid ${theme.border || "#e5e7eb"};
      font-size:14px;
    ">
      <span>${s.name}</span>
      <span style="font-weight:600;">${s.percent}%</span>
    </div>
  `).join("");

  const box = document.createElement("div");
  box.id = "attendance-info-box";
  box.style.position = "fixed";
  box.style.top = "50%";
  box.style.left = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.width = "540px";
  box.style.maxHeight = "80vh";
  box.style.overflowY = "auto";
  box.style.padding = "36px";
  box.style.borderRadius = "22px";
  box.style.background = theme.card;
  box.style.color = theme.text;
  box.style.zIndex = "10000";
  box.style.boxShadow = "0 30px 60px rgba(0,0,0,0.35)";
  box.style.fontFamily = "system-ui, sans-serif";

  box.innerHTML = `
    <button id="close-btn"
      style="position:absolute;top:18px;right:18px;
      width:32px;height:32px;border:none;border-radius:50%;
      background:#e5e7eb;color:#000;font-size:18px;cursor:pointer;">
      ×
    </button>

    <button id="theme-btn"
      style="position:absolute;top:18px;left:18px;
      border:none;background:none;font-size:13px;
      color:${theme.muted};cursor:pointer;">
      ${getTheme() === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>

    <div style="text-align:center;margin-bottom:26px;">
      <div style="font-size:20px;font-weight:600;">Attendance Summary</div>
      <div style="font-size:14px;color:${theme.muted};margin-top:6px;">
        ${studentName} • ${studentRollNumber}
      </div>
    </div>

    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;font-weight:700;">${percentage}%</div>
      <div style="font-size:14px;color:${theme.muted};">Overall Attendance</div>
    </div>

    <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:26px;">
      <div style="flex:1;text-align:center;">
        <div style="font-size:20px;font-weight:600;">${totalConducted}</div>
        <div style="font-size:13px;color:${theme.muted};">Conducted</div>
      </div>
      <div style="flex:1;text-align:center;">
        <div style="font-size:20px;font-weight:600;">${totalPresent}</div>
        <div style="font-size:13px;color:${theme.muted};">Attended</div>
      </div>
      <div style="flex:1;text-align:center;">
        <div style="font-size:20px;font-weight:600;">${totalAbsent}</div>
        <div style="font-size:13px;color:${theme.muted};">Absent</div>
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px;">
        Subject-wise Attendance
      </div>
      ${subjectList}
    </div>

    <div style="text-align:center;font-size:12px;color:${theme.muted};">
      Last updated: ${new Date().toLocaleString()}
    </div>
  `;

  document.body.appendChild(box);

  document.getElementById("close-btn").onclick = () => box.remove();
  document.getElementById("theme-btn").onclick = toggleTheme;
}

/* ======================================================
   INIT
   ====================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createAttendanceButton);
} else {
  createAttendanceButton();
}
