const ESRI_CLASSES = [
  { id: "water", code: 1, label: "Water", icon: "💧", cn: { A: 100, B: 100, C: 100, D: 100 } },
  { id: "trees_dense", code: "2a", label: "Trees – Hutan Lebat (>75%)", icon: "🌳", cn: { A: 30, B: 55, C: 70, D: 77 } },
  { id: "trees_open", code: "2b", label: "Trees – Hutan Terbuka (50–75%)", icon: "🌲", cn: { A: 36, B: 60, C: 73, D: 79 } },
  { id: "flooded", code: 4, label: "Flooded Vegetation / Rawa", icon: "🌿", cn: { A: 100, B: 100, C: 100, D: 100 } },
  { id: "crops_dry", code: "5a", label: "Crops – Lahan Kering", icon: "🌾", cn: { A: 62, B: 71, C: 78, D: 81 } },
  { id: "crops_wet", code: "5b", label: "Crops – Sawah / Padi", icon: "🌾", cn: { A: 72, B: 81, C: 88, D: 91 } },
  { id: "built_dense", code: "7a", label: "Built Area – Permukiman Padat (>65%)", icon: "🏙️", cn: { A: 77, B: 85, C: 90, D: 92 } },
  { id: "built_med", code: "7b", label: "Built Area – Permukiman Sedang (30–65%)", icon: "🏘️", cn: { A: 61, B: 75, C: 83, D: 87 } },
  { id: "built_sparse", code: "7c", label: "Built Area – Permukiman Jarang (<30%)", icon: "🏡", cn: { A: 54, B: 70, C: 80, D: 85 } },
  { id: "bare", code: 8, label: "Bare Ground / Lahan Terbuka", icon: "🟫", cn: { A: 68, B: 79, C: 86, D: 89 } },
  { id: "rangeland_s", code: "11a", label: "Rangeland – Semak/Belukar", icon: "🌿", cn: { A: 48, B: 67, C: 77, D: 83 } },
  { id: "rangeland_g", code: "11b", label: "Rangeland – Padang Rumput", icon: "🌱", cn: { A: 30, B: 58, C: 71, D: 78 } },
  { id: "garden", code: "mix", label: "Kebun Campuran", icon: "🌴", cn: { A: 43, B: 65, C: 76, D: 82 } }
];

const FAO_SOILS = [
  { id: "AR", label: "Arenosols (AR) – Pasir dalam", hsg: "A", note: "Infiltrasi sangat tinggi" },
  { id: "LP_s", label: "Leptosols dangkal (LP) – Litosol", hsg: "A", note: "Tanah tipis di atas batuan" },
  { id: "RG", label: "Regosols (RG) – Aluvial kasar", hsg: "A", note: "Pasir/kerikil lepas" },
  { id: "CM", label: "Cambisols (CM) – Kambisol", hsg: "B", note: "Tanah berkembang sedang" },
  { id: "LV", label: "Luvisols (LV) – Luvisol", hsg: "B", note: "Lempung dengan horizon argilik" },
  { id: "NT", label: "Nitisols (NT) – Nitisol", hsg: "B", note: "Lempung liat aktif, >NIR" },
  { id: "PH", label: "Phaeozems (PH) – Faeozem", hsg: "B", note: "Subur, lempung gelap" },
  { id: "KS", label: "Kastanozems (KS) – Kastanozem", hsg: "B", note: "Padang rumput kering" },
  { id: "AN", label: "Andosols (AN) – Andosol", hsg: "B", note: "Abu vulkanik, porositas tinggi" },
  { id: "AC", label: "Acrisols (AC) – Akrisol / Podsolik", hsg: "C", note: "Lempung liat, kesuburan rendah" },
  { id: "AL", label: "Alisols (AL) – Alisol", hsg: "C", note: "Kandungan Al tinggi" },
  { id: "FR", label: "Ferralsols (FR) – Feralitik/Latosol", hsg: "C", note: "Oksisol tropis, permeabilitas rendah" },
  { id: "LX", label: "Lixisols (LX) – Lixisol", hsg: "C", note: "Horizon argilik, aktivitas rendah" },
  { id: "PT", label: "Plinthosols (PT) – Plintosol", hsg: "C", note: "Lapisan besi keras" },
  { id: "VR", label: "Vertisols (VR) – Vertisol/Grumosol", hsg: "D", note: "Liat ekspansif, retak saat kering" },
  { id: "GL", label: "Gleysols (GL) – Gleisol", hsg: "D", note: "Tergenang/drainase buruk" },
  { id: "HS", label: "Histosols (HS) – Gambut", hsg: "D", note: "Organik jenuh air" },
  { id: "PL", label: "Planosols (PL) – Planosol", hsg: "D", note: "Lapisan kedap di bawah permukaan" },
  { id: "SN", label: "Solonetz (SN) – Solonetz", hsg: "D", note: "Na tinggi, struktur columnar" }
];

const HSG_COLOR = { A: "#22d3ee", B: "#4ade80", C: "#fbbf24", D: "#f87171" };
const HSG_BG = {
  A: "rgba(34, 211, 238, 0.12)",
  B: "rgba(74, 222, 128, 0.12)",
  C: "rgba(251, 191, 36, 0.12)",
  D: "rgba(248, 113, 113, 0.12)"
};

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const newRow = () => ({ id: makeId(), esri: "", soil: "", area: "" });
const newSubDAS = (n) => ({ id: makeId(), name: `SB_${n}`, rows: [newRow()] });

let state = {
  subDASList: [newSubDAS(1)],
  activeTab: 0,
  showRef: false
};

const app = document.getElementById("app");

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function findESRI(id) {
  return ESRI_CLASSES.find((item) => item.id === id);
}

function findSoil(id) {
  return FAO_SOILS.find((item) => item.id === id);
}

function calcCN(rows) {
  let sumCNxA = 0;
  let sumA = 0;

  const detail = rows.map((row) => {
    const esri = findESRI(row.esri);
    const soil = findSoil(row.soil);
    const area = parseFloat(row.area) || 0;

    if (!esri || !soil || area <= 0) {
      return { ...row, cn: null, area: 0, hsg: null };
    }

    const cn = esri.cn[soil.hsg];
    sumCNxA += cn * area;
    sumA += area;

    return {
      ...row,
      cn,
      area,
      hsg: soil.hsg,
      esriLabel: esri.label,
      soilLabel: soil.label
    };
  });

  const cnComposite = sumA > 0 ? sumCNxA / sumA : null;
  const s = cnComposite ? 25400 / cnComposite - 254 : null;

  return {
    detail,
    totalArea: sumA,
    cnComposite,
    S: s,
    Ia: s ? 0.2 * s : null
  };
}

function cnColor(cn) {
  if (!cn) return "#94a3b8";
  if (cn < 60) return HSG_COLOR.A;
  if (cn < 75) return HSG_COLOR.B;
  if (cn < 85) return HSG_COLOR.C;
  return HSG_COLOR.D;
}

function cnBg(cn) {
  if (!cn) return "transparent";
  if (cn < 60) return HSG_BG.A;
  if (cn < 75) return HSG_BG.B;
  if (cn < 85) return HSG_BG.C;
  return HSG_BG.D;
}

function cnStatus(cn) {
  if (!cn) return "BELUM LENGKAP";
  if (cn < 60) return "🟢 LIMPASAN RENDAH";
  if (cn < 75) return "🟡 LIMPASAN SEDANG";
  if (cn < 85) return "🟠 LIMPASAN TINGGI";
  return "🔴 LIMPASAN SANGAT TINGGI";
}

function cnStatusShort(cn) {
  if (!cn) return "BELUM LENGKAP";
  if (cn < 60) return "RENDAH";
  if (cn < 75) return "SEDANG";
  if (cn < 85) return "TINGGI";
  return "SANGAT TINGGI";
}

function cnBar(cn) {
  if (!cn) return 0;
  return Math.min(100, Math.max(0, cn));
}

function updateSubDAS(index, updater) {
  state.subDASList = state.subDASList.map((item, itemIndex) => {
    return itemIndex === index ? updater(item) : item;
  });
}

function addSubDAS() {
  const n = state.subDASList.length + 1;
  state.subDASList.push(newSubDAS(n));
  state.activeTab = state.subDASList.length - 1;
  render();
}

function removeSubDAS(index) {
  if (state.subDASList.length === 1) return;
  state.subDASList = state.subDASList.filter((_, itemIndex) => itemIndex !== index);
  state.activeTab = Math.max(0, state.activeTab - (index <= state.activeTab ? 1 : 0));
  render();
}

function addRow() {
  updateSubDAS(state.activeTab, (subdas) => ({ ...subdas, rows: [...subdas.rows, newRow()] }));
  render();
}

function removeRow(rowId) {
  updateSubDAS(state.activeTab, (subdas) => {
    if (subdas.rows.length <= 1) return subdas;
    return { ...subdas, rows: subdas.rows.filter((row) => row.id !== rowId) };
  });
  render();
}

function updateRow(rowId, field, value) {
  updateSubDAS(state.activeTab, (subdas) => ({
    ...subdas,
    rows: subdas.rows.map((row) => row.id === rowId ? { ...row, [field]: value } : row)
  }));
  render();
}

function renameActiveSubDAS(value) {
  updateSubDAS(state.activeTab, (subdas) => ({ ...subdas, name: value }));
  render();
}

function renderESRIReference() {
  const rows = ESRI_CLASSES.map((item) => {
    return `
      <tr>
        <td>${escapeHTML(item.icon)} ${escapeHTML(item.label)}</td>
        ${["A", "B", "C", "D"].map((hsg) => `
          <td style="text-align:center;color:${cnColor(item.cn[hsg])};font-weight:700;">${item.cn[hsg]}</td>
        `).join("")}
      </tr>
    `;
  }).join("");

  return `
    <section>
      <div class="section-label">ESRI LAND COVER → CN PER HSG</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kelas ESRI</th>
              <th style="text-align:center;color:${HSG_COLOR.A};">A</th>
              <th style="text-align:center;color:${HSG_COLOR.B};">B</th>
              <th style="text-align:center;color:${HSG_COLOR.C};">C</th>
              <th style="text-align:center;color:${HSG_COLOR.D};">D</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSoilReference() {
  const rows = FAO_SOILS.map((soil) => `
    <tr>
      <td>${escapeHTML(soil.label)}</td>
      <td>
        <span class="hsg-pill" style="background:${HSG_BG[soil.hsg]};color:${HSG_COLOR[soil.hsg]};border:1px solid ${HSG_COLOR[soil.hsg]}40;">HSG ${soil.hsg}</span>
      </td>
      <td style="color:#64748b;font-size:10px;">${escapeHTML(soil.note)}</td>
    </tr>
  `).join("");

  return `
    <section>
      <div class="section-label">FAO SOIL UNITS → HYDROLOGIC SOIL GROUP (HSG)</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Jenis Tanah FAO</th>
              <th>HSG</th>
              <th>Karakteristik</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOptions(type, selectedValue) {
  if (type === "esri") {
    return `
      <option value="">Pilih kelas ESRI...</option>
      ${ESRI_CLASSES.map((item) => `
        <option value="${escapeHTML(item.id)}" ${selectedValue === item.id ? "selected" : ""}>
          ${escapeHTML(item.icon)} ${escapeHTML(item.label)}
        </option>
      `).join("")}
    `;
  }

  return `
    <option value="">Pilih tanah FAO...</option>
    ${["A", "B", "C", "D"].map((hsg) => `
      <optgroup label="HSG ${hsg}">
        ${FAO_SOILS.filter((soil) => soil.hsg === hsg).map((soil) => `
          <option value="${escapeHTML(soil.id)}" ${selectedValue === soil.id ? "selected" : ""}>
            ${escapeHTML(soil.label)}
          </option>
        `).join("")}
      </optgroup>
    `).join("")}
  `;
}

function renderRows(active) {
  return active.rows.map((row) => {
    const esri = findESRI(row.esri);
    const soil = findSoil(row.soil);
    const area = parseFloat(row.area) || 0;
    const cn = esri && soil ? esri.cn[soil.hsg] : null;
    const isValid = esri && soil && area > 0;

    return `
      <div class="input-row ${isValid ? "valid" : ""}" data-row-id="${escapeHTML(row.id)}">
        <select class="row-select ${row.esri ? "" : "placeholder"}" data-field="esri">
          ${renderOptions("esri", row.esri)}
        </select>

        <select class="row-select ${row.soil ? "" : "placeholder"}" data-field="soil">
          ${renderOptions("soil", row.soil)}
        </select>

        <input class="area-input" data-field="area" type="number" min="0" step="0.1" placeholder="0.0" value="${escapeHTML(row.area)}" />

        <div class="cn-cell" style="color:${cn ? cnColor(cn) : "#334155"};background:${cn && soil ? HSG_BG[soil.hsg] : "transparent"};">
          ${cn ?? "—"}
          ${soil ? `<div class="hsg-mini" style="color:${HSG_COLOR[soil.hsg]};">HSG ${soil.hsg}</div>` : ""}
        </div>

        <button class="remove-row" data-row-id="${escapeHTML(row.id)}" title="Hapus baris">✕</button>
      </div>
    `;
  }).join("");
}

function renderResultPanel(active, result) {
  const cn = result.cnComposite;

  return `
    <aside class="side-panel">
      <section class="result-card">
        <div class="result-label">CN KOMPOSIT — ${escapeHTML(active.name)}</div>
        <div class="result-number" style="color:${cn ? cnColor(cn) : "#334155"};text-shadow:${cn ? `0 0 40px ${cnColor(cn)}60` : "none"};">
          ${cn ? cn.toFixed(1) : "—"}
        </div>
        <div class="cn-bar">
          <div class="cn-bar-fill" style="width:${cnBar(cn)}%;background:${cn ? `linear-gradient(90deg, #22d3ee, ${cnColor(cn)})` : "#334155"};"></div>
        </div>
        <div class="bar-scale"><span>0</span><span>50</span><span>100</span></div>
        ${cn ? `<div class="status-pill" style="background:${cnBg(cn)};color:${cnColor(cn)};">${cnStatus(cn)}</div>` : ""}
      </section>

      ${cn ? `
        <section class="info-card">
          <div class="section-label">PARAMETER TURUNAN</div>
          ${[
            { label: "S (Potensi Retensi)", value: result.S?.toFixed(1), unit: "mm", desc: "S = 25400/CN − 254" },
            { label: "Ia (Initial Abstraction)", value: result.Ia?.toFixed(1), unit: "mm", desc: "Ia = 0.2 × S" },
            { label: "Total Luas Sub-DAS", value: result.totalArea.toFixed(2), unit: "ha", desc: "∑ Ai" }
          ].map((item) => `
            <div class="param-item">
              <div class="param-main">
                <span class="param-label">${item.label}</span>
                <span class="param-value">${item.value} <span class="param-unit">${item.unit}</span></span>
              </div>
              <div class="param-desc">${item.desc}</div>
            </div>
          `).join("")}
        </section>
      ` : ""}

      ${result.totalArea > 0 ? `
        <section class="info-card">
          <div class="section-label">PROPORSI TUTUPAN LAHAN</div>
          ${result.detail.filter((item) => item.area > 0 && item.cn).map((item) => {
            const esri = findESRI(item.esri);
            const percent = (item.area / result.totalArea) * 100;
            return `
              <div class="area-item">
                <div class="area-head">
                  <span>${escapeHTML(esri?.icon ?? "")} ${escapeHTML(item.esri.replaceAll("_", " ").toUpperCase().slice(0, 20))}</span>
                  <span>${percent.toFixed(1)}%</span>
                </div>
                <div class="area-track">
                  <div class="area-fill" style="width:${percent}%;background:${HSG_COLOR[item.hsg]};"></div>
                </div>
              </div>
            `;
          }).join("")}
        </section>
      ` : ""}
    </aside>
  `;
}

function renderTabs(allResults) {
  return `
    <nav class="tabs">
      ${state.subDASList.map((subdas, index) => {
        const result = allResults[index];
        const isActive = index === state.activeTab;
        return `
          <button class="tab ${isActive ? "active" : ""}" data-tab-index="${index}">
            <span class="tab-name">${escapeHTML(subdas.name)}</span>
            ${result.cnComposite ? `<span class="tab-cn" style="color:${cnColor(result.cnComposite)};">${result.cnComposite.toFixed(1)}</span>` : ""}
            ${state.subDASList.length > 1 ? `<span class="remove-tab" data-remove-index="${index}">✕</span>` : ""}
          </button>
        `;
      }).join("")}
      <button class="ghost-button" id="addSubDAS">+ SUB-DAS</button>
    </nav>
  `;
}

function renderSummary(allResults) {
  if (state.subDASList.length <= 1) return "";

  return `
    <section class="summary-card">
      <div class="summary-title">RINGKASAN SEMUA SUB-DAS</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sub-DAS</th>
              <th>Luas (ha)</th>
              <th>CN Komposit</th>
              <th>S (mm)</th>
              <th>Ia (mm)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allResults.map((subdas, index) => `
              <tr class="summary-row ${index === state.activeTab ? "active" : ""}" data-summary-index="${index}">
                <td style="color:#93c5fd;font-weight:700;">${escapeHTML(subdas.name)}</td>
                <td>${subdas.totalArea.toFixed(2)}</td>
                <td>${subdas.cnComposite ? `<span style="font-size:16px;font-weight:700;color:${cnColor(subdas.cnComposite)};">${subdas.cnComposite.toFixed(1)}</span>` : `<span class="empty-text">—</span>`}</td>
                <td>${subdas.S ? subdas.S.toFixed(1) : "—"}</td>
                <td>${subdas.Ia ? subdas.Ia.toFixed(1) : "—"}</td>
                <td>
                  <span class="status-pill" style="margin-top:0;background:${cnBg(subdas.cnComposite)};color:${cnColor(subdas.cnComposite)};">
                    ${cnStatusShort(subdas.cnComposite)}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function render() {
  if (!state.subDASList[state.activeTab]) state.activeTab = 0;

  const active = state.subDASList[state.activeTab];
  const result = calcCN(active.rows);
  const allResults = state.subDASList.map((subdas) => ({ ...subdas, ...calcCN(subdas.rows) }));
  const validRows = active.rows.filter((row) => row.esri && row.soil && parseFloat(row.area) > 0).length;

  app.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <div class="brand-icon">🌊</div>
        <div>
          <div class="brand-title">CN COMPOSITE CALCULATOR</div>
          <div class="brand-subtitle">ESRI LAND COVER × FAO SOIL (HSG) — HEC-HMS PARAMETER</div>
        </div>
      </div>
      <button id="toggleRef" class="ref-button ${state.showRef ? "active" : ""}">
        ${state.showRef ? "✕ TUTUP" : "📋 TABEL REFERENSI"}
      </button>
    </header>

    ${state.showRef ? `
      <section class="reference-section">
        <div class="reference-grid">
          ${renderESRIReference()}
          ${renderSoilReference()}
        </div>
      </section>
    ` : ""}

    <section class="main-area">
      ${renderTabs(allResults)}

      <div class="content-grid">
        <section>
          <div class="name-row">
            <input id="activeName" class="subdas-name" value="${escapeHTML(active.name)}" />
            <span class="small-info">${validRows} baris valid · ${result.totalArea.toFixed(1)} ha total</span>
          </div>

          <div class="grid-head">
            <div>KELAS TUTUPAN LAHAN (ESRI)</div>
            <div>JENIS TANAH FAO</div>
            <div>LUAS (ha)</div>
            <div>CN</div>
            <div></div>
          </div>

          <div class="input-list">
            ${renderRows(active)}
          </div>

          <button id="addRow" class="add-row-button">+ TAMBAH BARIS</button>
        </section>

        ${renderResultPanel(active, result)}
      </div>

      ${renderSummary(allResults)}

      <footer class="footer-formula">
        <span>CN komposit = Σ(CNᵢ × Aᵢ) / ΣAᵢ</span>
        <span>S = 25400/CN − 254 (mm)</span>
        <span>Ia = 0.2 × S (mm)</span>
        <span>Referensi: USDA TR-55 / NEH-4</span>
      </footer>
    </section>
  `;

  bindEvents();
}

function bindEvents() {
  document.getElementById("toggleRef")?.addEventListener("click", () => {
    state.showRef = !state.showRef;
    render();
  });

  document.getElementById("addSubDAS")?.addEventListener("click", addSubDAS);
  document.getElementById("addRow")?.addEventListener("click", addRow);

  document.getElementById("activeName")?.addEventListener("change", (event) => {
    renameActiveSubDAS(event.target.value);
  });

  document.querySelectorAll("[data-tab-index]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-index]");
      if (removeButton) {
        removeSubDAS(Number(removeButton.dataset.removeIndex));
        return;
      }
      state.activeTab = Number(button.dataset.tabIndex);
      render();
    });
  });

  document.querySelectorAll("[data-summary-index]").forEach((row) => {
    row.addEventListener("click", () => {
      state.activeTab = Number(row.dataset.summaryIndex);
      render();
    });
  });

  document.querySelectorAll(".remove-row").forEach((button) => {
    button.addEventListener("click", () => removeRow(button.dataset.rowId));
  });

  document.querySelectorAll(".row-select").forEach((select) => {
    select.addEventListener("change", () => {
      const row = select.closest(".input-row");
      updateRow(row.dataset.rowId, select.dataset.field, select.value);
    });
  });

  document.querySelectorAll(".area-input").forEach((input) => {
    input.addEventListener("change", () => {
      const row = input.closest(".input-row");
      updateRow(row.dataset.rowId, input.dataset.field, input.value);
    });
  });
}

render();
