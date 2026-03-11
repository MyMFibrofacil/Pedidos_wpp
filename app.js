const WHATSAPP_NUMBER = "5491112345678";

const catalog = [
  {
    id: "fibrofacil",
    name: "Fibrofacil",
    icon: "layers",
    groups: [
      {
        id: "mdf3",
        name: "MDF 3mm",
        open: true,
        products: [
          { id: "ff-001", name: "Box con Tapa 20x20", sku: "FF-001", price: 45 },
          { id: "ff-002", name: "Organizador Chico", sku: "FF-002", price: 32.5 },
          { id: "ff-003", name: "Bandeja Simple", sku: "FF-003", price: 28 },
        ],
      },
      {
        id: "mdf5",
        name: "MDF 5mm",
        open: false,
        products: [
          { id: "ff-101", name: "Caja de TÃ© x6", sku: "FF-101", price: 60 },
          { id: "ff-102", name: "Caja de TÃ© x9", sku: "FF-102", price: 78 },
        ],
      },
    ],
  },
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
    id: "otro",
    name: "Otro",
    icon: "more_horiz",
    groups: [
      {
        id: "varios",
        name: "Varios",
        open: true,
        products: [
          { id: "ot-001", name: "Herraje Kit BÃ¡sico", sku: "OT-001", price: 42 },
          { id: "ot-002", name: "Bisagra Pack x10", sku: "OT-002", price: 70 },
        ],
      },
    ],
  },
];

const quantities = {};
let activeCategory = catalog[0].id;
let searchTerm = "";

const html = {
  root: document.documentElement,
  tabs: document.getElementById("category-tabs"),
  groups: document.getElementById("groups-container"),
  search: document.getElementById("search-input"),
  empty: document.getElementById("empty-state"),
  summaryItems: document.getElementById("summary-items"),
  summaryTotal: document.getElementById("summary-total"),
  sendButton: document.getElementById("send-whatsapp"),
  resetButton: document.getElementById("btn-reset"),
  themeButton: document.getElementById("btn-theme"),
  clientName: document.getElementById("client-name"),
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
  const label = data.totalItems === 1 ? "Producto" : "Productos";
  html.summaryItems.textContent = `${data.totalItems} ${label}`;
  html.summaryTotal.textContent = formatMoney(data.totalPrice);
  html.sendButton.disabled = data.totalItems === 0;
}

function buildWhatsAppText() {
  const data = summary();
  const lines = [];
  const client = html.clientName.value.trim();
  const today = new Date().toLocaleString("es-AR");

  lines.push("Hola, quiero hacer este pedido:");
  lines.push("");
  if (client) lines.push(`Cliente: ${client}`);
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
  html.clientName.value = "";
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

  html.sendButton.addEventListener("click", sendToWhatsApp);
  html.resetButton.addEventListener("click", clearOrder);
  html.themeButton.addEventListener("click", toggleTheme);
}

function render() {
  renderTabs();
  renderGroups();
  renderSummary();
}

bindEvents();
render();
