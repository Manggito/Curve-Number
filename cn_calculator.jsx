import { useState, useCallback } from "react";

// ── ESRI Land Cover Classes (10m Global, Sentinel-2 based) ──────────────────
const ESRI_CLASSES = [
  { id: "water",       code: 1,  label: "Water",                    icon: "💧", cn: { A:100, B:100, C:100, D:100 } },
  { id: "trees_dense", code: "2a", label: "Trees – Hutan Lebat (>75%)", icon: "🌳", cn: { A:30,  B:55,  C:70,  D:77  } },
  { id: "trees_open",  code: "2b", label: "Trees – Hutan Terbuka (50–75%)", icon: "🌲", cn: { A:36,  B:60,  C:73,  D:79  } },
  { id: "flooded",     code: 4,  label: "Flooded Vegetation / Rawa", icon: "🌿", cn: { A:100, B:100, C:100, D:100 } },
  { id: "crops_dry",   code: "5a", label: "Crops – Lahan Kering",    icon: "🌾", cn: { A:62,  B:71,  C:78,  D:81  } },
  { id: "crops_wet",   code: "5b", label: "Crops – Sawah / Padi",    icon: "🌾", cn: { A:72,  B:81,  C:88,  D:91  } },
  { id: "built_dense", code: "7a", label: "Built Area – Permukiman Padat (>65%)", icon: "🏙️", cn: { A:77,  B:85,  C:90,  D:92  } },
  { id: "built_med",   code: "7b", label: "Built Area – Permukiman Sedang (30–65%)", icon: "🏘️", cn: { A:61,  B:75,  C:83,  D:87  } },
  { id: "built_sparse",code: "7c", label: "Built Area – Permukiman Jarang (<30%)", icon: "🏡", cn: { A:54,  B:70,  C:80,  D:85  } },
  { id: "bare",        code: 8,  label: "Bare Ground / Lahan Terbuka",icon: "🟫", cn: { A:68,  B:79,  C:86,  D:89  } },
  { id: "rangeland_s", code: "11a", label: "Rangeland – Semak/Belukar",icon: "🌿", cn: { A:48,  B:67,  C:77,  D:83  } },
  { id: "rangeland_g", code: "11b", label: "Rangeland – Padang Rumput",icon: "🌱", cn: { A:30,  B:58,  C:71,  D:78  } },
  { id: "garden",      code: "mix", label: "Kebun Campuran",          icon: "🌴", cn: { A:43,  B:65,  C:76,  D:82  } },
];

// ── FAO Soil Units → HSG Mapping ─────────────────────────────────────────────
const FAO_SOILS = [
  // HSG A
  { id:"AR", label:"Arenosols (AR) – Pasir dalam",        hsg:"A", note:"Infiltrasi sangat tinggi" },
  { id:"LP_s",label:"Leptosols dangkal (LP) – Litosol",   hsg:"A", note:"Tanah tipis di atas batuan" },
  { id:"RG", label:"Regosols (RG) – Aluvial kasar",       hsg:"A", note:"Pasir/kerikil lepas" },
  // HSG B
  { id:"CM", label:"Cambisols (CM) – Kambisol",           hsg:"B", note:"Tanah berkembang sedang" },
  { id:"LV", label:"Luvisols (LV) – Luvisol",             hsg:"B", note:"Lempung dengan horizon argilik" },
  { id:"NT", label:"Nitisols (NT) – Nitisol",             hsg:"B", note:"Lempung liat aktif, >NIR" },
  { id:"PH", label:"Phaeozems (PH) – Faeozem",            hsg:"B", note:"Subur, lempung gelap" },
  { id:"KS", label:"Kastanozems (KS) – Kastanozem",       hsg:"B", note:"Padang rumput kering" },
  { id:"AN", label:"Andosols (AN) – Andosol",             hsg:"B", note:"Abu vulkanik, porositas tinggi" },
  // HSG C
  { id:"AC", label:"Acrisols (AC) – Akrisol / Podsolik",  hsg:"C", note:"Lempung liat, kesuburan rendah" },
  { id:"AL", label:"Alisols (AL) – Alisol",               hsg:"C", note:"Kandungan Al tinggi" },
  { id:"FR", label:"Ferralsols (FR) – Feralitik/Latosol", hsg:"C", note:"Oksisol tropis, permeabilitas rendah" },
  { id:"LX", label:"Lixisols (LX) – Lixisol",             hsg:"C", note:"Horizon argilik, aktivitas rendah" },
  { id:"PT", label:"Plinthosols (PT) – Plintosol",        hsg:"C", note:"Lapisan besi keras" },
  // HSG D
  { id:"VR", label:"Vertisols (VR) – Vertisol/Grumosol",  hsg:"D", note:"Liat ekspansif, retak saat kering" },
  { id:"GL", label:"Gleysols (GL) – Gleisol",             hsg:"D", note:"Tergenang/drainase buruk" },
  { id:"HS", label:"Histosols (HS) – Gambut",             hsg:"D", note:"Organik jenuh air" },
  { id:"PL", label:"Planosols (PL) – Planosol",           hsg:"D", note:"Lapisan kedap di bawah permukaan" },
  { id:"SN", label:"Solonetz (SN) – Solonetz",            hsg:"D", note:"Na tinggi, struktur columnar" },
];

const HSG_COLOR = { A:"#22d3ee", B:"#4ade80", C:"#fbbf24", D:"#f87171" };
const HSG_BG    = { A:"rgba(34,211,238,0.12)", B:"rgba(74,222,128,0.12)", C:"rgba(251,191,36,0.12)", D:"rgba(248,113,113,0.12)" };

const newRow = () => ({ id: Date.now() + Math.random(), esri: "", soil: "", area: "" });
const newSubDAS = (n) => ({ id: Date.now(), name: `SB_${n}`, rows: [newRow()] });

export default function CNCalculator() {
  const [subDASList, setSubDASList] = useState([newSubDAS(1)]);
  const [activeTab, setActiveTab] = useState(0);
  const [showRef, setShowRef] = useState(false);

  const active = subDASList[activeTab];

  const updateSubDAS = useCallback((idx, fn) => {
    setSubDASList(prev => prev.map((s, i) => i === idx ? fn(s) : s));
  }, []);

  const addRow = () => updateSubDAS(activeTab, s => ({ ...s, rows: [...s.rows, newRow()] }));

  const removeRow = (rid) => updateSubDAS(activeTab, s => ({
    ...s, rows: s.rows.length > 1 ? s.rows.filter(r => r.id !== rid) : s.rows
  }));

  const updateRow = (rid, field, value) => updateSubDAS(activeTab, s => ({
    ...s, rows: s.rows.map(r => r.id === rid ? { ...r, [field]: value } : r)
  }));

  const addSubDAS = () => {
    const n = subDASList.length + 1;
    setSubDASList(prev => [...prev, newSubDAS(n)]);
    setActiveTab(subDASList.length);
  };

  const removeSubDAS = (idx) => {
    if (subDASList.length === 1) return;
    setSubDASList(prev => prev.filter((_, i) => i !== idx));
    setActiveTab(Math.max(0, activeTab - (idx <= activeTab ? 1 : 0)));
  };

  const renameSubDAS = (idx, name) => {
    setSubDASList(prev => prev.map((s, i) => i === idx ? { ...s, name } : s));
  };

  // ── CN Composite calculation ─────────────────────────────────────────────
  const calcCN = (rows) => {
    let sumCNxA = 0, sumA = 0;
    const detail = rows.map(r => {
      const esri = ESRI_CLASSES.find(e => e.id === r.esri);
      const soil = FAO_SOILS.find(s => s.id === r.soil);
      const area = parseFloat(r.area) || 0;
      if (!esri || !soil || area <= 0) return { ...r, cn: null, area: 0, hsg: null };
      const cn = esri.cn[soil.hsg];
      sumCNxA += cn * area;
      sumA += area;
      return { ...r, cn, area, hsg: soil.hsg, esriLabel: esri.label, soilLabel: soil.label };
    });
    return {
      detail,
      totalArea: sumA,
      cnComposite: sumA > 0 ? (sumCNxA / sumA) : null,
      S: sumA > 0 ? (25400 / (sumCNxA / sumA) - 254) : null,
      Ia: sumA > 0 ? 0.2 * (25400 / (sumCNxA / sumA) - 254) : null,
    };
  };

  const result = calcCN(active.rows);

  // ── All sub-DAS summary ──────────────────────────────────────────────────
  const allResults = subDASList.map(s => ({ ...s, ...calcCN(s.rows) }));

  const cnClass = (cn) => {
    if (!cn) return "#94a3b8";
    if (cn < 60) return "#22d3ee";
    if (cn < 75) return "#4ade80";
    if (cn < 85) return "#fbbf24";
    return "#f87171";
  };

  const cnBar = (cn) => {
    if (!cn) return 0;
    return Math.min(100, Math.max(0, cn));
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0", padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid rgba(99,179,237,0.2)",
        padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:8,
              background:"linear-gradient(135deg,#3b82f6,#06b6d4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18,
            }}>🌊</div>
            <div>
              <div style={{ fontSize:18, fontWeight:700, letterSpacing:"0.05em", color:"#f0f9ff" }}>
                CN COMPOSITE CALCULATOR
              </div>
              <div style={{ fontSize:10, color:"#64748b", letterSpacing:"0.15em" }}>
                ESRI LAND COVER × FAO SOIL (HSG) — HEC-HMS PARAMETER
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setShowRef(!showRef)} style={{
          background: showRef ? "rgba(99,179,237,0.2)" : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(99,179,237,0.3)", borderRadius:6,
          color:"#93c5fd", padding:"6px 14px", cursor:"pointer", fontSize:11,
          letterSpacing:"0.1em",
        }}>
          {showRef ? "✕ TUTUP" : "📋 TABEL REFERENSI"}
        </button>
      </div>

      {/* Reference Table */}
      {showRef && (
        <div style={{
          background:"#0f172a", borderBottom:"1px solid rgba(99,179,237,0.15)",
          padding:"24px 32px",
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {/* ESRI CN Table */}
            <div>
              <div style={{ fontSize:11, color:"#64748b", letterSpacing:"0.15em", marginBottom:12 }}>
                ESRI LAND COVER → CN PER HSG
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(99,179,237,0.2)" }}>
                      {["Kelas ESRI","A","B","C","D"].map(h => (
                        <th key={h} style={{ padding:"6px 10px", textAlign: h==="Kelas ESRI"?"left":"center",
                          color: h==="A"?HSG_COLOR.A: h==="B"?HSG_COLOR.B: h==="C"?HSG_COLOR.C: h==="D"?HSG_COLOR.D:"#94a3b8",
                          fontWeight:600, letterSpacing:"0.1em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ESRI_CLASSES.map((e,i) => (
                      <tr key={e.id} style={{ background: i%2===0?"rgba(255,255,255,0.02)":"transparent" }}>
                        <td style={{ padding:"5px 10px", color:"#cbd5e1" }}>{e.icon} {e.label}</td>
                        {["A","B","C","D"].map(h => (
                          <td key={h} style={{ padding:"5px 10px", textAlign:"center",
                            color: cnClass(e.cn[h]), fontWeight:600 }}>{e.cn[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* FAO HSG Table */}
            <div>
              <div style={{ fontSize:11, color:"#64748b", letterSpacing:"0.15em", marginBottom:12 }}>
                FAO SOIL UNITS → HYDROLOGIC SOIL GROUP (HSG)
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(99,179,237,0.2)" }}>
                      {["Jenis Tanah FAO","HSG","Karakteristik"].map(h => (
                        <th key={h} style={{ padding:"6px 10px", textAlign:"left", color:"#94a3b8",
                          fontWeight:600, letterSpacing:"0.1em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FAO_SOILS.map((s,i) => (
                      <tr key={s.id} style={{ background: i%2===0?"rgba(255,255,255,0.02)":"transparent" }}>
                        <td style={{ padding:"5px 10px", color:"#cbd5e1" }}>{s.label}</td>
                        <td style={{ padding:"5px 10px" }}>
                          <span style={{
                            background: HSG_BG[s.hsg], color: HSG_COLOR[s.hsg],
                            border:`1px solid ${HSG_COLOR[s.hsg]}40`,
                            borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700,
                          }}>HSG {s.hsg}</span>
                        </td>
                        <td style={{ padding:"5px 10px", color:"#64748b", fontSize:10 }}>{s.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"24px 32px" }}>
        {/* Sub-DAS Tabs */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {subDASList.map((s, idx) => {
            const r = allResults[idx];
            const isActive = idx === activeTab;
            return (
              <div key={s.id} onClick={() => setActiveTab(idx)} style={{
                display:"flex", alignItems:"center", gap:8,
                background: isActive ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius:8, padding:"8px 14px", cursor:"pointer",
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:11, color: isActive?"#93c5fd":"#64748b", letterSpacing:"0.08em" }}>
                  {s.name}
                </span>
                {r.cnComposite && (
                  <span style={{
                    fontSize:11, fontWeight:700, color: cnClass(r.cnComposite),
                  }}>{r.cnComposite.toFixed(1)}</span>
                )}
                {subDASList.length > 1 && (
                  <span onClick={e => { e.stopPropagation(); removeSubDAS(idx); }} style={{
                    color:"#475569", fontSize:12, cursor:"pointer", marginLeft:2,
                  }}>✕</span>
                )}
              </div>
            );
          })}
          <button onClick={addSubDAS} style={{
            background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(99,179,237,0.3)",
            borderRadius:8, padding:"8px 14px", cursor:"pointer", color:"#64748b",
            fontSize:11, letterSpacing:"0.08em",
          }}>+ SUB-DAS</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24, alignItems:"start" }}>
          {/* Left — Input Table */}
          <div>
            {/* Sub-DAS Name */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <input
                value={active.name}
                onChange={e => renameSubDAS(activeTab, e.target.value)}
                style={{
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(99,179,237,0.2)",
                  borderRadius:6, padding:"8px 14px", color:"#f0f9ff", fontSize:13,
                  fontFamily:"inherit", outline:"none", letterSpacing:"0.05em",
                  fontWeight:600, width:160,
                }}
              />
              <span style={{ fontSize:11, color:"#475569" }}>
                {active.rows.filter(r => r.esri && r.soil && parseFloat(r.area)>0).length} baris valid
                {" · "}
                {result.totalArea.toFixed(1)} ha total
              </span>
            </div>

            {/* Column Headers */}
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 1fr 120px 80px 40px",
              gap:8, marginBottom:8, padding:"0 4px",
            }}>
              {["KELAS TUTUPAN LAHAN (ESRI)", "JENIS TANAH FAO", "LUAS (ha)", "CN", ""].map(h => (
                <div key={h} style={{ fontSize:10, color:"#475569", letterSpacing:"0.12em" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {active.rows.map((row) => {
                const esri = ESRI_CLASSES.find(e => e.id === row.esri);
                const soil = FAO_SOILS.find(s => s.id === row.soil);
                const cn = (esri && soil) ? esri.cn[soil.hsg] : null;
                const valid = esri && soil && parseFloat(row.area) > 0;

                return (
                  <div key={row.id} style={{
                    display:"grid", gridTemplateColumns:"1fr 1fr 120px 80px 40px",
                    gap:8, alignItems:"center",
                    background: valid ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                    border: valid ? "1px solid rgba(99,179,237,0.1)" : "1px solid rgba(255,255,255,0.04)",
                    borderRadius:8, padding:"10px 12px",
                    transition:"all 0.15s",
                  }}>
                    {/* ESRI Select */}
                    <select
                      value={row.esri}
                      onChange={e => updateRow(row.id, "esri", e.target.value)}
                      style={{
                        background:"#0f172a", border:"1px solid rgba(99,179,237,0.2)",
                        borderRadius:6, padding:"6px 10px", color: row.esri?"#e2e8f0":"#475569",
                        fontSize:11, fontFamily:"inherit", outline:"none", cursor:"pointer",
                      }}
                    >
                      <option value="">Pilih kelas ESRI...</option>
                      {ESRI_CLASSES.map(e => (
                        <option key={e.id} value={e.id}>{e.icon} {e.label}</option>
                      ))}
                    </select>

                    {/* FAO Soil Select */}
                    <select
                      value={row.soil}
                      onChange={e => updateRow(row.id, "soil", e.target.value)}
                      style={{
                        background:"#0f172a", border:"1px solid rgba(99,179,237,0.2)",
                        borderRadius:6, padding:"6px 10px", color: row.soil?"#e2e8f0":"#475569",
                        fontSize:11, fontFamily:"inherit", outline:"none", cursor:"pointer",
                      }}
                    >
                      <option value="">Pilih tanah FAO...</option>
                      {["A","B","C","D"].map(hsg => (
                        <optgroup key={hsg} label={`HSG ${hsg}`}>
                          {FAO_SOILS.filter(s => s.hsg === hsg).map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {/* Area Input */}
                    <input
                      type="number" min="0" step="0.1"
                      placeholder="0.0"
                      value={row.area}
                      onChange={e => updateRow(row.id, "area", e.target.value)}
                      style={{
                        background:"#0f172a", border:"1px solid rgba(99,179,237,0.2)",
                        borderRadius:6, padding:"6px 10px", color:"#e2e8f0",
                        fontSize:12, fontFamily:"inherit", outline:"none",
                        textAlign:"right",
                      }}
                    />

                    {/* CN Result */}
                    <div style={{
                      textAlign:"center", fontSize:14, fontWeight:700,
                      color: cn ? cnClass(cn) : "#334155",
                      background: cn ? HSG_BG[soil?.hsg] : "transparent",
                      borderRadius:6, padding:"4px",
                    }}>
                      {cn ?? "—"}
                      {soil && (
                        <div style={{ fontSize:9, color: HSG_COLOR[soil.hsg], letterSpacing:"0.1em" }}>
                          HSG {soil.hsg}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button onClick={() => removeRow(row.id)} style={{
                      background:"none", border:"none", cursor:"pointer",
                      color:"#334155", fontSize:16, padding:0,
                      transition:"color 0.15s",
                    }} title="Hapus baris">✕</button>
                  </div>
                );
              })}
            </div>

            <button onClick={addRow} style={{
              marginTop:12, background:"rgba(59,130,246,0.1)",
              border:"1px dashed rgba(59,130,246,0.3)", borderRadius:8,
              padding:"10px", width:"100%", cursor:"pointer",
              color:"#3b82f6", fontSize:11, letterSpacing:"0.1em",
              fontFamily:"inherit",
            }}>+ TAMBAH BARIS</button>
          </div>

          {/* Right — Result Panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* CN Composite Result */}
            <div style={{
              background:"linear-gradient(135deg,#0f172a,#1e293b)",
              border:"1px solid rgba(99,179,237,0.2)", borderRadius:12,
              padding:24, textAlign:"center",
            }}>
              <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.2em", marginBottom:8 }}>
                CN KOMPOSIT — {active.name}
              </div>
              <div style={{
                fontSize:56, fontWeight:900, lineHeight:1,
                color: result.cnComposite ? cnClass(result.cnComposite) : "#334155",
                textShadow: result.cnComposite ? `0 0 40px ${cnClass(result.cnComposite)}60` : "none",
              }}>
                {result.cnComposite ? result.cnComposite.toFixed(1) : "—"}
              </div>

              {/* CN Bar */}
              <div style={{
                margin:"16px 0 8px", height:8, background:"rgba(255,255,255,0.06)",
                borderRadius:4, overflow:"hidden",
              }}>
                <div style={{
                  height:"100%", width:`${cnBar(result.cnComposite)}%`,
                  background: result.cnComposite
                    ? `linear-gradient(90deg, #22d3ee, ${cnClass(result.cnComposite)})`
                    : "#334155",
                  borderRadius:4, transition:"width 0.4s ease",
                }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#334155" }}>
                <span>0</span><span>50</span><span>100</span>
              </div>

              {/* CN Classification */}
              {result.cnComposite && (
                <div style={{
                  marginTop:12, padding:"6px 12px", borderRadius:6,
                  background: result.cnComposite < 60 ? "rgba(34,211,238,0.1)" :
                               result.cnComposite < 75 ? "rgba(74,222,128,0.1)" :
                               result.cnComposite < 85 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)",
                  color: cnClass(result.cnComposite), fontSize:11, letterSpacing:"0.08em",
                }}>
                  {result.cnComposite < 60 ? "🟢 LIMPASAN RENDAH" :
                   result.cnComposite < 75 ? "🟡 LIMPASAN SEDANG" :
                   result.cnComposite < 85 ? "🟠 LIMPASAN TINGGI" : "🔴 LIMPASAN SANGAT TINGGI"}
                </div>
              )}
            </div>

            {/* Derived Parameters */}
            {result.cnComposite && (
              <div style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:12, padding:20,
              }}>
                <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.15em", marginBottom:14 }}>
                  PARAMETER TURUNAN
                </div>
                {[
                  { label:"S (Potensi Retensi)", value: result.S?.toFixed(1), unit:"mm",
                    desc:"S = 25400/CN − 254" },
                  { label:"Ia (Initial Abstraction)", value: result.Ia?.toFixed(1), unit:"mm",
                    desc:"Ia = 0.2 × S" },
                  { label:"Total Luas Sub-DAS", value: result.totalArea.toFixed(2), unit:"ha",
                    desc:"∑ Ai" },
                ].map(p => (
                  <div key={p.label} style={{
                    marginBottom:12, paddingBottom:12,
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>{p.label}</span>
                      <span style={{ fontSize:16, fontWeight:700, color:"#f0f9ff" }}>
                        {p.value} <span style={{ fontSize:10, color:"#64748b" }}>{p.unit}</span>
                      </span>
                    </div>
                    <div style={{ fontSize:9, color:"#334155", marginTop:2 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Area Breakdown */}
            {result.totalArea > 0 && (
              <div style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:12, padding:20,
              }}>
                <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.15em", marginBottom:14 }}>
                  PROPORSI TUTUPAN LAHAN
                </div>
                {result.detail.filter(r => r.area > 0 && r.cn).map((r) => (
                  <div key={r.id} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
                      <span style={{ color:"#94a3b8" }}>
                        {ESRI_CLASSES.find(e=>e.id===r.esri)?.icon}{" "}
                        {r.esri.replace(/_/g," ").toUpperCase().slice(0,20)}
                      </span>
                      <span style={{ color:"#64748b" }}>{((r.area/result.totalArea)*100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                      <div style={{
                        height:"100%", borderRadius:2, transition:"width 0.4s",
                        width:`${(r.area/result.totalArea)*100}%`,
                        background: HSG_COLOR[r.hsg],
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Sub-DAS Summary */}
        {subDASList.length > 1 && (
          <div style={{
            marginTop:32, background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(99,179,237,0.1)", borderRadius:12, overflow:"hidden",
          }}>
            <div style={{
              padding:"14px 20px", borderBottom:"1px solid rgba(99,179,237,0.1)",
              fontSize:10, color:"#475569", letterSpacing:"0.15em",
            }}>
              RINGKASAN SEMUA SUB-DAS
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Sub-DAS","Luas (ha)","CN Komposit","S (mm)","Ia (mm)","Status"].map(h => (
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left",
                      fontSize:10, color:"#475569", letterSpacing:"0.1em", fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allResults.map((s, i) => (
                  <tr key={s.id} onClick={() => setActiveTab(i)} style={{
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background: i===activeTab ? "rgba(59,130,246,0.08)" : i%2===0?"rgba(255,255,255,0.01)":"transparent",
                    cursor:"pointer", transition:"background 0.15s",
                  }}>
                    <td style={{ padding:"10px 16px", color:"#93c5fd", fontWeight:600, fontSize:12 }}>{s.name}</td>
                    <td style={{ padding:"10px 16px", fontSize:12 }}>{s.totalArea.toFixed(2)}</td>
                    <td style={{ padding:"10px 16px" }}>
                      {s.cnComposite ? (
                        <span style={{ fontSize:16, fontWeight:700, color:cnClass(s.cnComposite) }}>
                          {s.cnComposite.toFixed(1)}
                        </span>
                      ) : <span style={{ color:"#334155" }}>—</span>}
                    </td>
                    <td style={{ padding:"10px 16px", fontSize:12, color:"#94a3b8" }}>
                      {s.S ? s.S.toFixed(1) : "—"}
                    </td>
                    <td style={{ padding:"10px 16px", fontSize:12, color:"#94a3b8" }}>
                      {s.Ia ? s.Ia.toFixed(1) : "—"}
                    </td>
                    <td style={{ padding:"10px 16px" }}>
                      {s.cnComposite ? (
                        <span style={{
                          fontSize:10, padding:"3px 8px", borderRadius:4,
                          background: HSG_BG[s.cnComposite<60?"A":s.cnComposite<75?"B":s.cnComposite<85?"C":"D"],
                          color: cnClass(s.cnComposite), letterSpacing:"0.08em",
                        }}>
                          {s.cnComposite < 60 ? "RENDAH" : s.cnComposite < 75 ? "SEDANG" :
                           s.cnComposite < 85 ? "TINGGI" : "SANGAT TINGGI"}
                        </span>
                      ) : <span style={{ color:"#334155", fontSize:10 }}>BELUM LENGKAP</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formula Footer */}
        <div style={{
          marginTop:24, padding:"16px 20px",
          background:"rgba(255,255,255,0.01)", border:"1px solid rgba(255,255,255,0.04)",
          borderRadius:8, fontSize:10, color:"#334155", letterSpacing:"0.05em",
          display:"flex", gap:32, flexWrap:"wrap",
        }}>
          <span>CN komposit = Σ(CNᵢ × Aᵢ) / ΣAᵢ</span>
          <span>S = 25400/CN − 254 (mm)</span>
          <span>Ia = 0.2 × S (mm)</span>
          <span>Referensi: USDA TR-55 / NEH-4</span>
        </div>
      </div>
    </div>
  );
}
