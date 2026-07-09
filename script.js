// script.js
// ===== DATA STORES =====
let members = JSON.parse(localStorage.getItem("alfalah_members")) || [
  {
    name: "Muhammad Zeeshan Khan",
    role: "Founder & Director",
    phone: "+92 301 8400715",
  },
  {
    name: "Rangzaib",
    role: "Founder & Admin (KSA)",
    phone: "+966 59 741 2876",
  },
  { name: "Ihtisham UL Haq", role: "Admin (UAE) ", phone: "+971 52 357 0703 " },
  { name: "Ayaz Khan", role: "Admin (OMAN) ", phone: "+968 7151 7028 " },
  { name: "Rasab Khan", role: "Member (PAKISTAN)", phone: "+92 343 6789390" },
];
let transactions =
  JSON.parse(localStorage.getItem("alfalah_transactions")) || [];
let plans = JSON.parse(localStorage.getItem("alfalah_plans")) || [
  { title: "Masjid Expansion Phase 2", status: "in-progress" },
  { title: "Upgrade the Filtration Plant  ", status: "planned" },
  { title: "Street Paving - Link Road", status: "planned" },
  { title: "Islamic Library Setup", status: "planned" },
];
let galleryImages = JSON.parse(localStorage.getItem("alfalah_gallery")) || [];
let prayerTimesData = null;
let currentLang = "en";
const ADMIN_ACCESS_CODE = "admin5";

// ===== LANGUAGE TOGGLE =====
document.getElementById("lang-toggle").addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ur" : "en";
  document.body.dir = currentLang === "ur" ? "rtl" : "ltr";
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.getAttribute("data-" + currentLang);
  });
  if (currentLang === "ur") document.body.classList.add("font-urdu");
  else document.body.classList.remove("font-urdu");
});

// ===== MOBILE MENU =====
document.getElementById("mobile-menu-btn").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});

// ===== CURRENT PRAYER TIME ONLY (Compact) =====
function renderPrayerTimes(timings) {
  const dateDisplay = document.getElementById("current-date-display");
  if (dateDisplay) {
    dateDisplay.textContent = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const prayers = [
    { name: "Fajr", key: "Fajr" },
    { name: "Sunrise", key: "Sunrise" },
    { name: "Dhuhr", key: "Dhuhr" },
    { name: "Asr", key: "Asr" },
    { name: "Maghrib", key: "Maghrib" },
    { name: "Isha", key: "Isha" },
  ];

  const now = new Date();
  let currentPrayer = null,
    nextPrayer = null,
    currentTime = null,
    nextTime = null;

  for (let i = 0; i < prayers.length; i++) {
    const t = timings[prayers[i].key].split(":");
    const prayerDate = new Date();
    prayerDate.setHours(parseInt(t[0], 10), parseInt(t[1], 10), 0);

    const nextT = prayers[i + 1]
      ? timings[prayers[i + 1].key].split(":")
      : null;
    const nextPrayerDate = nextT ? new Date() : null;
    if (nextPrayerDate) {
      nextPrayerDate.setHours(
        parseInt(nextT[0], 10),
        parseInt(nextT[1], 10),
        0,
      );
    }

    if (prayerDate <= now) {
      if (!nextPrayerDate || nextPrayerDate > now) {
        currentPrayer = prayers[i].name;
        currentTime = timings[prayers[i].key];
        if (prayers[i + 1]) {
          nextPrayer = prayers[i + 1].name;
          nextTime = timings[prayers[i + 1].key];
        } else {
          nextPrayer = "Fajr";
          nextTime = timings.Fajr;
        }
      }
    }
  }

  if (!currentPrayer) {
    currentPrayer = "Isha";
    currentTime = timings.Isha;
    nextPrayer = "Fajr";
    nextTime = timings.Fajr;
  }

  document.getElementById("current-prayer-name").textContent = currentPrayer;
  document.getElementById("current-prayer-time").textContent = currentTime;
  document.getElementById("next-prayer-name-small").textContent = nextPrayer;
  document.getElementById("next-prayer-time-small").textContent = nextTime;
}

async function fetchCurrentPrayer() {
  try {
    const res = await fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Lahore&country=Pakistan&method=2",
    );
    const data = await res.json();
    if (data?.code === 200 && data.data?.timings) {
      prayerTimesData = data.data;
      renderPrayerTimes(prayerTimesData.timings);
      localStorage.setItem(
        "alfalah_prayer_times",
        JSON.stringify({
          updatedAt: Date.now(),
          times: prayerTimesData.timings,
        }),
      );
      return;
    }
  } catch (e) {
    console.error(e);
  }

  const storedPrayerData = JSON.parse(
    localStorage.getItem("alfalah_prayer_times") || "null",
  );
  if (storedPrayerData?.times) {
    renderPrayerTimes(storedPrayerData.times);
  }
}

// ===== MEMBERS =====
function renderMembers(filter = "") {
  const grid = document.getElementById("members-grid");
  grid.innerHTML = "";
  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(filter.toLowerCase()) ||
      m.role.toLowerCase().includes(filter.toLowerCase()),
  );
  filtered.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "member-card animate-in";
    card.style.animationDelay = i * 0.1 + "s";
    card.innerHTML =
      '<div class="member-avatar">' +
      m.name.charAt(0) +
      '</div><h4 class="font-bold text-gray-800">' +
      m.name +
      '</h4><p class="text-teal-600 text-sm font-medium">' +
      m.role +
      '</p><p class="text-gray-400 text-xs mt-2"><i class="fas fa-phone mr-1"></i>' +
      m.phone +
      "</p>";
    grid.appendChild(card);
  });
}

function filterMembers() {
  renderMembers(document.getElementById("member-search").value);
}

function openMemberModal() {
  document.getElementById("member-modal").classList.add("active");
}

function closeMemberModal() {
  document.getElementById("member-modal").classList.remove("active");
}

function addMember() {
  const name = document.getElementById("member-name").value;
  const role = document.getElementById("member-role").value;
  const phone = document.getElementById("member-phone").value;
  if (!name || !role) return alert("Please fill in name and role");
  members.push({ name, role, phone });
  localStorage.setItem("alfalah_members", JSON.stringify(members));
  renderMembers();
  closeMemberModal();
  document.getElementById("member-name").value = "";
  document.getElementById("member-role").value = "";
  document.getElementById("member-phone").value = "";
}

// ===== ADMIN PANEL =====
function openAdminAccess() {
  const isGranted = sessionStorage.getItem("alfalah_admin_access") === "true";
  if (isGranted) {
    showAdminSection();
    return;
  }

  const modal = document.getElementById("admin-access-modal");
  const field = document.getElementById("admin-password");
  if (modal) {
    modal.classList.add("active");
  }
  if (field) {
    field.value = "";
    field.focus();
  }
}

function closeAdminAccessModal() {
  const modal = document.getElementById("admin-access-modal");
  const field = document.getElementById("admin-password");
  if (modal) modal.classList.remove("active");
  if (field) field.value = "";
}

function submitAdminAccess(event) {
  if (event) event.preventDefault();
  const field = document.getElementById("admin-password");
  const enteredCode = field ? field.value : "";

  if (enteredCode === ADMIN_ACCESS_CODE) {
    sessionStorage.setItem("alfalah_admin_access", "true");
    closeAdminAccessModal();
    showAdminSection();
  } else {
    alert("Access denied");
  }
}

function showAdminSection() {
  const section = document.getElementById("admin");
  if (!section) return;
  section.classList.add("active");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function switchTab(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".admin-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
  if (tab === "records") renderRecords();
}

function addTransaction(type) {
  const amount = parseFloat(document.getElementById(type + "-amount").value);
  const category = document.getElementById(
    type + "-" + (type === "income" ? "source" : "category"),
  ).value;
  const desc = document.getElementById(type + "-desc").value;
  if (!amount || amount <= 0) return alert("Please enter a valid amount");
  transactions.push({
    type,
    amount,
    category,
    desc,
    date: new Date().toLocaleDateString("en-GB"),
  });
  localStorage.setItem("alfalah_transactions", JSON.stringify(transactions));
  document.getElementById(type + "-amount").value = "";
  document.getElementById(type + "-desc").value = "";
  updateSummary();
  alert((type === "income" ? "Income" : "Expense") + " record saved!");
}

function updateSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);
  document.getElementById("total-income").textContent =
    "Rs. " + income.toLocaleString();
  document.getElementById("total-expense").textContent =
    "Rs. " + expense.toLocaleString();
  document.getElementById("net-balance").textContent =
    "Rs. " + (income - expense).toLocaleString();

  if (document.getElementById("panel-records").classList.contains("active")) {
    renderRecords();
  }
}

function renderRecords() {
  const tbody = document.getElementById("records-table-body");
  const noRecords = document.getElementById("no-records");
  const searchInput = document.getElementById("record-search");
  const typeFilter = document.getElementById("record-filter-type");
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
  const typeValue = typeFilter ? typeFilter.value : "";

  const filteredTransactions = transactions.filter((t) => {
    const text = [t.date, t.type, t.category, t.desc].join(" ").toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesType = !typeValue || t.type === typeValue;
    return matchesQuery && matchesType;
  });

  tbody.innerHTML = "";
  if (filteredTransactions.length === 0) {
    noRecords.style.display = "block";
    return;
  }

  noRecords.style.display = "none";
  [...filteredTransactions].reverse().forEach((t) => {
    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";
    row.innerHTML =
      '<td class="px-4 py-3">' +
      t.date +
      '</td><td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-bold ' +
      (t.type === "income"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700") +
      '">' +
      t.type.toUpperCase() +
      '</span></td><td class="px-4 py-3">' +
      t.category +
      '</td><td class="px-4 py-3">' +
      (t.desc || "-") +
      '</td><td class="px-4 py-3 text-right font-bold ' +
      (t.type === "income" ? "text-emerald-600" : "text-red-600") +
      '">Rs. ' +
      t.amount.toLocaleString() +
      "</td>";
    tbody.appendChild(row);
  });
}

// ===== PLANS / VISION BOARD =====
function renderPlans() {
  const container = document.getElementById("plans-container");
  container.innerHTML = "";
  const statusColors = {
    planned: "bg-gray-100 text-gray-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    completed: "bg-emerald-100 text-emerald-700",
  };
  const statusLabels = {
    planned: "Planned",
    "in-progress": "In Progress",
    completed: "Completed",
  };
  plans.forEach((p, i) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100";
    div.innerHTML =
      '<div class="flex items-center gap-3"><div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><i class="fas fa-tasks text-teal-600"></i></div><span class="font-semibold text-gray-800">' +
      p.title +
      '</span></div><span class="px-3 py-1 rounded-full text-xs font-bold ' +
      statusColors[p.status] +
      '">' +
      statusLabels[p.status] +
      "</span>";
    container.appendChild(div);
  });
}

function addPlan() {
  const title = document.getElementById("new-plan-title").value;
  const status = document.getElementById("new-plan-status").value;
  if (!title) return;
  plans.push({ title, status });
  localStorage.setItem("alfalah_plans", JSON.stringify(plans));
  renderPlans();
  document.getElementById("new-plan-title").value = "";
}

// ===== GALLERY =====
function handleGalleryUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    galleryImages.push({ src: evt.target.result, title: file.name });
    localStorage.setItem("alfalah_gallery", JSON.stringify(galleryImages));
    renderGallery();
  };
  reader.readAsDataURL(file);
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  const items = grid.querySelectorAll(".gallery-item");
  while (items.length > 4) {
    grid.removeChild(items[items.length - 1]);
  }
  galleryImages.forEach((img, i) => {
    const div = document.createElement("div");
    div.className =
      "gallery-item aspect-square rounded-xl overflow-hidden cursor-pointer";
    div.onclick = function () {
      openGalleryModal(i + 4);
    };
    div.innerHTML =
      '<img src="' +
      img.src +
      '" class="w-full h-full object-cover" alt="' +
      img.title +
      '"><div class="gallery-overlay"><p class="text-white font-semibold text-sm">' +
      img.title +
      "</p></div>";
    grid.appendChild(div);
  });
}

function openGalleryModal(index) {
  alert("Gallery image " + (index + 1));
}

// ===== UTILITY =====
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => alert("Copied: " + text));
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  fetchCurrentPrayer();
  renderMembers();
  renderPlans();
  renderGallery();
  updateSummary();
});
