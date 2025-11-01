const STATE = { items: [], query: "" };
const els = {};

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

async function loadData() {
  const res = await fetch("data/items.json");
  STATE.items = await res.json();
}

function matches(item) {
  if (STATE.query) {
    const q = STATE.query.toLowerCase();
    const hay = (item.title + " " + (item.description || "") + " " + item.category + " " + (item.tags || []).join(" ")).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderTrending() {
  const out = els.trending;
  const trending = STATE.items.filter(i => i.trending);
  out.innerHTML = "";
  trending.forEach(item => {
    const card = createCard(item);
    out.appendChild(card);
  });
}

function renderItems() {
  const out = els.items;
  const shown = STATE.items.filter(matches);
  if (shown.length === 0) {
    out.innerHTML = '<div class="empty-state">No items found</div>';
    return;
  }
  out.innerHTML = "";
  shown.forEach(item => {
    const card = createCard(item);
    out.appendChild(card);
  });
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    ${item.icon ? `<img src="${item.icon}" alt="${escapeHtml(item.title)}" class="card-icon">` : ''}
    <div class="card-body">
      <div class="title">${escapeHtml(item.title)}</div>
      <div class="meta">${item.type === 'movie' ? '🎬' : '🎮'} ${escapeHtml(item.category)}</div>
      <div class="desc">${escapeHtml(item.description || "")}</div>
      <div class="tags">${(item.tags || []).slice(0,3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      <button class="card-btn" data-id="${item.id}">View Details</button>
    </div>
  `;
  card.querySelector(".card-btn").addEventListener("click", () => openModal(item));
  return card;
}

function openModal(item) {
  if (!item) return;
  els.modalContent.innerHTML = `
    ${item.icon ? `<img src="${item.icon}" alt="${escapeHtml(item.title)}" style="width:200px;height:300px;object-fit:cover;border-radius:8px;margin-bottom:20px">` : ''}
    <h2>${escapeHtml(item.title)}</h2>
    <p style="color:#9ca3af;margin-bottom:15px">${item.type === 'movie' ? '🎬 Movie' : '🎮 Game'} • ${escapeHtml(item.category)}</p>
    <p style="margin-bottom:15px">${escapeHtml(item.description || "")}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px">
      ${(item.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
    </div>
    ${item.link ? `<a href="${item.link}" class="card-btn" target="_blank" rel="noopener">Download/Watch Now</a>` : ""}
  `;
  els.modal.setAttribute("aria-hidden", "false");
}

function closeModal() { els.modal.setAttribute("aria-hidden", "true"); }

function render() {
  renderTrending();
  renderItems();
}

function escapeHtml(str) {
  return String(str).replace(/[&"'<>]/g, a => ({"&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;"}[a]));
}

async function init() {
  els.trending = $("#trending");
  els.items = $("#items");
  els.search = $("#search");
  els.modal = $("#modal");
  els.modalContent = $("#modalContent");
  els.modalClose = $("#modalClose");
  els.modalCloseBtn = $("#modalCloseBtn");
  
  els.search.addEventListener("input", e => { STATE.query = e.target.value.trim(); renderItems(); });
  els.modalClose.addEventListener("click", closeModal);
  els.modalCloseBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  
  els.items.innerHTML = '<div class="loading">Loading</div>';
  
  try {
    await loadData();
    render();
    $("#year").textContent = new Date().getFullYear();
  } catch (err) {
    console.error("Failed to load data", err);
    els.items.innerHTML = '<div class="empty-state">Failed to load data</div>';
  }
}

document.addEventListener("DOMContentLoaded", init);