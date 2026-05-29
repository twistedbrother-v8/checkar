import React, { useState } from "react";
import { TYPE_ICONS, TYPE_LABELS } from "../config/data";
import { getProgress } from "../utils/helpers";
import { C, card, btn, input, VehicleChip } from "./shared";

export function AccueilScreen({ vehicles, setVehicles, active, setActive, setTab, name, setName, immat, setImmat, type, setType, addVehicle, deleteVehicle, leaveSharedVehicle, docs, prog, t = {}, isPremium = true, maxVehicles = Infinity, onShowPremium }) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImmat, setEditImmat] = useState("");
  const [editType, setEditType] = useState("voiture");
  const [editKm, setEditKm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => {
    setEditName(active.name);
    setEditImmat(active.immat || "");
    setEditType(active.type);
    setEditKm(active.km || "");
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setVehicles(prev => {
      const updated = prev.map(v => v.id === active.id ? { ...v, name: editName.trim(), immat: editImmat.trim().toUpperCase(), type: editType, km: editKm } : v);
      setActive(updated.find(v => v.id === active.id));
      return updated;
    });
    setEditMode(false);
  };

  if (!active) {
    return (
      <div style={{ padding: "20px 16px" }}>
        {vehicles.length === 0 && (
          <div style={{ background: "linear-gradient(135deg, #1a2a4a, #2157FF22)", border: `1px solid ${C.blue}33`, borderRadius: 18, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚗</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>{t.bienvenue || "Bienvenue sur CHECKAR ! 🚗"}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{t.bienvenueMsg || "Commencez par ajouter votre véhicule pour suivre son entretien."}</div>
          </div>
        )}
        <div style={{ background: C.surface, borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <p style={{ color: C.muted2, marginBottom: 16, marginTop: 0, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{t.ajouterVehicule || '+ AJOUTER UN VÉHICULE'}</p>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 700 }}>TYPE</div>
          <select value={type} onChange={e => setType(e.target.value)} style={input}>
            <option value="voiture">🚘 {t.voiture || "Voiture"}</option>
            <option value="moto">🏍️ {t.moto || "Moto"}</option>
          </select>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 700 }}>NOM</div>
          <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Peugeot 208..." />
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 700 }}>IMMATRICULATION</div>
          <input style={{ ...input, textTransform: "uppercase", letterSpacing: 2 }} value={immat} onChange={e => setImmat(e.target.value)} placeholder="AB-123-CD" />
          <button style={btn()} onClick={addVehicle}>+ {t.ajouterVehiculeBtn || "Ajouter le véhicule"}</button>
        </div>
        {vehicles.map(v => {
          const p = getProgress(v);
          return (
            <div key={v.id} onClick={() => setActive(v)} style={{ background: C.surface, borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 36 }}>{TYPE_ICONS[v.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{v.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{TYPE_LABELS[v.type]}{v.immat ? ` · ${v.immat}` : ""}</div>
                <div style={{ fontSize: 12, color: p.problems > 0 ? C.red : C.green, marginTop: 4, fontWeight: 600 }}>
                  {p.ok} OK{p.problems > 0 ? ` · ${p.problems} problème(s)` : " ·  Tout roule !"}
                </div>
              </div>
              <span style={{ color: C.muted, fontSize: 20 }}>›</span>
            </div>
          );
        })}
      </div>
    );
  }

  const vals       = Object.values(active.checks || {});
  const hasOk      = vals.includes("OK");
  const hasBientot = vals.includes("BIENTOT");
  const hasProb    = vals.includes("PROBLEME");
  const lastEntry  = active.history?.[active.history.length - 1];
  const alertDocs  = docs.filter(d => !active || d.vehicleId === active?.id);
  const kmTotal    = active.km ? parseInt(active.km).toLocaleString() : null;

  const score = prog.total === 0 ? 0 : Math.round((prog.ok / prog.total) * 100);
  const scoreColor = score >= 75 ? C.green : score >= 40 ? C.yellow : C.red;
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dashArr = circ * 0.75;
  const dashOffset = dashArr - (dashArr * score / 100);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 16px 0" }}>
        {vehicles.map(v => <VehicleChip key={v.id} v={v} active={active} setActive={setActive} />)}
        <button onClick={() => vehicles.length >= maxVehicles ? onShowPremium?.() : setActive(null)} style={{ flexShrink: 0, borderRadius: 20, padding: "7px 14px", fontSize: 12, cursor: "pointer", border: `1px solid ${vehicles.length >= maxVehicles ? C.purple + "88" : C.border}`, background: "transparent", color: vehicles.length >= maxVehicles ? C.purple : C.blue, fontWeight: 600 }}>
          {vehicles.length >= maxVehicles ? `🔒 ${t.nouveau?.replace("+ ", "") || "Nouveau"}` : (t.nouveau || "+ Nouveau")}
        </button>
      </div>

      <div style={{ margin: "12px 16px 0", borderRadius: 20, overflow: "hidden", height: 180, position: "relative", background: "#111" }}>
        {active.photo ? (
          <img src={active.photo} alt={active.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #1a1a2e, #000)", fontSize: 80 }}>{TYPE_ICONS[active.type]}</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent, #000)" }} />
        <label style={{ position: "absolute", bottom: 10, right: 10, zIndex: 2, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 8px", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          📷 {active.photo ? "Changer" : "Photo"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const file = e.target.files[0]; if (!file) return;
            const vehicleId = active.id;
            const reader = new FileReader();
            reader.onload = ev => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX = 800; let w = img.width, h = img.height;
                if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; } else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                const photo = canvas.toDataURL("image/jpeg", 0.7);
                try { localStorage.setItem("photo_" + vehicleId, photo); } catch {}
                const updated = vehicles.map(v => v.id === vehicleId ? { ...v, photo } : v);
                setVehicles(updated); setActive(updated.find(v => v.id === vehicleId));
              };
              img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          }} />
        </label>
        {active.photo && (
          <button onClick={e => {
            e.preventDefault(); e.stopPropagation();
            const vehicleId = active.id;
            const updated = vehicles.map(v => v.id === vehicleId ? { ...v, photo: null, photoUrl: null } : v);
            setVehicles(updated); setActive(updated.find(v => v.id === vehicleId));
            localStorage.removeItem("photo_" + vehicleId);
          }} style={{ position: "absolute", top: 8, right: 8, zIndex: 10, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 6, padding: "2px 6px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>✕</button>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 14, zIndex: 2 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{active.name}</div>
          {active.immat && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{active.immat}</div>}
        </div>
        <button onClick={() => active.isShared ? leaveSharedVehicle?.(active.id, active.ownerId) : setConfirmDelete(true)} style={{ position: "absolute", top: 10, left: 14, zIndex: 10, background: active?.isShared ? "rgba(255,161,0,0.15)" : "rgba(252,63,53,0.15)", border: `1px solid ${active?.isShared ? "rgba(255,161,0,0.3)" : "rgba(252,63,53,0.3)"}`, borderRadius: 8, padding: "4px 10px", color: active?.isShared ? C.yellow : C.red, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{active?.isShared ? "🚪 Quitter" : "🗑️"}</button>
        {!active.isShared && (
          <button onClick={startEdit} style={{ position: "absolute", top: 10, left: 60, zIndex: 10, background: "rgba(33,87,255,0.15)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 8, padding: "4px 10px", color: C.blue, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✏️</button>
        )}
      </div>

      {confirmDelete && (
        <div style={{ margin: "10px 16px 0", background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.red, marginBottom: 8 }}>🗑️ Supprimer {active.name} ?</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Cette action supprimera le véhicule et toutes ses données. Elle est irréversible.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: C.surface, border: "none", borderRadius: 12, padding: 12, color: C.muted, cursor: "pointer", fontWeight: 700 }}>Annuler</button>
            <button onClick={() => { deleteVehicle(active.id); setConfirmDelete(false); setEditMode(false); setEditKm(""); }} style={{ flex: 1, background: C.red, border: "none", borderRadius: 12, padding: 12, color: "white", cursor: "pointer", fontWeight: 700 }}>🗑️ Supprimer</button>
          </div>
        </div>
      )}
      {editMode && (
        <div style={{ margin: "10px 16px 0", background: C.surface, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 12 }}>✏️ Modifier le véhicule</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>TYPE</div>
          <select value={editType} onChange={e => setEditType(e.target.value)} style={input}>
            <option value="voiture">🚘 {t.voiture || "Voiture"}</option>
            <option value="moto">🏍️ {t.moto || "Moto"}</option>
          </select>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>NOM</div>
          <input style={input} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ex: Peugeot 208..." />
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>IMMATRICULATION</div>
          <input style={{ ...input, textTransform: "uppercase", letterSpacing: 2 }} value={editImmat} onChange={e => setEditImmat(e.target.value)} placeholder="AB-123-CD" />
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.kmActuel || "KILOMÉTRAGE ACTUEL"}</div>
          <input type="number" style={input} value={editKm} onChange={e => setEditKm(e.target.value)} placeholder="Ex: 85000" />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditMode(false)} style={{ flex: 1, background: C.surface, border: "none", borderRadius: 12, padding: 12, color: C.muted, cursor: "pointer", fontWeight: 700 }}>Annuler</button>
            <button onClick={saveEdit} style={{ flex: 2, background: C.blue, border: "none", borderRadius: 12, padding: 12, color: "white", cursor: "pointer", fontWeight: 700 }}>✅ Enregistrer</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div style={{ position: "relative", width: 140, height: 100 }}>
          <svg width="140" height="100" viewBox="0 0 140 100">
            <path d={`M ${cx - r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)}`} fill="none" stroke="#2a2a2f" strokeWidth="10" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dashArr} ${circ}`} strokeDashoffset={dashOffset}
              transform={`rotate(135, ${cx}, ${cy})`}
              style={{ filter: `drop-shadow(0 0 8px ${scoreColor}88)`, transition: "stroke-dashoffset 0.8s ease" }} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill={C.muted} fontWeight="700" letterSpacing="1">SCORE</text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="28" fill={scoreColor} fontWeight="900">{score}</text>
          </svg>
        </div>
      </div>

      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: C.surface, borderRadius: 18, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{t.derniereVerif || 'DERNIÈRE VÉRIF'}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.blue, marginTop: 3 }}>{lastEntry?.date || "—"}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: hasProb ? C.red : hasBientot ? C.yellow : C.green, marginTop: 4 }}>
              {hasProb ? (t.unSouci || "⚠️ Y'a un souci !") : hasBientot ? (t.aSurveiller || "⏳ À surveiller") : (t.toutRoule || "✅ Tout roule !")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{prog.ok}</div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{t.ok || "OK"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.yellow }}>{vals.filter(v => v === "BIENTOT").length}</div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{t.bientot || "BIENTÔT"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: prog.problems > 0 ? C.red : C.muted }}>{prog.problems}</div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{t.probleme || "PROBLÈME"}</div>
            </div>
          </div>
        </div>

        {alertDocs.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, padding: "8px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{t.rappels || "RAPPELS"}</div>
              <span style={{ background: alertDocs.some(d => d.days <= 15) ? C.red : C.yellow, color: "black", borderRadius: 20, padding: "1px 7px", fontSize: 9, fontWeight: 800 }}>{alertDocs.length}</span>
            </div>
            {alertDocs.map(d => {
              const col = d.days <= 0 ? C.red : d.days <= 15 ? C.red : d.days <= 30 ? C.yellow : C.green;
              const labelTrad = d.type === "assurance" ? (t.assurance?.replace("🛡️ ", "") || d.label) : d.type === "controle" ? (t.controleTechnique?.replace("🚗 ", "") || d.label) : d.type === "revision" ? (t.revision || d.label) : d.label;
              return (
                <div key={d.id} onClick={() => setTab("documents")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: col + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{d.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{labelTrad}</div>
                      <div style={{ fontSize: 10, color: col, fontWeight: 600 }}>
                        {d.type === "revision" && d.km
                          ? (() => {
                              const kmActuel = parseInt(active?.km) || 0;
                              const kmRevision = parseInt(d.km) || 0;
                              const diff = kmRevision - kmActuel;
                              if (diff <= 0) return t.revisionDue || "Révision due !";
                              const loc = t.dans === "In" ? "en-GB" : "fr-FR";
                              return `${t.dans || "Dans"} ${diff.toLocaleString(loc)} km`;
                            })()
                          : d.days <= 0 ? (t.expire || "Expiré 🔴") : `${t.dans || "Dans"} ${d.days} ${t.jours || "jours"}`
                        }
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>{d.date} ›</div>
                </div>
              );
            })}
          </div>
        )}

        {kmTotal && (
          <div style={{ background: C.surface, borderRadius: 18, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{t.kmActuel || "KM TOTAL VÉHICULE"}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{kmTotal} <span style={{ fontSize: 12, color: C.muted }}>km</span></div>
          </div>
        )}

        <button style={{ background: C.blue, color: "white", border: "none", borderRadius: 18, padding: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: 0.5, boxShadow: `0 4px 20px ${C.blue}55` }} onClick={() => setTab("checklist")}>
          🚗 {t.onFaitLeTour || 'On fait le tour ?'}
        </button>

        <button onClick={() => setTab("secours")} style={{
          background: "linear-gradient(135deg, #cc0000, #ff1a1a)",
          color: "white", border: "none", borderRadius: 18,
          padding: "32px 16px", fontSize: 17, fontWeight: 900,
          cursor: "pointer", letterSpacing: 0.5,
          boxShadow: "0 4px 24px rgba(255,0,0,0.4)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          width: "100%",
        }}>
          <span style={{ fontSize: 32 }}>🆘</span>
          {t.boutonSecours || 'BOUTON DE SECOURS'}
          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>Accident · Assistance · Constat · Services proches</span>
        </button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
