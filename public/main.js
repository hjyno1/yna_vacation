let current = new Date();
let holidays = {};
let vacationData = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadHolidays(current.getFullYear());
  await loadVacations();
  renderCalendar();
});

async function loadHolidays(year) {
  const res = await fetch(`/api/holidays?year=${year}`);
  holidays = await res.json();
}

async function loadVacations() {
  const res = await fetch(`/api/baserow-get`);
  vacationData = await res.json();
}

async function submitVacation() {
  const name = document.getElementById("name").value.trim();
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const checked = document.querySelector('input[name="type"]:checked');
  const typeLabel = checked ? checked.value : "";

  if (!name || !start || !end) return alert("모든 항목을 입력해주세요.");

  const payload = { name, start, end, type: typeLabel };

  const res = await fetch("/api/baserow-add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (result.success) {
    alert("등록 완료!");
    await loadVacations();
    renderCalendar();
    resetForm();
  } else {
    alert("등록 실패: " + result.message);
  }
}

function resetForm() {
  document.getElementById("name").value = "";
  document.querySelectorAll('input[name="type"]').forEach(cb => cb.checked = false);
}

function changeMonth(delta) {
  current.setMonth(current.getMonth() + delta);
  const year = current.getFullYear();
  loadHolidays(year).then(() => {
    renderCalendar();
  });
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const year = current.getFullYear();
  const month = current.getMonth();
  document.getElementById("monthLabel").textContent = `${month + 1}월 ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day";
    calendar.appendChild(empty);
  }

  for (let date = 1; date <= lastDate; date++) {
    const cellDate = new Date(year, month, date);
    const dateStr = cellDate.toISOString().split('T')[0];
    const day = cellDate.getDay();

    const cell = document.createElement("div");
    cell.className = "day";
    if (day === 0) cell.classList.add("sunday");
    if (holidays[dateStr]) cell.classList.add("holiday");

    const title = document.createElement("strong");
    title.textContent = date;
    cell.appendChild(title);

    if (holidays[dateStr]) {
      const tag = document.createElement("div");
      tag.textContent = holidays[dateStr];
      tag.style.fontWeight = "bold";
      cell.appendChild(tag);
    }

    if (day !== 0 && day !== 6 && !holidays[dateStr]) {
      const entries = vacationData.filter(v => v.date === dateStr);
      entries.forEach(vac => {
        const div = document.createElement("div");
        div.textContent = vac.label;
        div.onclick = async () => {
          if (confirm(`"${vac.label}" 삭제할까요?`)) {
            await fetch("/api/baserow-delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: vac.id }),
            });
            await loadVacations();
            renderCalendar();
          }
        };
        cell.appendChild(div);
      });
    }

    calendar.appendChild(cell);
  }
}
