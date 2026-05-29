import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, auth } from "../config/firebase";
import { saveFacturePhoto, loadFacturePhotos, deleteFacturePhotoById, clearAllFacturePhotos } from "../config/firestore";
import { C, card, btn, input, VehicleChip } from "./shared";

function PremiumHistorique({ active, depenses = [], isPremium = true, isUltra = true, onShowPremium, t = {} }) {
  if (!active) return null;

  const uk = t.unitKm || "km";
  const isEn = uk === "Miles";
  const nomsMois = isEn
    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    : ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

  const myDep = depenses.filter(d => d.vehicleId === active.id);
  const now = new Date();
  const moisActuel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const cutoffDate = (months) => {
    const d = new Date(now); d.setMonth(d.getMonth() - months + 1); d.setDate(1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const shortMonth = (m) => nomsMois[parseInt(m.split("-")[1]) - 1];

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // ── Ce mois-ci ──
  const depMois = myDep.filter(d => d.date?.startsWith(moisActuel));
  const totalMois = depMois.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
  const carbMois = depMois.filter(d => d.type === "carburant" && d.km).sort((a, b) => a.km - b.km);
  const kmMois = carbMois.length >= 2 ? carbMois[carbMois.length - 1].km - carbMois[0].km : 0;
  const litresMois = depMois.filter(d => d.type === "carburant" && d.litres).reduce((s, d) => s + (parseFloat(d.litres) || 0), 0);
  const consoMois = kmMois > 0 && litresMois > 0 ? ((litresMois / kmMois) * 100).toFixed(1) : null;
  const coutKmMois = kmMois > 0 ? (depMois.filter(d => d.type === "carburant").reduce((s, d) => s + (parseFloat(d.montant) || 0), 0) / kmMois).toFixed(2) : null;

  // ── Période ──
  const periodLabel = isUltra ? (isEn ? "LAST 12 MONTHS" : "12 DERNIERS MOIS") : (isEn ? "LAST 3 MONTHS" : "3 DERNIERS MOIS");
  const depPeriod = isPremium
    ? (isUltra ? myDep : myDep.filter(d => d.date && d.date.substring(0, 7) >= cutoffDate(3)))
    : [];
  const totalPeriod = depPeriod.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
  const carbPeriod = depPeriod.filter(d => d.type === "carburant" && d.km).sort((a, b) => a.km - b.km);
  const kmPeriod = carbPeriod.length >= 2 ? carbPeriod[carbPeriod.length - 1].km - carbPeriod[0].km : 0;
  const litresPeriod = depPeriod.filter(d => d.type === "carburant" && d.litres).reduce((s, d) => s + (parseFloat(d.litres) || 0), 0);
  const consoPeriod = kmPeriod > 0 && litresPeriod > 0 ? ((litresPeriod / kmPeriod) * 100).toFixed(1) : null;
  const coutKmPeriod = kmPeriod > 0 ? (depPeriod.filter(d => d.type === "carburant").reduce((s, d) => s + (parseFloat(d.montant) || 0), 0) / kmPeriod).toFixed(2) : null;

  // ── Bar chart 6 mois ──
  const barData = last6Months.map(m => {
    const carb = depPeriod.filter(d => d.date?.startsWith(m) && d.type === "carburant").reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
    const gen  = depPeriod.filter(d => d.date?.startsWith(m) && d.type === "general").reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
    return { m, label: shortMonth(m), carb, gen, total: carb + gen };
  });
  const maxBar = Math.max(...barData.map(b => b.total), 1);

  // ── KPIs ──
  const moisAvecData = new Set(depPeriod.map(d => d.date?.substring(0, 7)).filter(Boolean)).size;
  const coutMoyMois = moisAvecData > 0 ? (totalPeriod / moisAvecData).toFixed(0) : null;

  // ── Répartition catégories ──
  const cats = {};
  depPeriod.forEach(d => {
    const cat = d.type === "carburant" ? "Carburant" : (d.categorie || "Général");
    cats[cat] = (cats[cat] || 0) + (parseFloat(d.montant) || 0);
  });
  const totalCats = Object.values(cats).reduce((s, v) => s + v, 0);
  const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const CAT_COL = { Carburant: C.orange, Garage: "#3b82f6", Assurance: "#8b5cf6", Financement: "#06b6d4", Péage: "#f59e0b", Lavage: "#10b981", Contravention: C.red, Parking: "#6366f1", Général: "#94a3b8" };
  const CAT_EN  = { Carburant: "Fuel", Garage: "Garage", Assurance: "Insurance", Financement: "Financing", Péage: "Toll", Lavage: "Car wash", Contravention: "Fine", Parking: "Parking", Général: "General", "Contrôle technique": "MOT / Inspection" };
  const catLabel = (cat) => isEn ? (CAT_EN[cat] || cat) : cat;

  if (!isPremium) {
    return (
      <div style={{ background: C.surface, borderRadius: 18, padding: 24, textAlign: "center", border: `1px solid ${C.blue}33` }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>{isEn ? "Advanced statistics" : "Statistiques avancées"}</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>{isEn ? "Access 3 months with Premium, 1 full year with Ultra." : "Accédez aux 3 derniers mois avec Premium, et à 1 an complet avec Ultra."}</div>
        <button onClick={() => onShowPremium?.()} style={{ background: C.blue, border: "none", borderRadius: 14, padding: "12px 24px", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🔒 {isEn ? "See plans" : "Voir les plans"}</button>
      </div>
    );
  }

  return (
    <div>
      {/* ── 2 cartes compactes ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: "linear-gradient(135deg, #0d1a2e, #1a2a4a)", border: `1px solid ${C.blue}44`, borderRadius: 16, padding: "14px 12px" }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>{isEn ? "THIS MONTH" : "CE MOIS-CI"}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.orange, marginBottom: 10 }}>{totalMois.toFixed(0)} €</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>⛽ {coutKmMois ? `${coutKmMois} €/${uk}` : "—"}</div>
          <div style={{ fontSize: 10, color: C.muted }}>📊 {consoMois ? `${consoMois} L/100` : "—"}</div>
        </div>
        <div style={{ flex: 1, background: isUltra ? "linear-gradient(135deg, #0d1a0d, #1a2a1a)" : "linear-gradient(135deg, #0d1a2e, #1a2a4a)", border: `1px solid ${isUltra ? C.green : C.blue}44`, borderRadius: 16, padding: "14px 12px" }}>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>{periodLabel}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.orange, marginBottom: 10 }}>{totalPeriod.toFixed(0)} €</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>⛽ {coutKmPeriod ? `${coutKmPeriod} €/${uk}` : "—"}</div>
          <div style={{ fontSize: 10, color: C.muted }}>📊 {consoPeriod ? `${consoPeriod} L/100` : "—"}</div>
        </div>
      </div>

      {depPeriod.length === 0 ? (
        <div style={card({ textAlign: "center", padding: 32, color: C.muted })}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <div>{isEn ? "No data yet" : "Pas encore de données"}</div>
        </div>
      ) : (
        <>
          {/* ── Graphique barres empilées 6 mois ── */}
          <div style={card({ padding: 16, marginBottom: 12 })}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>{isEn ? "EXPENSES — LAST 6 MONTHS" : "DÉPENSES — 6 DERNIERS MOIS"}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
              {barData.map((b, i) => {
                const totalH = maxBar > 0 ? (b.total / maxBar) * 80 : 0;
                const carbH  = b.total > 0 ? (b.carb / b.total) * totalH : 0;
                const genH   = totalH - carbH;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", height: 80, justifyContent: "flex-end" }}>
                      {genH > 1 && <div style={{ width: "100%", height: genH, background: C.blue, borderRadius: carbH < 1 ? "4px 4px 0 0" : "0" }} />}
                      {carbH > 1 && <div style={{ width: "100%", height: carbH, background: C.orange, borderRadius: genH < 1 ? "4px 4px 0 0" : "0" }} />}
                      {b.total === 0 && <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />}
                    </div>
                    <div style={{ fontSize: 9, color: C.muted, marginTop: 5, fontWeight: 600 }}>{b.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: C.orange }} />
                <span style={{ fontSize: 10, color: C.muted }}>{isEn ? "Fuel" : "Carburant"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} />
                <span style={{ fontSize: 10, color: C.muted }}>{isEn ? "General" : "Général"}</span>
              </div>
            </div>
          </div>

          {/* ── 3 KPIs ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[
              { label: isEn ? "Avg/month" : "Moy./mois",   value: coutMoyMois    ? `${coutMoyMois} €`       : "—", icon: "📅" },
              { label: isEn ? "Avg. consump." : "Conso. moy.", value: consoPeriod ? `${consoPeriod} L/100`  : "—", icon: "⛽" },
              { label: `€/${uk}`,                             value: coutKmPeriod  ? `${coutKmPeriod} €`     : "—", icon: "🛣️" },
            ].map((kpi, i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{kpi.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 3 }}>{kpi.value}</div>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 0.3 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* ── Répartition par catégorie ── */}
          {catList.length > 0 && (
            <div style={card({ padding: 16 })}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>{isEn ? "BY CATEGORY" : "RÉPARTITION PAR CATÉGORIE"}</div>
              {catList.map(([cat, val]) => {
                const pct = totalCats > 0 ? Math.round((val / totalCats) * 100) : 0;
                const col = CAT_COL[cat] || "#64748b";
                return (
                  <div key={cat} style={{ marginBottom: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{catLabel(cat)}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: col, fontWeight: 800 }}>{pct}%</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{val.toFixed(0)} €</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function DepensesScreen({ active, vehicles, setVehicles, setActive, depenses, setDepenses, t = {}, isPremium = true, isUltra = true, onShowPremium }) {
  const [sousOnglet, setSousOnglet] = useState("carburant");
  const [consView, setConsView] = useState("mois"); // 'annee' or 'mois'
  const [selMonth, setSelMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", montant: "", categorie: "Garage", description: "", km: "", prixCarburant: "", litres: "", photoUrl: "" });
  const [confirmId, setConfirmId] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const [kilometrage, setKilometrage] = useState("");
  const [selCat, setSelCat] = useState("Garage");
  const [photos, setPhotos] = useState([]);
  const [allPhotosCount, setAllPhotosCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [confirmPhotoId, setConfirmPhotoId] = useState(null);
  const [clearCacheConfirm, setClearCacheConfirm] = useState(false);
  const [clearCacheLoading, setClearCacheLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    loadFacturePhotos(userId).then(all => {
      setAllPhotosCount(all.length);
      setPhotos(all.filter(p => p.vehicleId === active.id));
    });
  }, [active]);


  const scanFacture = async (photoData) => {
    setScanning(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoData.split(",")[1] } },
              { type: "text", text: `Analyse cette facture de garage/station service et extrais les informations. Réponds UNIQUEMENT en JSON avec ce format exact : {"date": "YYYY-MM-DD", "montant": "XX.XX", "description": "description courte des travaux", "categorie": "Garage"} . Si tu ne trouves pas une info, mets "" pour cette valeur. La date doit être au format YYYY-MM-DD.` }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);
      setForm(f => ({
        ...f,
        date: result.date || f.date,
        montant: result.montant || f.montant,
        description: result.description || f.description,
        categorie: result.categorie || f.categorie,
      }));
      setSousOnglet("general");
      setShowForm(true);
    } catch (e) {
      alert("Impossible de lire la facture. Remplissez manuellement.");
    }
    setScanning(false);
  };

  const handlePhotoScan = (file) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const userId = auth.currentUser?.uid;
      if (userId) {
        setUploading(true);
        try {
          const immat = (active.immat || String(active.id)).replace(/[^a-zA-Z0-9]/g, "_");
          const date = new Date().toISOString().split("T")[0];
          const catSafe = selCat.replace(/[^a-zA-Z0-9]/g, "_");
          const storageRef = ref(storage, `factures/${userId}/${active.id}/${catSafe}_${date}_${immat}_${Date.now()}.jpg`);
          const blob = await (await fetch(base64)).blob();
          const snap = await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(snap.ref);
          const photoId = await saveFacturePhoto({ userId, vehicleId: active.id, vehicleImmat: active.immat || "", url, storagePath: snap.ref.fullPath, categorie: selCat, date, createdAt: Date.now() });
          if (photoId) {
            setPhotos(prev => [...prev, { id: photoId, vehicleId: active.id, url, storagePath: snap.ref.fullPath, categorie: selCat, date, createdAt: Date.now() }]);
            setForm(f => ({ ...f, photoUrl: url }));
            console.log("[PHOTO] URL set in form:", url);
          }
        } catch (e) {
          console.error("Upload facture:", e);
        } finally {
          setUploading(false);
        }
      }
      scanFacture(base64);
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = async (photo) => {
    try { await deleteObject(ref(storage, photo.storagePath)); } catch (_) {}
    await deleteFacturePhotoById(photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    setConfirmPhotoId(null);
  };

  

  if (!active) return <div style={{ padding: 40, textAlign: "center", color: C.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>💰</div><div style={{ fontWeight: 600 }}>{t.choisirVehicule || "Choisis un véhicule depuis l'accueil"}</div></div>;

  const myDep  = (depenses || []).filter(d => d.vehicleId === active.id);
  const depGen = myDep.filter(d => d.type === "general");
  const depCarb= myDep.filter(d => d.type === "carburant");
  const now        = new Date();
  const moisActuel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const locale     = t.anneeVue === "Year" ? "en-GB" : "fr-FR";
  const nomMois    = now.toLocaleDateString(locale, { month: "long", year: "numeric" }).replace(/^./, c => c.toUpperCase());
  const depMois    = myDep.filter(d => d.date?.startsWith(moisActuel));
  const totalMois  = depMois.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
  const carbMois   = depCarb.filter(d => d.date?.startsWith(moisActuel)).sort((a,b) => a.km - b.km);
  const kmMois     = carbMois.length >= 2 ? carbMois[carbMois.length-1].km - carbMois[0].km : 0;
  const CAT_ICONS  = { [t.catFinancement||"Financement"]: "🏦", [t.catAssurance||"Assurance"]: "🛡️", [t.catControle||"Contrôle technique"]: "🚗", [t.catGarage||"Garage"]: "🔧", [t.catPeage||"Péage"]: "🛣️", [t.catLavage||"Lavage"]: "🚿", [t.catContravention||"Contravention"]: "🚔", [t.catParking||"Parking"]: "🅿️" };
  const CATEGORIES = [t.catFinancement||"Financement", t.catAssurance||"Assurance", t.catControle||"Contrôle technique", t.catGarage||"Garage", t.catPeage||"Péage", t.catLavage||"Lavage", t.catContravention||"Contravention", t.catParking||"Parking"];
  const PHOTO_CATS = [
    { key: "Garage",    icon: "🔧" },
    { key: "Carburant", icon: "⛽" },
    { key: "Péage",     icon: "🛣️" },
    { key: "Lavage",    icon: "🧽" },
    { key: "Autre",     icon: "📄" },
  ];
  const tabStyle   = (on) => ({ flex: 1, padding: "10px 0", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", background: on ? C.green : C.blue, color: on ? "#000" : "white", boxShadow: on ? `0 2px 12px ${C.green}44` : `0 2px 8px ${C.blue}44` });

  const addDepense = () => {
    if (sousOnglet === "general") {
      if (!form.montant || !form.date) return;
      console.log("[ADD_DEPENSE] form.photoUrl =", form.photoUrl);
      setDepenses(p => [...p, { id: Date.now(), type: "general", date: form.date, montant: form.montant, categorie: form.categorie, description: form.description, km: kilometrage, vehicleId: active.id, vehicleName: active.name, photoUrl: form.photoUrl || "" }]);
    } else {
      if (!form.prixCarburant || !form.date || !form.km) return;
      setDepenses(p => [...p, { id: Date.now(), type: "carburant", date: form.date, montant: form.prixCarburant, km: form.km, litres: form.litres, vehicleId: active.id, vehicleName: active.name }]);
      if (setVehicles && form.km) {
        const newKm = parseInt(form.km) || 0;
        if (newKm > 0) {
          setVehicles(prev => prev.map(v => v.id === active.id ? { ...v, km: String(newKm) } : v));
          setActive(prev => prev?.id === active.id ? { ...prev, km: String(newKm) } : prev);
        }
      }
    }
    setForm({ date: "", montant: "", categorie: "Garage", description: "", km: "", prixCarburant: "", litres: "", photoUrl: "" });
    setKilometrage("");
    setShowForm(false);
  };

  const coutKm = depCarb.length >= 2 ? depCarb.slice().sort((a,b) => a.km - b.km).reduce((acc, d, i, arr) => { if (i === 0) return acc; const kmDiff = d.km - arr[i-1].km; if (kmDiff > 0) acc.push({ km: d.km, cout: (parseFloat(d.montant) / kmDiff).toFixed(2) }); return acc; }, []) : [];

  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100vh" }}>
      {vehicles.length > 1 && <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>{vehicles.map(v => <VehicleChip key={v.id} v={v} active={active} setActive={setActive} />)}</div>}

      <div style={card({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: 0.5 }}>{nomMois}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.orange, marginTop: 2 }}>{totalMois.toFixed(2)} €</div>
          {kmMois > 0 && <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginTop: 4 }}>🛣️ {kmMois.toLocaleString()} {t.unitKm || "km"} {t.parcourus || "parcourus ce mois"}</div>}
          {(() => {
            const litresMois = depCarb.filter(d => d.date?.startsWith(moisActuel) && d.litres).reduce((s, d) => s + parseFloat(d.litres), 0);
            if (litresMois > 0 && kmMois > 0) {
              const conso = ((litresMois / kmMois) * 100).toFixed(1);
              return <div style={{ fontSize: 12, color: C.orange, marginTop: 4, fontWeight: 700 }}>⛽ {conso} L/100km</div>;
            }
            return null;
          })()}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted }}>{t.general?.replace("📋 ", "") || "Général"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{depMois.filter(d=>d.type==="general").reduce((s,d)=>s+(parseFloat(d.montant)||0),0).toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{t.carburant?.replace("⛽ ", "") || "Carburant"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{depMois.filter(d=>d.type==="carburant").reduce((s,d)=>s+(parseFloat(d.montant)||0),0).toFixed(2)} €</div>
        </div>
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 4, marginBottom: 16, gap: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
        <button style={tabStyle(sousOnglet === "carburant")} onClick={() => setSousOnglet("carburant")}>{t.carburant || "⛽ Carburant"}</button>
        <button style={tabStyle(sousOnglet === "general")}   onClick={() => setSousOnglet("general")}>{t.general || "📋 Général"}</button>
        <button style={tabStyle(sousOnglet === "stats")}     onClick={() => setSousOnglet("stats")}>📊 Stats</button>
        <button style={tabStyle(sousOnglet === "photos")}    onClick={() => setSousOnglet("photos")}>📷 Photos</button>
      </div>

      {sousOnglet === "stats" && <PremiumHistorique active={active} depenses={depenses} isPremium={isPremium} isUltra={isUltra} onShowPremium={onShowPremium} t={t} />}

      {sousOnglet === "general" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={btn({ background: showForm ? C.surface : C.blue, color: showForm ? C.muted : "white", boxShadow: "none" })} onClick={() => setShowForm(f => !f)}>{showForm ? (t.annuler || "✕ Annuler") : (t.ajouterDepense || "➕ Ajouter une dépense")}</button>
          </div>
          {showForm && (
            <div style={card({ padding: 20, marginBottom: 12 })}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.date || "DATE"}</div>
              <input type="date" style={input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.categorie || "CATÉGORIE"}</div>
              <select style={input} value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>{CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</select>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.montant || "MONTANT (€)"}</div>
              <input type="number" style={input} placeholder="Ex: 150.00" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
              {(form.categorie === "Garage" || form.categorie === "Contrôle technique") && (
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>KILOMÉTRAGE AU COMPTEUR</div>
                  <input type="number" style={{ ...input, marginBottom: 10 }} placeholder="Kilométrage au compteur (km)" value={kilometrage} onChange={e => setKilometrage(e.target.value)} />
                </div>
              )}
              {form.categorie === (t.catGarage || "Garage") && (
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.description || "DESCRIPTION"}</div>
                  <input style={{ ...input, marginBottom: 10 }} placeholder="Ex: Vidange + filtre huile" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              )}
              <button style={btn({ opacity: form.montant && form.date && (form.categorie !== "Garage" || form.description) ? 1 : 0.5 })} onClick={addDepense}>{t.enregistrerDepense || "✅ Enregistrer"}</button>
            </div>
          )}
          {depGen.length === 0 && !showForm && <div style={card({ textAlign: "center", padding: 32, color: C.muted })}><div style={{ fontSize: 36, marginBottom: 10 }}>💸</div><div>{t.rienIci || "Rien ici pour l'instant 💸"}</div></div>}
          {depGen.sort((a,b) => new Date(b.date) - new Date(a.date)).map(d => (
            <div key={d.id} style={card({ padding: "10px 14px" })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{CAT_ICONS[d.categorie] || "💰"}</span>
                <div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 12, color: C.muted }}>{d.categorie}{d.description ? ` · ${d.description}` : ""} · {new Date(d.date).toLocaleDateString("fr-FR")}</div><div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{parseFloat(d.montant).toFixed(2)} €</div></div></div>
                <button onClick={() => setConfirmId(d.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              {confirmId === d.id && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setConfirmId(null)} style={{ flex: 1, background: C.surface, border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Annuler</button>
                  <button onClick={() => { setDepenses(p => p.filter(x => x.id !== d.id)); setConfirmId(null); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>🗑️ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sousOnglet === "carburant" && (
        <div>
          {depCarb.length === 0 && !showForm && <div style={card({ textAlign: "center", padding: 32, color: C.muted })}><div style={{ fontSize: 36, marginBottom: 10 }}>⛽</div><div>{t.premierPlein || "Premier plein à enregistrer ⛽"}</div></div>}
          {/* Controls: Vue consommation (année / mois) et sélection du mois */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 20 }}>
              <button onClick={() => setConsView("annee")} style={{ padding: "8px 12px", borderRadius: 16, border: "none", cursor: "pointer", background: consView === "annee" ? C.blue : "transparent", color: consView === "annee" ? "white" : C.muted, fontWeight: 800 }}>{t.anneeVue || "Année"}</button>
              <button onClick={() => setConsView("mois")} style={{ padding: "8px 12px", borderRadius: 16, border: "none", cursor: "pointer", background: consView === "mois" ? C.blue : "transparent", color: consView === "mois" ? "white" : C.muted, fontWeight: 800 }}>{t.moisVue || "Mois"}</button>
            </div>
            {consView === "mois" && (
              <input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px", background: C.surface, color: C.text }} />
            )}
          </div>

          {/* Consommation + Coût au km regroupés */}
          {(() => {
            const fills = depCarb.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
            let items = [];
            if (consView === "annee") {
              const perMonth = {};
              fills.forEach(d => {
                if (!d.date) return;
                const mois = d.date.substring(0,7);
                if (!perMonth[mois]) perMonth[mois] = { litres: 0, kms: [] };
                perMonth[mois].litres += parseFloat(d.litres) || 0;
                if (d.km) perMonth[mois].kms.push(parseInt(d.km));
              });
              items = Object.keys(perMonth).sort().map(m => {
                const kms = perMonth[m].kms.sort((a,b) => a-b);
                const km = kms.length >= 2 ? kms[kms.length-1] - kms[0] : 0;
                const value = km > 0 ? (perMonth[m].litres / km) * 100 : null;
                return { label: m, value };
              }).filter(x => x.value !== null);
            } else {
              const monthFills = fills.filter(d => d.date?.startsWith(selMonth));
              for (let i = 1; i < monthFills.length; i++) {
                const prev = monthFills[i-1];
                const cur = monthFills[i];
                const kmDiff = (parseInt(cur.km) || 0) - (parseInt(prev.km) || 0);
                if (kmDiff > 0 && cur.litres) {
                  const value = (parseFloat(cur.litres) || 0) / kmDiff * 100;
                  const day = cur.date ? cur.date.substring(8,10) : String(i+1);
                  items.push({ label: day, value });
                }
              }
            }

            const hasConsomation = items.length > 0;
            const hasCoutKm = coutKm.length > 0;
            if (!hasConsomation && !hasCoutKm) return null;

            const values = items.map(i => i.value);
            const maxV = hasConsomation ? Math.max(...values) : 0;
            const minV = hasConsomation ? Math.min(...values) : 0;
            const points = hasConsomation ? items.map((it, idx) => {
              const x = items.length === 1 ? 50 : (idx / (items.length - 1)) * 100;
              const y = maxV === minV ? 50 : 100 - ((it.value - minV) / (maxV - minV)) * 80 - 10;
              return `${x},${y}`;
            }).join(" ") : "";

            return (
              <div style={card({ padding: 16, marginBottom: 12 })}>
                {hasConsomation && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{consView === "annee" ? (t.consoParMois || "Consommation par mois (L/100km)") : `${t.consomMois || "Consommation"} ${selMonth}`}</div>
                      <div style={{ background: C.blue + "22", borderRadius: 10, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>{t.moyAbrev || "Moy."}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{(values.reduce((s,v) => s + v, 0) / values.length).toFixed(1)} L/100{t.unitKm || "km"}</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 120 }}>
                      <polyline points={points} fill="none" stroke={C.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      {items.map((it, idx) => {
                        const x = items.length === 1 ? 50 : (idx / (items.length - 1)) * 100;
                        const y = maxV === minV ? 50 : 100 - ((it.value - minV) / (maxV - minV)) * 80 - 10;
                        return <circle key={idx} cx={`${x}%`} cy={`${y}%`} r={2.2} fill={C.orange} />;
                      })}
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: C.muted }}>
                      {items.map((it, idx) => <div key={idx} style={{ flex: 1, textAlign: idx === 0 ? "left" : idx === items.length - 1 ? "right" : "center" }}>{it.label}</div>)}
                    </div>
                  </>
                )}
                {hasCoutKm && (
                  <>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginTop: hasConsomation ? 16 : 0, marginBottom: 12, borderTop: hasConsomation ? "1px solid rgba(255,255,255,0.07)" : "none", paddingTop: hasConsomation ? 14 : 0 }}>{t.coutAuKm || "COÛT AU KM"}</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                      {coutKm.slice(-8).map((p, i) => { const maxC = Math.max(...coutKm.map(x => x.cout)); const h = maxC > 0 ? (p.cout / maxC) * 70 : 0; return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ fontSize: 9, color: C.muted }}>{p.cout}€</div><div style={{ width: "100%", height: h + "px", borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, ${C.blue}, ${C.green})`, minHeight: 4 }} /></div>; })}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>{t.moyenne || "Moyenne"} : {(coutKm.reduce((s,p) => s + parseFloat(p.cout), 0) / coutKm.length).toFixed(2)} €/{t.unitKm || "km"}</div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Bouton ajouté juste sous la fenêtre des courbes */}
          <button style={btn({ background: showForm ? C.surface : C.blue, color: showForm ? C.muted : "white", boxShadow: "none", marginBottom: 12 })} onClick={() => setShowForm(f => !f)}>{showForm ? (t.annuler || "✕ Annuler") : (t.ajouterPlein || "➕ Ajouter un plein")}</button>
          {showForm && (
            <div style={card({ padding: 20 })}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.date || "DATE"}</div>
              <input type="date" style={input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.kilometrageCompteur || "KILOMÉTRAGE DU COMPTEUR"} *</div>
              <input type="number" style={input} placeholder="Ex: 85000" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} />
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.prix || "PRIX (€)"}</div>
              <input type="number" style={input} placeholder="Ex: 65.50" value={form.prixCarburant} onChange={e => setForm(f => ({ ...f, prixCarburant: e.target.value }))} />
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>LITRES</div>
              <input type="number" style={input} placeholder="Ex: 45.5" value={form.litres} onChange={e => setForm(f => ({ ...f, litres: e.target.value }))} />
              <button style={btn({ opacity: form.prixCarburant && form.date && form.km ? 1 : 0.5 })} onClick={addDepense}>{t.enregistrerPlein || "✅ Enregistrer le plein"}</button>
            </div>
          )}

          {depCarb.filter(d => d.date?.startsWith(moisActuel)).sort((a,b) => new Date(b.date) - new Date(a.date)).map(d => (
            <div key={d.id} style={card({ padding: "10px 14px" })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⛽</span>
                <div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 12, color: C.muted }}>📍 {parseInt(d.km).toLocaleString()} {t.unitKm || "km"} · {new Date(d.date).toLocaleDateString(locale)}</div><div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{parseFloat(d.montant).toFixed(2)} €</div></div></div>
                <button onClick={() => setConfirmId(d.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              {confirmId === d.id && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setConfirmId(null)} style={{ flex: 1, background: C.surface, border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Annuler</button>
                  <button onClick={() => { setDepenses(p => p.filter(x => x.id !== d.id)); setConfirmId(null); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>🗑️ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sousOnglet === "photos" && (
        <div>
          {(() => {
            const QUOTA = isUltra ? 200 : isPremium ? 50 : 10;
            const pct = Math.round((allPhotosCount / QUOTA) * 100);
            if (pct < 80) return null;
            const col = pct >= 100 ? C.red : "#ffb133";
            return (
              <div style={{ background: col + "18", border: `1px solid ${col}44`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: col }}>
                    {pct >= 100 ? "🔴 Stockage saturé" : "⚠️ Stockage presque plein"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{allPhotosCount}/{QUOTA} photos</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: col, borderRadius: 6 }} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Videz le cache ci-dessous pour libérer de l'espace</div>
              </div>
            );
          })()}
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CATÉGORIE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {PHOTO_CATS.map(cat => (
              <button key={cat.key} onClick={() => setSelCat(cat.key)} style={{ padding: "7px 12px", borderRadius: 20, border: `1px solid ${selCat === cat.key ? C.blue : "rgba(255,255,255,0.12)"}`, background: selCat === cat.key ? C.blue + "22" : "transparent", color: selCat === cat.key ? C.blue : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                {cat.icon} {cat.key}
              </button>
            ))}
          </div>

          {isUltra ? (
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,161,0,0.15)", border: `1px solid ${C.orange}44`, borderRadius: 14, padding: 14, cursor: "pointer", marginBottom: 16, color: (uploading || scanning) ? C.muted : C.orange, fontWeight: 700, fontSize: 14 }}>
              {uploading ? "⏳ Upload..." : scanning ? "⏳ Analyse IA..." : "📷 Scanner une facture"}
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={uploading || scanning}
                onChange={e => { const f = e.target.files[0]; if (f) handlePhotoScan(f); e.target.value = ""; }} />
            </label>
          ) : (
            <button onClick={() => onShowPremium?.()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${C.purple}15`, border: `1px solid ${C.purple}44`, borderRadius: 14, padding: 14, cursor: "pointer", marginBottom: 16, color: C.purple, fontWeight: 700, fontSize: 14, width: "100%" }}>
              💎 Scanner une facture <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>(Ultra)</span>
            </button>
          )}

          {photos.length === 0 ? (
            <div style={card({ textAlign: "center", padding: 32, color: C.muted })}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
              <div>Aucune photo de facture</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Sélectionnez une catégorie et scannez votre première facture</div>
            </div>
          ) : (
            PHOTO_CATS.filter(cat => photos.some(p => p.categorie === cat.key)).map(cat => (
              <div key={cat.key} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>{cat.icon} {cat.key.toUpperCase()}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {photos.filter(p => p.categorie === cat.key).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(photo => (
                    <div key={photo.id} style={{ background: C.surface, borderRadius: 12, overflow: "hidden" }}>
                      <img src={photo.url} alt={cat.key} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                      <div style={{ padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 10, color: C.muted }}>{photo.date}</div>
                        {confirmPhotoId === photo.id ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setConfirmPhotoId(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "3px 7px", color: C.muted, cursor: "pointer", fontSize: 10 }}>✕</button>
                            <button onClick={() => deletePhoto(photo)} style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 6, padding: "3px 7px", color: C.red, cursor: "pointer", fontSize: 10, fontWeight: 700 }}>🗑️</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmPhotoId(photo.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "2px 4px" }}>🗑️</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Vider le cache photos */}
          {allPhotosCount > 0 && (
            <div style={{ marginTop: 20 }}>
              {!clearCacheConfirm ? (
                <button onClick={() => setClearCacheConfirm(true)} style={{ width: "100%", background: "rgba(255,177,51,0.1)", border: "1px solid rgba(255,177,51,0.3)", borderRadius: 14, padding: 14, color: "#ffb133", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  🗑️ Vider le cache photos ({allPhotosCount})
                </button>
              ) : (
                <div style={{ background: "rgba(255,177,51,0.08)", border: "1px solid rgba(255,177,51,0.35)", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#ffb133", marginBottom: 6 }}>⚠️ Supprimer toutes les photos ?</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>Toutes vos factures et photos seront définitivement supprimées du stockage.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setClearCacheConfirm(false)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: 12, color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Annuler</button>
                    <button onClick={async () => {
                      const uid = auth.currentUser?.uid;
                      if (!uid) return;
                      setClearCacheLoading(true);
                      await clearAllFacturePhotos(uid);
                      setPhotos([]);
                      setAllPhotosCount(0);
                      setClearCacheLoading(false);
                      setClearCacheConfirm(false);
                    }} disabled={clearCacheLoading} style={{ flex: 1, background: "#ffb133", border: "none", borderRadius: 10, padding: 12, color: "#000", cursor: "pointer", fontWeight: 800, fontSize: 13, opacity: clearCacheLoading ? 0.7 : 1 }}>
                      {clearCacheLoading ? "⏳ Suppression..." : "🗑️ Tout supprimer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
