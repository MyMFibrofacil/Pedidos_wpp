const WHATSAPP_NUMBER = "5491159339958";

const catalog = [
  {
    id: "melamina",
    name: "Melamina",
    icon: "grid_view",
    groups: MELAMINA_GROUPS,
  },
  {
    id: "pino",
    name: "Pino",
    icon: "forest",
    groups: PINO_GROUPS,
  },
  {
    id: "fibrofacil",
    name: "Fibrofacil",
    icon: "layers",
    groups: FIBROFACIL_GROUPS,
  },
];

for (const category of catalog) {
  for (const group of category.groups) {
    group.open = false;
  }
}

const quantities = {};
let activeCategory = catalog[0].id;
let searchTerm = "";
let summaryOpen = false;

const html = {
  root: document.documentElement,
  tabs: document.getElementById("category-tabs"),
  groups: document.getElementById("groups-container"),
  search: document.getElementById("search-input"),
  empty: document.getElementById("empty-state"),
  summaryTotal: document.getElementById("summary-total"),
  summaryToggle: document.getElementById("summary-toggle"),
  summaryChevron: document.getElementById("summary-chevron"),
  summaryDetailsPanel: document.getElementById("summary-details-panel"),
  summaryDetailsList: document.getElementById("summary-details-list"),
  sendButton: document.getElementById("send-whatsapp"),
};

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

function getActiveCategory() {
  return catalog.find((cat) => cat.id === activeCategory);
}

function getProductQty(id) {
  return quantities[id] || 0;
}

function updateQty(productId, delta) {
  const next = Math.max(0, getProductQty(productId) + delta);
  if (next === 0) {
    delete quantities[productId];
  } else {
    quantities[productId] = next;
  }
  render();
}

function toggleGroup(groupId) {
  const category = getActiveCategory();
  const target = category.groups.find((g) => g.id === groupId);
  if (!target) return;
  target.open = !target.open;
  renderGroups();
}

function renderTabs() {
  html.tabs.innerHTML = catalog
    .map((cat) => {
      const active = cat.id === activeCategory;
      return `
      <button
        data-cat="${cat.id}"
        class="flex flex-col items-center min-w-[88px] justify-center border-b-[3px] ${
          active ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400"
        } gap-1 pb-2 pt-3"
      >
        <span class="material-symbols-outlined">${cat.icon}</span>
        <p class="text-xs ${active ? "font-bold" : "font-medium"} whitespace-nowrap">${cat.name}</p>
      </button>`;
    })
    .join("");
}

function filteredProducts(group) {
  if (!searchTerm) return group.products;
  const term = searchTerm.toLowerCase();
  return group.products.filter((p) => {
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      group.name.toLowerCase().includes(term)
    );
  });
}

function renderGroups() {
  const category = getActiveCategory();
  const blocks = [];

  category.groups.forEach((group) => {
    const products = filteredProducts(group);
    if (searchTerm && products.length === 0) return;

    const productsHtml = group.open
      ? products
          .map((p) => {
            const qty = getProductQty(p.id);
            return `
            <div class="p-4 flex items-center justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${p.name}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">SKU: ${p.sku}</p>
                <p class="text-primary font-bold mt-1">${formatMoney(p.price)}</p>
              </div>
              <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button data-action="minus" data-product="${p.id}" class="size-8 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-primary">
                  <span class="material-symbols-outlined text-lg">remove</span>
                </button>
                <span class="w-10 text-center font-bold text-sm dark:text-slate-100">${qty}</span>
                <button data-action="plus" data-product="${p.id}" class="size-8 flex items-center justify-center rounded-md ${
                  qty > 0 ? "bg-primary text-white" : "bg-white dark:bg-slate-700 text-primary"
                } shadow-sm">
                  <span class="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>`;
          })
          .join("")
      : "";

    blocks.push(`
      <section class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <button data-group="${group.id}" class="w-full flex items-center justify-between p-4 ${
          group.open ? "bg-primary/5" : ""
        }">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">${
              group.open ? "folder_open" : "folder"
            }</span>
            <span class="font-bold text-slate-800 dark:text-slate-100">${group.name}</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">${
            group.open ? "expand_more" : "chevron_right"
          }</span>
        </button>
        ${group.open ? `<div class="divide-y divide-slate-100">${productsHtml}</div>` : ""}
      </section>
    `);
  });

  html.groups.innerHTML = blocks.join("");
  html.empty.classList.toggle("hidden", blocks.length > 0);
}

function summary() {
  const selected = [];
  catalog.forEach((cat) => {
    cat.groups.forEach((group) => {
      group.products.forEach((product) => {
        const qty = getProductQty(product.id);
        if (qty > 0) {
          selected.push({ category: cat.name, group: group.name, product, qty });
        }
      });
    });
  });

  let totalItems = 0;
  let totalPrice = 0;
  selected.forEach((item) => {
    totalItems += item.qty;
    totalPrice += item.qty * item.product.price;
  });

  return { selected, totalItems, totalPrice };
}

function renderSummary() {
  const data = summary();
  html.summaryTotal.textContent = formatMoney(data.totalPrice);
  html.sendButton.disabled = data.totalItems === 0;

  if (data.selected.length === 0) {
    html.summaryDetailsList.innerHTML =
      '<p class="p-4 text-sm text-slate-500">Todavia no agregaste productos.</p>';
    summaryOpen = false;
  } else {
    html.summaryDetailsList.innerHTML = data.selected
      .map((item) => {
        const subtotal = item.qty * item.product.price;
        return `
        <div class="p-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">${item.product.name}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${item.category} · ${item.group}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-bold">x${item.qty}</p>
            <p class="text-xs text-primary font-semibold">${formatMoney(subtotal)}</p>
          </div>
        </div>`;
      })
      .join("");
  }

  html.summaryDetailsPanel.classList.toggle("hidden", !summaryOpen);
  html.summaryChevron.style.transform = summaryOpen ? "rotate(0deg)" : "rotate(180deg)";
}

function buildWhatsAppText() {
  const data = summary();
  const lines = [];
  const today = new Date().toLocaleString("es-AR");

  lines.push("Hola, quiero hacer este pedido:");
  lines.push("");
  lines.push(`Fecha: ${today}`);
  lines.push("");

  data.selected.forEach((item) => {
    const subtotal = item.qty * item.product.price;
    lines.push(
      `- ${item.qty} x ${item.product.name} (${item.product.sku}) | ${item.group} | ${formatMoney(
        subtotal
      )}`
    );
  });

  lines.push("");
  lines.push(`Total unidades: ${data.totalItems}`);
  lines.push(`Total estimado: ${formatMoney(data.totalPrice)}`);

  return lines.join("\n");
}

function sendToWhatsApp() {
  const text = buildWhatsAppText();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function clearOrder() {
  Object.keys(quantities).forEach((key) => delete quantities[key]);
  render();
}

function toggleTheme() {
  html.root.classList.toggle("dark");
}

function bindEvents() {
  html.tabs.addEventListener("click", (e) => {
    const button = e.target.closest("[data-cat]");
    if (!button) return;
    activeCategory = button.dataset.cat;
    render();
  });

  html.groups.addEventListener("click", (e) => {
    const groupButton = e.target.closest("[data-group]");
    if (groupButton) {
      toggleGroup(groupButton.dataset.group);
      return;
    }

    const qtyButton = e.target.closest("[data-action][data-product]");
    if (!qtyButton) return;
    const productId = qtyButton.dataset.product;
    const delta = qtyButton.dataset.action === "plus" ? 1 : -1;
    updateQty(productId, delta);
  });

  html.search.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim();
    renderGroups();
  });

  html.summaryToggle.addEventListener("click", () => {
    summaryOpen = !summaryOpen;
    renderSummary();
  });

  html.sendButton.addEventListener("click", sendToWhatsApp);
}

function render() {
  renderTabs();
  renderGroups();
  renderSummary();
}

bindEvents();
render();

