/* Lightweight app.js: loads data/items.json and renders the directory with filters */
const STATE = {
  items: [],
  type: "all",
  category: null,
  query: "",
};

const els = {};

function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

async function loadData() {
  const res = await fetch("data/items.json");
  const data = await res.json();
  STATE.items = data;
}

function uniqueCategories(items) {
  const s = new Set();
  items.forEach((i) => (i.categories || []).forEach((c) => s.add(c)));
  return Array.from(s).sort();
}

function renderCategories() {
  const container = els.categories;
  container.innerHTML = "";
  const cats = uniqueCategories(STATE.items);
  cats.forEach((cat) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = cat;
    b.dataset.cat = cat;
    if (STATE.category === cat) b.classList.add("active");
    b.addEventListener("click", () => {
      STATE.category = STATE.category === cat ? null : cat;
      render();
    });
    container.appendChild(b);
  });
}

function matches(item) {
  if (STATE.type !== "all" && item.type !== STATE.type) return false;
  if (STATE.category && !(item.categories || []).includes(STATE.category))
    return false;
  if (STATE.query) {
    const q = STATE.query.toLowerCase();
    const hay = (
      item.title +
      " " +
      (item.description || "") +
      " " +
      (item.categories || []).join(" ") +
      " " +
      (item.tags || []).join(" ")
    ).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderItems() {
  const out = els.items;
  const shown = STATE.items.filter(matches);
  if (shown.length === 0) {
    out.innerHTML = `<p class="meta">No items found. Try a different filter or search.</p>`;
    return;
  }
  out.innerHTML = "";
  shown.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="title">${escapeHtml(item.title)}</div>
      <div class="meta">${escapeHtml(capitalize(item.type))} • ${escapeHtml(
      (item.categories || []).join(", ")
    )}</div>
      <div class="desc">${escapeHtml(
        truncate(item.description || "", 120)
      )}</div>
      <div class="tags">${(item.tags || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("")}</div>
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
        <button class="card-btn" data-id="${item.id}">Details</button>
        ${
          item.link
            ? `<a class="card-btn" href="${item.link}" target="_blank" rel="noopener">Open</a>`
            : ""
        }
      </div>
    `;
    out.appendChild(card);
  });
  // attach detail handlers
  $all(".card-btn[data-id]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      openModal(STATE.items.find((i) => String(i.id) === String(id)));
    })
  );
}

function openModal(item) {
  if (!item) return;
  const modal = els.modal;
  els.modalContent.innerHTML = `
    <h2>${escapeHtml(item.title)}</h2>
    <p class="meta">${escapeHtml(capitalize(item.type))} • ${escapeHtml(
    (item.categories || []).join(", ")
  )}</p>
    <p>${escapeHtml(item.description || "")}</p>
    ${
      item.extra
        ? `<pre style="white-space:pre-wrap">${escapeHtml(item.extra)}</pre>`
        : ""
    }
    ${
      item.link
        ? `<p><a href="${item.link}" target="_blank" rel="noopener">Open link</a></p>`
        : ""
    }
  `;
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.modal.setAttribute("aria-hidden", "true");
}

function wireControls() {
  els.search.addEventListener("input", (e) => {
    STATE.query = e.target.value.trim();
    render();
  });
  $all("#type-tabs .tab").forEach((t) =>
    t.addEventListener("click", (e) => {
      $all("#type-tabs .tab").forEach((x) => x.classList.remove("active"));
      e.currentTarget.classList.add("active");
      STATE.type = e.currentTarget.dataset.type;
      render();
    })
  );
  els.modalClose.addEventListener("click", closeModal);
  els.modalCloseBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function render() {
  renderCategories();
  renderItems();
  // update chips active state
  $all(".chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.cat === STATE.category)
  );
}

function capitalize(s) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function escapeHtml(str) {
  return String(str).replace(/[&"'<>]/g, function (a) {
    return {
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
      "<": "&lt;",
      ">": "&gt;",
    }[a];
  });
}

async function init() {
  els.items = $("#items");
  els.categories = $("#categories");
  els.search = $("#search");
  els.modal = $("#modal");
  els.modalContent = $("#modalContent");
  els.modalClose = $("#modalClose");
  els.modalCloseBtn = $("#modalCloseBtn");
  try {
    await loadData();
    render();
    wireControls();
    $("#year").textContent = new Date().getFullYear();
  } catch (err) {
    console.error("Failed to load data", err);
    els.items.innerHTML = '<p class="meta">Failed to load data file.</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
