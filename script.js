// ── REFERENSI ────────────────────────────────────────────────────────────────
const REFS = {
  TR55: {
    id:"TR55", tag:"[1]",
    authors:"USDA-SCS",
    year:1986,
    title:"Urban Hydrology for Small Watersheds, Technical Release 55 (TR-55), 2nd ed.",
    publisher:"U.S. Soil Conservation Service, Washington D.C.",
    note:"Sumber utama tabel CN berdasarkan tata guna lahan dan HSG.",
    url:"https://www.nrc.gov/docs/ML1421/ML14219A437.pdf",
    color:"#60a5fa",
  },
  NEH4: {
    id:"NEH4", tag:"[2]",
    authors:"USDA-SCS",
    year:1985,
    title:"National Engineering Handbook, Section 4 – Hydrology (NEH-4)",
    publisher:"U.S. Soil Conservation Service, Washington D.C.",
    note:"Dasar teori metode SCS-CN, AMC, dan persamaan limpasan.",
    url:"https://www.nrcs.usda.gov/wps/portal/nrcs/detailfull/national/water/manage/hydrology/",
    color:"#60a5fa",
  },
  HYSOG: {
    id:"HYSOG", tag:"[3]",
    authors:"Ross, C.W., Prihodko, L., Anchang, J., Kumar, S., Ji, W., Hanan, N.P.",
    year:2018,
    title:"HYSOGs250m, global gridded hydrologic soil groups for curve-number-based runoff modeling",
    publisher:"Scientific Data, 5, 180091. DOI: 10.1038/sdata.2018.91",
    note:"Dasar klasifikasi FAO Soil → HSG global berbasis tekstur tanah, kedalaman batuan, dan air tanah.",
    url:"https://www.nature.com/articles/sdata201891",
    color:"#34d399",
  },
  GCN250: {
    id:"GCN250", tag:"[4]",
    authors:"Jaafar, H.H., Ahmad, F.A., El Beyrouthy, N.",
    year:2019,
    title:"GCN250, new global gridded curve numbers for hydrologic modeling and design",
    publisher:"Scientific Data, 6, 145. DOI: 10.1038/s41597-019-0155-x",
    note:"Dataset CN global dari ESA CCI Land Cover × HYSOGs250m; validasi nilai CN untuk kawasan tropis.",
    url:"https://www.nature.com/articles/s41597-019-0155-x",
    color:"#34d399",
  },
  HECREF: {
    id:"HECREF", tag:"[5]",
    authors:"USACE HEC",
    year:2023,
    title:"HEC-HMS Technical Reference Manual, Version 4.12",
    publisher:"U.S. Army Corps of Engineers Hydrologic Engineering Center, Davis, CA.",
    note:"Implementasi SCS-CN dalam HEC-HMS: Loss Method, parameter Ia, CN, dan routing.",
    url:"https://www.hec.usace.army.mil/confluence/hmsdocs/hmstrm/cn-tables",
    color:"#60a5fa",
  },
  AWALUDIN: {
    id:"AWALUDIN", tag:"[6]",
    authors:"Awaludin, M., et al.",
    year:2025,
    title:"Analisis Pengaruh Tata Guna Lahan Terhadap Perubahan Karakteristik Hidrograf Banjir di Sub DAS Sungai Negara Kota Amuntai",
    publisher:"Jurnal Rekayasa, Universitas Trunojoyo Madura.",
    note:"Contoh penerapan CN dari overlay TGL-HSG menggunakan QGIS untuk pemodelan HEC-HMS di DAS Indonesia.",
    url:"https://journal.trunojoyo.ac.id/rekayasa/article/view/31612",
    color:"#f59e0b",
  },
  FEBRIANI: {
    id:"FEBRIANI", tag:"[7]",
    authors:"Febriani, et al.",
    year:2024,
    title:"Evaluasi Kemampuan Bendungan Logung dalam Mereduksi Banjir Akibat Perubahan Curah Hujan dan Tata Guna Lahan",
    publisher:"Jurnal TEKNIK, Universitas Diponegoro. Vol. 45.",
    note:"Penggunaan SCS-CN HEC-HMS untuk analisis perubahan TGL di DAS Jawa Tengah.",
    url:"https://ejournal.undip.ac.id/index.php/teknik/article/view/61985",
    color:"#f59e0b",
  },
  BENGAWAN: {
    id:"BENGAWAN", tag:"[8]",
    authors:"Wiliya, et al.",
    year:2022,
    title:"Pemodelan Hujan-Debit Menggunakan Model HEC-HMS Di DAS Bengawan Solo Hulu",
    publisher:"Jurnal Aplikasi Teknik Sipil, ITS. Vol. 20, No. 1.",
    note:"NSE = 0.578, metodologi CN dari peta TGL dan jenis tanah untuk DAS Jawa.",
    url:"https://iptek.its.ac.id/index.php/jats/article/view/11915",
    color:"#f59e0b",
  },
};

// ── ESRI LAND COVER CLASSES ──────────────────────────────────────────────────
const ESRI_CLASSES = [
  {
    id:"water", label:"Water / Perairan", icon:"💧",
    cn:{A:100,B:100,C:100,D:100},
    refs:["TR55","NEH4"],
    basis:"Permukaan air dianggap impervious total (CN=100) per USDA TR-55 Table 2-2.",
  },
  {
    id:"trees_dense", label:"Trees – Hutan Lebat (>75% tutupan)", icon:"🌳",
    cn:{A:30,B:55,C:70,D:77},
    refs:["TR55","NEH4","GCN250"],
    basis:"TR-55 Table 2-2c: Woods, Good condition (>75% ground cover). GCN250 validasi nilai ini untuk kawasan hutan tropis.",
  },
  {
    id:"trees_open", label:"Trees – Hutan Terbuka / Sedang (50–75%)", icon:"🌲",
    cn:{A:36,B:60,C:73,D:79},
    refs:["TR55","NEH4"],
    basis:"TR-55 Table 2-2c: Woods-grass combination, Fair condition (50–75%). NEH-4 Ch. 9.",
  },
  {
    id:"flooded", label:"Flooded Vegetation / Rawa-Rawa", icon:"🌿",
    cn:{A:100,B:100,C:100,D:100},
    refs:["TR55","GCN250"],
    basis:"Lahan basah permanen dengan genangan → CN=100. GCN250 menggunakan pendekatan yang sama untuk flooded vegetation class ESA CCI.",
  },
  {
    id:"crops_dry", label:"Crops – Lahan Kering / Tegalan", icon:"🌾",
    cn:{A:62,B:71,C:78,D:81},
    refs:["TR55","NEH4","BENGAWAN"],
    basis:"TR-55 Table 2-2b: Row crops, straight rows, Good condition. Wiliya et al. (2022) menggunakan nilai ini untuk lahan tegalan di DAS Bengawan Solo.",
  },
  {
    id:"crops_wet", label:"Crops – Sawah / Lahan Basah", icon:"🌾",
    cn:{A:72,B:81,C:88,D:91},
    refs:["NEH4","AWALUDIN","FEBRIANI"],
    basis:"NEH-4: Paddy rice fields diperlakukan sebagai lahan basah dengan lapisan kedap (plow pan), menghasilkan CN tinggi. Diverifikasi penggunaannya di studi Indonesia oleh Awaludin (2025) dan Febriani (2024).",
  },
  {
    id:"built_dense", label:"Built Area – Permukiman Padat (>65% impervious)", icon:"🏙️",
    cn:{A:77,B:85,C:90,D:92},
    refs:["TR55","HECREF"],
    basis:"TR-55 Table 2-2a: Commercial and business areas (85% impervious). HEC-HMS CN Tables mengacu langsung ke nilai ini untuk urban padat.",
  },
  {
    id:"built_med", label:"Built Area – Permukiman Sedang (30–65% impervious)", icon:"🏘️",
    cn:{A:61,B:75,C:83,D:87},
    refs:["TR55","HECREF","AWALUDIN"],
    basis:"TR-55 Table 2-2a: Residential, 1/3-1 acre lots (~38% impervious). HEC-HMS Technical Reference Manual. Awaludin (2025) menggunakan kelas ini untuk permukiman sub-urban Indonesia.",
  },
  {
    id:"built_sparse", label:"Built Area – Permukiman Jarang (<30% impervious)", icon:"🏡",
    cn:{A:54,B:70,C:80,D:85},
    refs:["TR55","NEH4"],
    basis:"TR-55 Table 2-2a: Residential, 1-4 acre lots (~25% impervious). Cocok untuk permukiman pedesaan.",
  },
  {
    id:"bare", label:"Bare Ground / Lahan Terbuka / Tanah Kosong", icon:"🟫",
    cn:{A:68,B:79,C:86,D:89},
    refs:["TR55","NEH4","GCN250"],
    basis:"TR-55 Table 2-2b: Fallow, straight rows. GCN250 menggunakan nilai yang ekuivalen untuk Bare Ground class di ESA CCI.",
  },
  {
    id:"rangeland_s", label:"Rangeland – Semak / Belukar / Shrubland", icon:"🌿",
    cn:{A:48,B:67,C:77,D:83},
    refs:["TR55","NEH4","GCN250"],
    basis:"TR-55 Table 2-2c: Brush, Fair condition (50–75% ground cover). GCN250 menggunakan PFT Shrublands untuk kawasan ini.",
  },
  {
    id:"rangeland_g", label:"Rangeland – Padang Rumput / Grassland", icon:"🌱",
    cn:{A:30,B:58,C:71,D:78},
    refs:["TR55","NEH4"],
    basis:"TR-55 Table 2-2c: Meadow, Good condition. Padang rumput permanen dengan tutupan >75%.",
  },
  {
    id:"garden", label:"Kebun Campuran / Agroforestri", icon:"🌴",
    cn:{A:43,B:65,C:76,D:82},
    refs:["TR55","NEH4","FEBRIANI"],
    basis:"Interpolasi TR-55: kombinasi Woods (30%) dan Crops (70%), ekuivalen dengan mixed orchard/agroforestry. Febriani (2024) menggunakan pendekatan ini untuk kebun campuran di Jawa Tengah.",
  },
];

// ── FAO SOILS → HSG ──────────────────────────────────────────────────────────
const FAO_SOILS = [
  // HSG A
  {id:"AR",  label:"Arenosols (AR)",      hsg:"A", tex:"Pasir kasar dalam",         refs:["HYSOG","GCN250"], note:"Pori besar, infiltrasi sangat tinggi (>7.6 mm/jam)"},
  {id:"LP_s",label:"Leptosols dangkal (LP)",hsg:"A", tex:"Tanah tipis > batuan",    refs:["HYSOG"],          note:"Tipis tapi drainase cepat sebelum mencapai lapisan kedap"},
  {id:"RG",  label:"Regosols (RG)",       hsg:"A", tex:"Material kasar tidak terkonsolidasi", refs:["HYSOG","GCN250"], note:"Pasir/kerikil lepas, permeabilitas tinggi"},
  // HSG B
  {id:"CM",  label:"Cambisols (CM)",      hsg:"B", tex:"Lempung pasiran – lempung", refs:["HYSOG","GCN250"], note:"Tanah berkembang sedang, drainase baik"},
  {id:"LV",  label:"Luvisols (LV)",       hsg:"B", tex:"Lempung dengan horizon argilik", refs:["HYSOG"],    note:"Tekstur medium, permeabilitas sedang"},
  {id:"NT",  label:"Nitisols (NT)",       hsg:"B", tex:"Lempung liat, aktifitas NIR tinggi", refs:["HYSOG"],"note":"Strukturnya granular baik, drainase moderat"},
  {id:"PH",  label:"Phaeozems (PH)",      hsg:"B", tex:"Lempung gelap organik",     refs:["HYSOG"],          note:"Subur, porositas baik"},
  {id:"AN",  label:"Andosols (AN)",       hsg:"B", tex:"Abu vulkanik",               refs:["HYSOG","GCN250"], note:"Dominan di lereng Merapi–Merbabu; porositas tinggi meski lempung"},
  // HSG C
  {id:"AC",  label:"Acrisols (AC) / Podsolik", hsg:"C", tex:"Lempung liat, kesuburan rendah", refs:["HYSOG","GCN250"], note:"Horizon argilik; permeabilitas rendah"},
  {id:"AL",  label:"Alisols (AL)",        hsg:"C", tex:"Lempung liat Al tinggi",    refs:["HYSOG"],          note:"pH rendah, permeabilitas terbatas"},
  {id:"FR",  label:"Ferralsols (FR) / Latosol", hsg:"C", tex:"Liat oksisol tropis",  refs:["HYSOG","GCN250"], note:"Umum di Jawa; liat besi/aluminium, permeabilitas rendah"},
  {id:"LX",  label:"Lixisols (LX)",       hsg:"C", tex:"Lempung, aktivitas rendah", refs:["HYSOG"],          note:"Horizon argilik dengan liat aktivitas rendah"},
  // HSG D
  {id:"VR",  label:"Vertisols (VR) / Grumosol", hsg:"D", tex:"Liat ekspansif (>30% smektit)", refs:["HYSOG","GCN250","FEBRIANI"], note:"Dominan di Bantul–Gunung Kidul; retak saat kering, kedap saat basah"},
  {id:"GL",  label:"Gleysols (GL)",       hsg:"D", tex:"Liat jenuh air",             refs:["HYSOG"],          note:"Drainase sangat buruk; horizon gley"},
  {id:"HS",  label:"Histosols (HS) / Gambut", hsg:"D", tex:"Organik jenuh air",     refs:["HYSOG"],          note:"Lahan gambut; CN=100 di kondisi basah"},
  {id:"PL",  label:"Planosols (PL)",      hsg:"D", tex:"Lapisan kedap dangkal",      refs:["HYSOG"],          note:"Horizon albik di atas lapisan natric/argilik kedap"},
];

const HSG_COL = {A:"#22d3ee",B:"#4ade80",C:"#fbbf24",D:"#f87171"};
const HSG_BG  = {A:"rgba(34,211,238,0.1)",B:"rgba(74,222,128,0.1)",C:"rgba(251,191,36,0.1)",D:"rgba(248,113,113,0.1)"};

// ── VANILLA JAVASCRIPT APP ───────────────────────────────────────────────────

const state = {
  subs: [newSub(1)],
  active: 0,
  panel: "calc"
};

const app = document.getElementById("app");
const tooltip = document.createElement("div");
tooltip.className = "ref-tooltip";
document.body.appendChild(tooltip);

function cnColor(cn) {
  if (!cn) return "#475569";
  if (cn < 60) return "#22d3ee";
  if (cn < 75) return "#4ade80";
  if (cn < 85) return "#fbbf24";
  return "#f87171";
}

function newRow() {
  return {
    id: String(Date.now() + Math.random()),
    esri: "",
    soil: "",
    area: ""
  };
}

function newSub(n) {
  return {
    id: String(Date.now() + Math.random()),
    name: `SB_${n}`,
    rows: [newRow()]
  };
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function refTag(refId) {
  const r = REFS[refId];
  if (!r) return "";
  return `<span 
    class="ref-tag" 
    data-ref="${escapeHTML(refId)}"
    style="color:${r.color}; border:1px solid ${r.color}40;"
  >${escapeHTML(r.tag)}</span>`;
}

function calc(rows) {
  let sumCA = 0;
  let sumA = 0;

  const det = rows.map(row => {
    const e = ESRI_CLASSES.find(item => item.id === row.esri);
    const s = FAO_SOILS.find(item => item.id === row.soil);
    const a = parseFloat(row.area) || 0;

    if (!e || !s || a <= 0) {
      return { ...row, cn: null, area: 0, hsg: null };
    }

    const cn = e.cn[s.hsg];
    sumCA += cn * a;
    sumA += a;

    return {
      ...row,
      cn,
      area: a,
      hsg: s.hsg,
      esriObj: e,
      soilObj: s
    };
  });

  const cnC = sumA > 0 ? sumCA / sumA : null;

  return {
    det,
    totalArea: sumA,
    cnC,
    S: cnC ? 25400 / cnC - 254 : null,
    Ia: cnC ? 0.2 * (25400 / cnC - 254) : null
  };
}

function runoffStatus(cn) {
  if (!cn) return "";
  if (cn < 60) return "🟢 LIMPASAN RENDAH";
  if (cn < 75) return "🟡 LIMPASAN SEDANG";
  if (cn < 85) return "🟠 LIMPASAN TINGGI";
  return "🔴 LIMPASAN SANGAT TINGGI";
}

function shortStatus(cn) {
  if (!cn) return "BELUM LENGKAP";
  if (cn < 60) return "RENDAH";
  if (cn < 75) return "SEDANG";
  if (cn < 85) return "TINGGI";
  return "SANGAT TINGGI";
}

function getCurrent() {
  return state.subs[state.active];
}

function updateCurrent(fn) {
  state.subs = state.subs.map((sub, index) => index === state.active ? fn(sub) : sub);
}

function renderNav() {
  const navs = [
    ["calc", "🧮 KALKULATOR"],
    ["cn_table", "📋 TABEL CN"],
    ["fao_table", "🪨 TABEL FAO→HSG"],
    ["refs", "📚 REFERENSI"]
  ];

  return navs.map(([id, label]) => `
    <button class="nav-btn ${state.panel === id ? "active" : ""}" data-panel="${id}">
      ${label}
    </button>
  `).join("");
}

function renderHeader() {
  return `
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <div class="logo">🌊</div>
          <div>
            <div class="title">CN COMPOSITE CALCULATOR</div>
            <div class="subtitle">ESRI LAND COVER × FAO SOIL HSG — USDA SCS-CN METHOD — HEC-HMS READY</div>
          </div>
        </div>
        <nav class="nav">
          ${renderNav()}
        </nav>
      </div>
    </header>
  `;
}

function renderSubTabs(allRes) {
  const tabs = state.subs.map((sub, index) => {
    const res = allRes[index];
    const activeClass = index === state.active ? "active" : "";
    const cnText = res.cnC ? `<span class="sub-cn" style="color:${cnColor(res.cnC)}">${res.cnC.toFixed(1)}</span>` : "";
    const deleteBtn = state.subs.length > 1
      ? `<button class="delete-sub" data-delete-sub="${index}" title="Hapus Sub-DAS">✕</button>`
      : "";

    return `
      <div class="sub-tab ${activeClass}" data-set-active="${index}">
        <span class="sub-name">${escapeHTML(sub.name)}</span>
        ${cnText}
        ${deleteBtn}
      </div>
    `;
  }).join("");

  return `
    <div class="tabs">
      ${tabs}
      <button class="add-sub" id="addSub">+ SUB-DAS</button>
    </div>
  `;
}

function renderInputRows(cur) {
  return cur.rows.map(row => {
    const e = ESRI_CLASSES.find(item => item.id === row.esri);
    const s = FAO_SOILS.find(item => item.id === row.soil);
    const cn = e && s ? e.cn[s.hsg] : null;
    const valid = e && s && parseFloat(row.area) > 0;

    const esriOptions = ESRI_CLASSES.map(item => `
      <option value="${escapeHTML(item.id)}" ${row.esri === item.id ? "selected" : ""}>
        ${escapeHTML(item.icon + " " + item.label)}
      </option>
    `).join("");

    const soilOptions = ["A", "B", "C", "D"].map(hsg => `
      <optgroup label="HSG ${hsg}">
        ${FAO_SOILS.filter(item => item.hsg === hsg).map(item => `
          <option value="${escapeHTML(item.id)}" ${row.soil === item.id ? "selected" : ""}>
            ${escapeHTML(item.label)}
          </option>
        `).join("")}
      </optgroup>
    `).join("");

    const cnCell = cn
      ? `
        <div>
          <div class="cn-number" style="color:${cnColor(cn)}">${cn}</div>
          <div class="hsg-label" style="color:${HSG_COL[s.hsg]}">HSG ${s.hsg}</div>
        </div>
      `
      : `<span class="empty">—</span>`;

    return `
      <div class="input-row ${valid ? "valid" : ""}" data-row-id="${escapeHTML(row.id)}">
        <select class="${row.esri ? "" : "placeholder"}" data-field="esri">
          <option value="">Pilih kelas ESRI...</option>
          ${esriOptions}
        </select>

        <select class="${row.soil ? "" : "placeholder"}" data-field="soil">
          <option value="">Pilih tanah FAO...</option>
          ${soilOptions}
        </select>

        <input 
          class="area-input" 
          data-field="area" 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="0.00" 
          value="${escapeHTML(row.area)}"
        />

        <div class="cn-cell">
          ${cnCell}
        </div>

        <button class="delete-row" data-delete-row="${escapeHTML(row.id)}" title="Hapus baris">✕</button>
      </div>
    `;
  }).join("");
}

function renderBasisNotes(res) {
  const validRows = res.det.filter(row => row.cn && row.esriObj);
  if (!validRows.length) return "";

  return `
    <div class="notes-card">
      <div class="card-title">DASAR PENETAPAN CN (BARIS TERISI)</div>
      ${validRows.map(row => `
        <div class="note-item">
          <div class="note-title">
            ${escapeHTML(row.esriObj.icon)} 
            <strong>${escapeHTML(row.esriObj.label)}</strong>
            × <strong style="color:${HSG_COL[row.hsg]}">HSG ${row.hsg}</strong>
            → <strong style="color:${cnColor(row.cn)}">${row.cn}</strong>
          </div>
          <div class="note-basis">${escapeHTML(row.esriObj.basis)}</div>
          <div class="note-ref-line">
            ${row.esriObj.refs.map(refTag).join("")}
            <span class="ref-help">← arahkan kursor untuk detail referensi</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderResultPanel(cur, res) {
  const color = cnColor(res.cnC);
  const progressWidth = Math.min(100, res.cnC || 0);
  const status = res.cnC ? `
    <div class="status" style="background:${color}15; color:${color}">
      ${runoffStatus(res.cnC)}
    </div>
  ` : "";

  const parameters = res.cnC ? `
    <div class="parameter-card">
      <div class="card-title">PARAMETER TURUNAN</div>
      ${[
        { label: "S — Potensi Retensi", value: res.S?.toFixed(1), unit: "mm", formula: "S = 25400/CN − 254", refs: ["NEH4", "TR55"] },
        { label: "Ia — Initial Abstraction", value: res.Ia?.toFixed(1), unit: "mm", formula: "Ia = 0.2 × S", refs: ["NEH4", "HECREF"] },
        { label: "Total Luas", value: res.totalArea.toFixed(2), unit: "ha", formula: "ΣAᵢ", refs: [] }
      ].map(item => `
        <div class="param-item">
          <div class="param-top">
            <span class="param-name">${escapeHTML(item.label)}</span>
            <span class="param-value">${escapeHTML(item.value)} <span class="param-unit">${escapeHTML(item.unit)}</span></span>
          </div>
          <div class="param-formula">
            ${escapeHTML(item.formula)} ${item.refs.map(refTag).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  ` : "";

  return `
    <aside class="result-stack">
      <div class="result-card">
        <div class="result-label">CN KOMPOSIT — ${escapeHTML(cur.name)}</div>
        <div class="result-number" style="color:${res.cnC ? color : "#1e293b"}; text-shadow:${res.cnC ? `0 0 40px ${color}50` : "none"}">
          ${res.cnC ? res.cnC.toFixed(1) : "—"}
        </div>
        <div class="progress">
          <div class="progress-fill" style="width:${progressWidth}%; background:${res.cnC ? `linear-gradient(90deg,#22d3ee,${color})` : "#1e293b"}"></div>
        </div>
        <div class="scale">
          <span>0</span><span>50</span><span>100</span>
        </div>
        ${status}
      </div>
      ${parameters}
    </aside>
  `;
}

function renderSummary(allRes) {
  if (state.subs.length <= 1) return "";

  return `
    <section class="summary">
      <div class="summary-head">RINGKASAN SEMUA SUB-DAS</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${["Sub-DAS", "Luas (ha)", "CN Komposit", "S (mm)", "Ia (mm)", "Status Limpasan"].map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${allRes.map((sub, index) => {
              const color = cnColor(sub.cnC);
              return `
                <tr class="summary-row ${index === state.active ? "active" : ""}" data-set-active="${index}">
                  <td style="color:#93c5fd; font-weight:600; font-size:12px">${escapeHTML(sub.name)}</td>
                  <td>${sub.totalArea.toFixed(2)}</td>
                  <td>${sub.cnC ? `<span style="font-size:15px; font-weight:700; color:${color}">${sub.cnC.toFixed(1)}</span>` : `<span class="empty">—</span>`}</td>
                  <td style="color:#64748b">${sub.S ? sub.S.toFixed(1) : "—"}</td>
                  <td style="color:#64748b">${sub.Ia ? sub.Ia.toFixed(1) : "—"}</td>
                  <td>
                    ${sub.cnC ? `<span class="status-small" style="background:${color}15; color:${color}">${shortStatus(sub.cnC)}</span>` : `<span style="color:#1e293b; font-size:9px">BELUM LENGKAP</span>`}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCalcPanel() {
  const cur = getCurrent();
  const res = calc(cur.rows);
  const allRes = state.subs.map(sub => ({ ...sub, ...calc(sub.rows) }));

  return `
    <main class="main">
      ${renderSubTabs(allRes)}

      <div class="grid-layout">
        <section>
          <div class="sub-input-row">
            <input class="sub-input" id="subName" value="${escapeHTML(cur.name)}" />
            <span class="sub-meta">
              ${res.det.filter(row => row.cn).length} baris valid · ${res.totalArea.toFixed(1)} ha
            </span>
          </div>

          <div class="row-header">
            ${["TUTUPAN LAHAN (ESRI)", "JENIS TANAH (FAO)", "LUAS (ha)", "CN", ""].map(h => `<div>${h}</div>`).join("")}
          </div>

          <div class="rows-wrap">
            ${renderInputRows(cur)}
          </div>

          ${renderBasisNotes(res)}

          <button class="add-row" id="addRow">+ TAMBAH BARIS</button>
        </section>

        ${renderResultPanel(cur, res)}
      </div>

      ${renderSummary(allRes)}

      <footer class="footer-formula">
        <span>CN komposit = Σ(CNᵢ×Aᵢ)/ΣAᵢ</span>
        <span>S = 25400/CN−254 (mm)</span>
        <span>Ia = 0.2×S (mm)</span>
        <span>Ref: ${refTag("TR55")}${refTag("NEH4")}${refTag("HYSOG")}${refTag("GCN250")}</span>
      </footer>
    </main>
  `;
}

function renderRefsPanel() {
  return `
    <main class="panel-main ref-list">
      <div class="panel-title">DAFTAR REFERENSI — DASAR PENETAPAN NILAI CN</div>

      ${Object.values(REFS).map(r => `
        <article class="ref-card" style="border-color:${r.color}20; border-left-color:${r.color}">
          <div class="ref-card-top">
            <div style="flex:1">
              <div>
                <span class="ref-badge" style="background:${r.color}20; color:${r.color}; border:1px solid ${r.color}40">${escapeHTML(r.tag)}</span>
                <span class="ref-authors">${escapeHTML(r.authors)} (${escapeHTML(r.year)})</span>
              </div>
              <div class="ref-title">${escapeHTML(r.title)}</div>
              <div class="ref-publisher">${escapeHTML(r.publisher)}</div>
              <div class="ref-note">💡 <strong>Relevansi:</strong> ${escapeHTML(r.note)}</div>
            </div>
            <a class="ref-link" href="${escapeHTML(r.url)}" target="_blank" rel="noreferrer" style="color:${r.color}; border:1px solid ${r.color}30">→ Akses</a>
          </div>
        </article>
      `).join("")}

      <div class="method-note">
        <strong style="color:#60a5fa">Catatan metodologi:</strong>
        Nilai CN pada kalkulator ini bersumber utama dari USDA TR-55 ${refTag("TR55")} dan NEH-4 ${refTag("NEH4")}.
        Konversi jenis tanah FAO ke HSG menggunakan skema klasifikasi HYSOGs250m ${refTag("HYSOG")}
        yang dikembangkan dari data tekstur tanah FAO SoilGrids250m.
        Validasi untuk kawasan tropis dan Indonesia merujuk pada GCN250 ${refTag("GCN250")}
        dan studi lokal ${refTag("AWALUDIN")}${refTag("FEBRIANI")}${refTag("BENGAWAN")}.
      </div>
    </main>
  `;
}

function renderCNTablePanel() {
  return `
    <main class="panel-main">
      <div class="panel-title">TABEL CN PER KELAS ESRI LAND COVER × HSG</div>
      <div class="panel-subtitle">
        Sumber: USDA TR-55 ${refTag("TR55")} × NEH-4 ${refTag("NEH4")} — Validasi tropika: GCN250 ${refTag("GCN250")}
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kelas ESRI Land Cover</th>
              <th>Dasar Penetapan CN</th>
              <th>Referensi</th>
              ${["A", "B", "C", "D"].map(h => `<th style="text-align:center; color:${HSG_COL[h]}">HSG ${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${ESRI_CLASSES.map(e => `
              <tr>
                <td style="color:#e2e8f0; font-weight:500">${escapeHTML(e.icon)} ${escapeHTML(e.label)}</td>
                <td style="color:#64748b; font-size:10px; line-height:1.5; max-width:260px">${escapeHTML(e.basis)}</td>
                <td>${e.refs.map(refTag).join("")}</td>
                ${["A", "B", "C", "D"].map(h => `
                  <td style="text-align:center">
                    <span style="font-size:14px; font-weight:700; color:${cnColor(e.cn[h])}">${e.cn[h]}</span>
                  </td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </main>
  `;
}

function renderFAOTablePanel() {
  return `
    <main class="panel-main">
      <div class="panel-title">KONVERSI JENIS TANAH FAO → HYDROLOGIC SOIL GROUP (HSG)</div>
      <div class="panel-subtitle">
        Dasar klasifikasi: HYSOGs250m ${refTag("HYSOG")} × GCN250 ${refTag("GCN250")} — tekstur tanah FAO SoilGrids
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${["Jenis Tanah FAO", "HSG", "Tekstur Dominan", "Karakteristik Hidrologi", "Referensi"].map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${["A", "B", "C", "D"].flatMap(hsg =>
              FAO_SOILS.filter(s => s.hsg === hsg).map(s => `
                <tr>
                  <td style="color:#e2e8f0; font-weight:500">${escapeHTML(s.label)}</td>
                  <td>
                    <span class="hsg-badge" style="background:${HSG_BG[s.hsg]}; color:${HSG_COL[s.hsg]}; border:1px solid ${HSG_COL[s.hsg]}40">
                      HSG ${s.hsg}
                    </span>
                  </td>
                  <td style="color:#94a3b8; font-size:10px">${escapeHTML(s.tex)}</td>
                  <td style="color:#64748b; font-size:10px">${escapeHTML(s.note)}</td>
                  <td>${s.refs.map(refTag).join("")}</td>
                </tr>
              `)
            ).join("")}
          </tbody>
        </table>
      </div>

      <div class="warning-note">
        ⚠️ <strong>Catatan untuk DAS Oyo – Bantul:</strong>
        Berdasarkan peta tanah semi-detail BPN DIY, dominasi tanah di DAS Oyo adalah
        <strong>Vertisols/Grumosol (HSG D)</strong> di dataran Bantul,
        <strong> Ferralsols/Latosol (HSG C)</strong> di perbukitan Baturagung, dan
        <strong> Andosols (HSG B)</strong> di area pengaruh vulkanik Merapi.
        Verifikasi selalu dengan overlay peta tanah aktual. Referensi: HYSOGs250m ${refTag("HYSOG")}, Ross et al. (2018).
      </div>
    </main>
  `;
}

function renderPanel() {
  if (state.panel === "refs") return renderRefsPanel();
  if (state.panel === "cn_table") return renderCNTablePanel();
  if (state.panel === "fao_table") return renderFAOTablePanel();
  return renderCalcPanel();
}

function render() {
  app.innerHTML = `
    <div class="app-shell">
      ${renderHeader()}
      ${renderPanel()}
    </div>
  `;

  bindEvents();
  bindRefTooltip();
}

function bindEvents() {
  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.panel = btn.dataset.panel;
      render();
    });
  });

  document.querySelectorAll("[data-set-active]").forEach(item => {
    item.addEventListener("click", event => {
      if (event.target.closest("[data-delete-sub]")) return;
      state.active = Number(item.dataset.setActive);
      render();
    });
  });

  document.querySelectorAll("[data-delete-sub]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      if (state.subs.length === 1) return;

      const index = Number(btn.dataset.deleteSub);
      state.subs = state.subs.filter((_, i) => i !== index);
      state.active = Math.max(0, state.active - (index <= state.active ? 1 : 0));
      render();
    });
  });

  const addSubBtn = document.getElementById("addSub");
  if (addSubBtn) {
    addSubBtn.addEventListener("click", () => {
      state.subs.push(newSub(state.subs.length + 1));
      state.active = state.subs.length - 1;
      render();
    });
  }

  const addRowBtn = document.getElementById("addRow");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      updateCurrent(sub => ({ ...sub, rows: [...sub.rows, newRow()] }));
      render();
    });
  }

  const subNameInput = document.getElementById("subName");
  if (subNameInput) {
    subNameInput.addEventListener("input", event => {
      updateCurrent(sub => ({ ...sub, name: event.target.value }));
      render();
    });
  }

  document.querySelectorAll(".input-row").forEach(rowElement => {
    const rowId = rowElement.dataset.rowId;

    rowElement.querySelectorAll("[data-field]").forEach(input => {
      input.addEventListener("input", event => {
        const field = input.dataset.field;
        const value = event.target.value;

        updateCurrent(sub => ({
          ...sub,
          rows: sub.rows.map(row => row.id === rowId ? { ...row, [field]: value } : row)
        }));

        render();
      });
    });
  });

  document.querySelectorAll("[data-delete-row]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rowId = btn.dataset.deleteRow;

      updateCurrent(sub => ({
        ...sub,
        rows: sub.rows.length > 1 ? sub.rows.filter(row => row.id !== rowId) : sub.rows
      }));

      render();
    });
  });
}

function bindRefTooltip() {
  document.querySelectorAll(".ref-tag").forEach(tag => {
    tag.addEventListener("mouseenter", () => {
      const refId = tag.dataset.ref;
      const r = REFS[refId];

      if (!r) return;

      tag.style.background = `${r.color}30`;

      tooltip.style.border = `1px solid ${r.color}60`;
      tooltip.innerHTML = `
        <div class="tooltip-label" style="color:${r.color}">REFERENSI ${escapeHTML(r.tag)}</div>
        <div class="tooltip-authors">${escapeHTML(r.authors)} (${escapeHTML(r.year)})</div>
        <div class="tooltip-title">${escapeHTML(r.title)}</div>
        <div class="tooltip-pub">${escapeHTML(r.publisher)}</div>
        <div class="tooltip-note">💡 ${escapeHTML(r.note)}</div>
      `;
      tooltip.classList.add("show");
    });

    tag.addEventListener("mouseleave", () => {
      const refId = tag.dataset.ref;
      const r = REFS[refId];

      if (r) tag.style.background = "rgba(255,255,255,0.06)";
      tooltip.classList.remove("show");
    });
  });
}

render();
