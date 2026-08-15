// ---- Mock data (swap these for real API calls when integrating) ----
const orders = {
  "NS-10234": { status: "Shipped", carrier: "DHL", eta: "Aug 14", step: 2, item: "Trail Runner Jacket (M)" },
  "NS-10298": { status: "Processing", carrier: "—", eta: "Ships by Aug 13", step: 1, item: "Canvas Tote" },
  "NS-10310": { status: "Delivered", carrier: "DHL", eta: "Delivered Aug 9", step: 3, item: "Everyday Sneaker (42)" },
};

const returns = {
  "NS-10234": { eligible: true, window: "Until Aug 28", refundStatus: null },
  "NS-10298": { eligible: false, window: null, reason: "Order not yet delivered" },
  "NS-10310": { eligible: true, window: "Until Aug 23", refundStatus: "Refund issued Aug 11 · $42.00" },
};

const stock = {
  "trail runner jacket": { S: 0, M: 3, L: 0, XL: 5 },
  "canvas tote": { "One size": 12 },
  "everyday sneaker": { 40: 0, 41: 2, 42: 0, 43: 4 },
};

// ---- Populate datalists for autocomplete ----
document.getElementById("orderIds").innerHTML = Object.keys(orders)
  .map((id) => `<option value="${id}">`).join("");
document.getElementById("productNames").innerHTML = Object.keys(stock)
  .map((name) => `<option value="${name.replace(/\b\w/g, (c) => c.toUpperCase())}">`).join("");

// ---- Tab switching ----
function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active);
  });
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === name));
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

// Enter-to-submit on each input
document.getElementById("orderInput").addEventListener("keydown", (e) => { if (e.key === "Enter") lookupOrder(); });
document.getElementById("returnInput").addEventListener("keydown", (e) => { if (e.key === "Enter") lookupReturn(); });
document.getElementById("stockInput").addEventListener("keydown", (e) => { if (e.key === "Enter") lookupStock(); });

// ---- Order status ----
function lookupOrder() {
  const id = document.getElementById("orderInput").value.trim().toUpperCase();
  const box = document.getElementById("orderResult");
  const o = orders[id];
  if (!o) {
    box.innerHTML = `<p class="empty">No order found for "${id || "(empty)"}". Double-check the order number, or contact support if it's been over 48 hours.</p>`;
    return;
  }
  const badgeClass = o.status === "Delivered" ? "green" : "amber";
  box.innerHTML = `
    <div class="row"><span class="k">Order</span><span class="v">${id}</span></div>
    <div class="row"><span class="k">Item</span><span class="v">${o.item}</span></div>
    <div class="row"><span class="k">Status</span><span class="v"><span class="badge ${badgeClass}">${o.status}</span></span></div>
    <div class="row"><span class="k">Carrier</span><span class="v">${o.carrier}</span></div>
    <div class="row"><span class="k">Estimated</span><span class="v">${o.eta}</span></div>
    <div class="steps">
      <div class="step ${o.step >= 1 ? "done" : ""}"><div class="dot"></div>Placed</div>
      <div class="step ${o.step >= 2 ? (o.step === 2 ? "current" : "done") : ""}"><div class="dot"></div>Shipped</div>
      <div class="step ${o.step >= 3 ? "done" : ""}"><div class="dot"></div>Delivered</div>
    </div>`;
}

// ---- Returns & refunds ----
function lookupReturn() {
  const id = document.getElementById("returnInput").value.trim().toUpperCase();
  const box = document.getElementById("returnResult");
  const r = returns[id];
  if (!r) {
    box.innerHTML = `<p class="empty">No order found for "${id || "(empty)"}". Returns can only be checked for shipped or delivered orders.</p>`;
    return;
  }
  if (r.refundStatus) {
    box.innerHTML = `
      <div class="row"><span class="k">Order</span><span class="v">${id}</span></div>
      <div class="row"><span class="k">Return</span><span class="v"><span class="badge green">Completed</span></span></div>
      <div class="row"><span class="k">Refund</span><span class="v">${r.refundStatus}</span></div>
      <div class="note">This return is closed. If the refund hasn't reached your account in 5–7 business days, it's time to talk to a human.</div>`;
    return;
  }
  if (r.eligible) {
    box.innerHTML = `
      <div class="row"><span class="k">Order</span><span class="v">${id}</span></div>
      <div class="row"><span class="k">Eligible</span><span class="v"><span class="badge green">Yes</span></span></div>
      <div class="row"><span class="k">Return window</span><span class="v">${r.window}</span></div>
      <textarea id="returnReason" placeholder="Reason for return (optional)"></textarea>
      <div class="action-row">
        <button onclick="startReturn('${id}')">Start return</button>
        <button class="btn-secondary" onclick="alert('Prepaid label sent to your account email.')">Get shipping label</button>
      </div>`;
  } else {
    box.innerHTML = `
      <div class="row"><span class="k">Order</span><span class="v">${id}</span></div>
      <div class="row"><span class="k">Eligible</span><span class="v"><span class="badge red">Not yet</span></span></div>
      <div class="note">${r.reason}. Check back once the order shows as delivered.</div>`;
  }
}

function startReturn(id) {
  const box = document.getElementById("returnResult");
  box.innerHTML = `
    <div class="row"><span class="k">Order</span><span class="v">${id}</span></div>
    <div class="row"><span class="k">Return</span><span class="v"><span class="badge amber">Label sent</span></span></div>
    <div class="note">Return started. A prepaid shipping label was sent to your email. Refunds post within 5–7 business days of us receiving the item.</div>`;
}

// ---- Stock availability ----
function lookupStock() {
  const raw = document.getElementById("stockInput").value.trim();
  const q = raw.toLowerCase();
  const box = document.getElementById("stockResult");
  const entry = stock[q];
  if (!entry) {
    box.innerHTML = `<p class="empty">No product found for "${raw || "(empty)"}". Try the exact product name shown in the hint above.</p>`;
    return;
  }
  const rows = Object.entries(entry).map(([size, qty]) => {
    const inStock = qty > 0;
    return `<div class="row"><span class="k">Size ${size}</span><span class="v">
      ${inStock ? `<span class="badge green">${qty} in stock</span>` : `<span class="badge red">Out of stock</span>`}
    </span></div>`;
  }).join("");
  const anyOut = Object.values(entry).some((q) => q === 0);
  box.innerHTML = `
    <div class="row"><span class="k">Product</span><span class="v">${raw}</span></div>
    ${rows}
    ${anyOut ? `<div class="action-row"><button class="btn-secondary" onclick="alert('You will be emailed the moment your size restocks.')">Notify me when back in stock</button></div>` : ""}`;
}
