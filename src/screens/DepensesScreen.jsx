import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, auth } from "../config/firebase";
import { saveFacturePhoto, loadFacturePhotos, deleteFacturePhotoById, clearAllFacturePhotos } from "../config/firestore";
import { C, card, btn, input, VehicleChip } from "./shared";

function PremiumHistorique({ active, depenses = [], isPremium = true, isUltra = true, onShowPremium }) {
  if (!active) return null;

  const myDep = depenses.filter(d => d.vehicleId === active.id);
  const now = new Date();
  const moisActuel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const cutoffDate = (months) => {
    const d = new Date(now); d.setMonth(d.getMonth() - months + 1); d.setDate(1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const depMois = myDep.filter(d => d.date?.startsWith(moisActuel));
  const totalMois = depMois.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
  const carbMois = depMois.filter(d => d.type === "carburant" && d.km).sort((a, b) => a.km - b.km);
  const kmMois = carbMois.length >= 2 ? carbMois[carbMois.length - 1].km - carbMois[0].km : 0;
  const litresMois = depMois.filter(d => d.type === "carburant" && d.litres).reduce((s, d) => s + (parseFloat(d.litres) || 0), 0);
  const consoMois = kmMois > 0 && litresMois > 0 ? ((litresMois / kmMois) * 100).toFixed(1) : null;

  const periodLabel = isUltra ? "12 DERNIERS MOIS" : "3 DERNIERS MOIS";
  const depPeriod = isPremium
    ? (isUltra ? myDep : myDep.filter(d => d.date && d.date.substring(0, 7) >= cutoffDate(3)))
    : [];
  const totalPeriod = depPeriod.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
  const carbPeriod = depPeriod.filter(d => d.type === "carburant" && d.km).sort((a, b) => a.km - b.km);
  const kmPeriod = carbPeriod.length >= 2 ? carbPeriod[carbPeriod.length - 1].km - carbPeriod[0].km : 0;
  const litresPeriod = depPeriod.filter(d => d.type === "carburant" && d.litres).reduce((s, d) => s + (parseFloat(d.litres) || 0), 0);
  const consoPeriod = kmPeriod > 0 && litresPeriod > 0 ? ((litresPeriod / kmPeriod) * 100).toFixed(1) : null;

  const parMois = {};
  depPeriod.forEach(d => {
    if (!d.date) return;
    const mois = d.date.substring(0, 7);
    if (!parMois[mois]) parMois[mois] = { depenses: 0, carburant: [] };
    parMois[mois].depenses += parseFloat(d.montant) || 0;
    if (d.type === "carburant" && d.km) parMois[mois].carburant.push(parseInt(d.km));
  });
  Object.keys(parMois).forEach(mois => {
    const kms = parMois[mois].carburant.sort((a, b) => a - b);
    parMois[mois].km = kms.length >= 2 ? kms[kms.length - 1] - kms[0] : 0;
  });
  const moisTries = Object.keys(parMois).sort().reverse();

  const formatMois = (str) => {
    const [y, m] = str.split("-");
    const noms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return `${noms[parseInt(m) - 1]} ${y}`;
  };

  const lockCard = (label, desc, plan) => (
    <div style={{ background: C.surface, borderRadius: 18, padding: 24, textAlign: "center", border: `1px solid ${plan === "ultra" ? C.purple : C.blue}33` }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{plan === "ultra" ? "💎" : "🔒"}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>{desc}</div>
      <button onClick={() => onShowPremium?.()} style={{ background: plan === "ultra" ? `linear-gradient(135deg, ${C.purple}, #8b5cf6)` : C.blue, border: "none", borderRadius: 14, padding: "12px 24px", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
        {plan === "ultra" ? "💎 Passer Ultra Premium" : "🔒 Voir les plans"}
      </button>
    </div>
  );

  return (
    <div>
      {depMois.length === 0 ? (
        <div style={card({ textAlign: "center", padding: 24, color: C.muted })}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div>Pas encore de données ce mois-ci</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, flexWrap: "nowrap", justifyContent: "center", marginBottom: 14, overflowX: "auto" }}>
          <div style={{ flex: "0 0 140px", minHeight: 140, background: "linear-gradient(135deg, #1a2a4a, #2157FF22)", border: `1px solid ${C.blue}33`, borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>CE MOIS-CI</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.orange }}>{totalMois.toFixed(0)} €</div>
            <div style={{ fontSize: 16, color: C.green, marginTop: 12, fontWeight: 700 }}>{kmMois > 0 ? `${kmMois.toLocaleString()} km` : "—"}</div>
            <div style={{ fontSize: 16, color: C.green, marginTop: 4, fontWeight: 700 }}>{consoMois ? `${consoMois} L/100km` : "—"}</div>
          </div>
          <div style={{ flex: "0 0 140px", minHeight: 140, background: isUltra ? "linear-gradient(135deg, #1a2a1a, #22ff0011)" : "linear-gradient(135deg, #1a2a4a, #2157FF11)", border: `1px solid ${isUltra ? C.green : C.blue}33`, borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{periodLabel}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.orange }}>{totalPeriod.toFixed(0)} €</div>
            <div style={{ fontSize: 16, color: C.green, marginTop: 12, fontWeight: 700 }}>{kmPeriod > 0 ? `${kmPeriod.toLocaleString()} km` : "—"}</div>
            <div style={{ fontSize: 16, color: C.green, marginTop: 4, fontWeight: 700 }}>{consoPeriod ? `${consoPeriod} L/100km` : "—"}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
        {!isPremium && <span style={{ background: C.blue + "33", color: C.blue, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>🔒 PREMIUM</span>}
        {isPremium && !isUltra && <span style={{ background: C.purple + "33", color: C.purple, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>💎 ULTRA = 1 AN</span>}
      </div>

      {!isPremium
        ? lockCard("Statistiques sur 3 mois", "Accédez aux 3 derniers mois avec Premium, et à 1 an complet avec Ultra.", "premium")
        : (
          <>
            {moisTries.length === 0 && (
              <div style={card({ textAlign: "center", padding: 32, color: C.muted })}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
                <div>Pas encore de données</div>
              </div>
            )}
          </>
        )
      }
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
  const [scanPhoto, setScanPhoto] = useState(null);
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
      setScanPhoto(null);
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

  const uploadPhotoOnly = (file) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target.result;
        const immat = (active.immat || String(active.id)).replace(/[^a-zA-Z0-9]/g, "_");
        const date = new Date().toISOString().split("T")[0];
        const storageRef = ref(storage, `factures/${userId}/${active.id}/Garage_${date}_${immat}_${Date.now()}.jpg`);
        const blob = await (await fetch(base64)).blob();
        const snap = await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(snap.ref);
        await saveFacturePhoto({ userId, vehicleId: active.id, vehicleImmat: active.immat || "", url, storagePath: snap.ref.fullPath, categorie: "Garage", date, createdAt: Date.now() });
        setForm(f => ({ ...f, photoUrl: url }));
      } catch (e) {
        console.error("Upload photo:", e);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
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
          {kmMois > 0 && <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginTop: 4 }}>🛣️ {kmMois.toLocaleString()} km {t.parcourus || "parcourus ce mois"}</div>}
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

      {sousOnglet === "stats" && <PremiumHistorique active={active} depenses={depenses} isPremium={isPremium} isUltra={isUltra} onShowPremium={onShowPremium} />}

      {sousOnglet === "general" && (
        <div>
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
          <button style={btn({ background: showForm ? C.surface : C.blue, color: showForm ? C.muted : "white", boxShadow: "none", marginBottom: 12 })} onClick={() => setShowForm(f => !f)}>{showForm ? (t.annuler || "✕ Annuler") : (t.ajouterDepense || "➕ Ajouter une dépense")}</button>
          {showForm && (
            <div style={card({ padding: 20 })}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.date || "DATE"}</div>
              <input type="date" style={input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.categorie || "CATÉGORIE"}</div>
              <select style={input} value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>{CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</select>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.montant || "MONTANT (€)"}</div>
              <input type="number" style={input} placeholder="Ex: 150.00" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
              {(form.categorie === "Garage" || form.categorie === "Contrôle technique") && (
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>KILOMÉTRAGE AU COMPTEUR</div>
                  <input
                    type="number"
                    style={{ ...input, marginBottom: 10 }}
                    placeholder="Kilométrage au compteur (km)"
                    value={kilometrage}
                    onChange={e => setKilometrage(e.target.value)}
                  />
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
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{(values.reduce((s,v) => s + v, 0) / values.length).toFixed(1)} L/100km</span>
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
                    <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>{t.moyenne || "Moyenne"} : {(coutKm.reduce((s,p) => s + parseFloat(p.cout), 0) / coutKm.length).toFixed(2)} €/km</div>
                  </>
                )}
              </div>
            );
          })()}
          {depCarb.filter(d => d.date?.startsWith(moisActuel)).sort((a,b) => new Date(b.date) - new Date(a.date)).map(d => (
            <div key={d.id} style={card({ padding: "10px 14px" })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⛽</span>
                <div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 12, color: C.muted }}>📍 {parseInt(d.km).toLocaleString()} km · {new Date(d.date).toLocaleDateString("fr-FR")}</div><div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{parseFloat(d.montant).toFixed(2)} €</div></div></div>
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
