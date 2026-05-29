// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { logoutUser } from "./config/firebase";
import { useAuth } from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useVehicleManager } from "./hooks/useVehicleManager";
import { removeSharedVehicle } from "./config/firestore";
import { db } from "./config/firebase";
import { getDoc, doc } from "firebase/firestore";
import { CHECKLIST_MAP, getChecklist, TYPE_LABELS } from "./config/data";
import { getProgress } from "./utils/helpers";
import { translations } from "./config/translations";
import {
  AccueilScreen,
  ChecklistScreen,
  DocumentsScreen,
  DepensesScreen,
  HistoriqueScreen,
  RapportScreen,
  SecoursScreen,
} from "./screens/index";
import LoginScreen from "./components/LoginScreen";
import ShareScreen from "./components/ShareScreen";
import CGUScreen from "./components/CGUScreen";
import PremiumScreen from "./components/PremiumScreen";
import TutoScreen from "./components/TutoScreen";
import "./App.css";

const TABS = [
  { id: "accueil",    label: "Accueil",    icon: "🏠" },
  { id: "checklist",  label: "Checklist",  icon: "✅" },
  { id: "documents",  label: "Dossiers",   icon: "📄" },
  { id: "depenses",   label: "Dépenses",   icon: "💰" },
  { id: "historique", label: "Diagnostic", icon: "🔌" },
  { id: "rapport",    label: "Rapport",    icon: "📊" },
];

const C = {
  bg:      "#000000",
  surface: "#3A3A40",
  border:  "rgba(255,255,255,0.07)",
  blue:    "#2157FF",
  text:    "#ffffff",
  muted:   "#64748b",
  red:     "#ef4444",
};

function SplashScreen({ fading }) {
  const barRef = React.useRef(null);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = "100%";
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "#0a0e1a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      opacity: fading ? 0 : 1,
      transition: "opacity 0.5s ease",
      fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 72, marginBottom: 18 }}>🚗</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#2157FF", letterSpacing: 4 }}>CHECKAR</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, letterSpacing: 0.5 }}>Carnet d'entretien intelligent</div>
      </div>

      <div style={{ width: "60%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
        <div
          ref={barRef}
          style={{
            height: "100%",
            width: "0%",
            background: "#2157FF",
            borderRadius: 99,
            transition: "width 2s linear",
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid ?? null;
  const { load, save, syncStatus } = useFirestore(userId);

  const [vehicles,      setVehicles]      = useState([]);
  const [sharedVehicles, setSharedVehicles] = useState([]);
  const [active,        setActive]        = useState(null);
  const { loadVehicles } = useVehicleManager(userId, load, save);
  const contentRef = React.useRef(null);
  const [deferredInstall, setDeferredInstall] = React.useState(null);
  const [notifStatus, setNotifStatus] = React.useState(Notification?.permission ?? "default");
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  React.useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredInstall(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const hideTimer = setTimeout(() => setShowSplash(false), 2500);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  const setTab = useCallback((newTab) => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTabState(newTab);
  }, []);

  const [tab, setTabState] = useState("accueil");
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    if (saved) return saved;
    const browserLang = navigator.language || navigator.userLanguage || "fr";
    return browserLang.startsWith("fr") ? "fr" : "en";
  });
  const langLoadedRef = React.useRef(false);
  const vehiclesLoadedRef = React.useRef(false);
  const dataLoadedRef = React.useRef(false);
  const [name,          setName]          = useState("");
  const [immat,         setImmat]         = useState("");
  const [type,          setType]          = useState("voiture");
  const [docTab,        setDocTab]        = useState("assurance");
  const [docs,          setDocs]          = useState([]);
  const [depenses,      setDepenses]      = useState([]);
  const [showShare,     setShowShare]     = useState(false);
  const [localInvoices, setLocalInvoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem("invoices") || "[]"); } catch { return []; }
  });

  const t = translations[lang] || translations["fr"];
  const toggleLang = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    if (userId) save("lang", newLang);
  };

  const garageInfo = active?.garage || { nom: "", tel: "", adresse: "" };

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const data = await load();
      if (!data) return;
      // Charger la langue depuis Firebase uniquement au premier chargement
      if (!langLoadedRef.current) {
        const savedLang = data.lang || localStorage.getItem("lang") || "fr";
        setLang(savedLang);
        localStorage.setItem("lang", savedLang);
        langLoadedRef.current = true;
      }
      // Parser les dépenses d'abord pour synchroniser le km max depuis les pleins
      const depensesData = data.depenses ? JSON.parse(data.depenses) : [];
      const lastCarbKm = {};
      depensesData
        .filter(d => d.type === "carburant" && d.km)
        .forEach(d => {
          const km = parseInt(d.km) || 0;
          if (!lastCarbKm[d.vehicleId] || km > parseInt(lastCarbKm[d.vehicleId])) {
            lastCarbKm[d.vehicleId] = String(km);
          }
        });

      if (data.vehicles) {
        const vs = JSON.parse(data.vehicles);
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
        const lastResetMonth = localStorage.getItem("checklist_reset_month");
        // Ne réinitialiser que si lastResetMonth est un mois précédent (pas si null = premier accès)
        const shouldReset = lastResetMonth !== null && lastResetMonth !== currentMonth;
        localStorage.setItem("checklist_reset_month", currentMonth);

        const vsWithPhotos = vs.map(v => {
          // Nettoyer l'ancien ID "pneus" remplacé par pneusavant/pneusarriere
          let checks = shouldReset ? {} : { ...v.checks };
          if (checks.pneus) delete checks.pneus;
          // Nettoyer l'historique des anciennes entrées pneus
          const history = (v.history || []).map(h => ({
            ...h,
            actions: (h.actions || []).filter(a => !a.item?.startsWith("Pneus →") && !a.item?.startsWith("Tyres →"))
          })).filter(h => h.actions.length > 0);
          const km = lastCarbKm[v.id] || v.km;
          const cachedPhoto = localStorage.getItem("photo_" + v.id);
          const photo = cachedPhoto || v.photo || null;
          if (!cachedPhoto && v.photo) {
            try { localStorage.setItem("photo_" + v.id, v.photo); } catch (_) {}
          }
          return { ...v, checks, history, photo, km };
        });
        setVehicles(vsWithPhotos);
        if (shouldReset) {
          const toSave = vsWithPhotos.filter(v => !v.isShared).map(({ photo, ...v }) => v);
          save("vehicles", toSave);
        }

        // Charger les véhicules partagés séparément
        if (data.sharedVehicles) {
          const shared = JSON.parse(data.sharedVehicles);
          const sharedVehiclesData = await Promise.all(shared.map(async (sv) => {
            try {
              const ownerSnap = await getDoc(doc(db, "autocheck", sv.ownerId));
              if (!ownerSnap.exists()) return null;
              const ownerData = ownerSnap.data();
              if (!ownerData.vehicles) return null;
              const ownerVehicles = JSON.parse(ownerData.vehicles);
              const vehicle = ownerVehicles.find(v => v.id === sv.vehicleId);
              if (!vehicle) return null;
              return { ...vehicle, isShared: true, ownerName: sv.vehicleName };
            } catch { return null; }
          }));
          setSharedVehicles(sharedVehiclesData.filter(Boolean));
        }
      }
      vehiclesLoadedRef.current = true;
      if (data.docs) {
        const allDocs = JSON.parse(data.docs);
        const seen = new Map();
        const deduped = allDocs.sort((a, b) => b.id - a.id).filter(d => {
          const key = `${d.type}_${d.vehicleId || "global"}`;
          if (seen.has(key)) return false;
          seen.set(key, true);
          return true;
        });
        setDocs(deduped);
      }
      if (data.depenses) setDepenses(depensesData);
      dataLoadedRef.current = true;
    })();
  }, [userId, load]);

  useEffect(() => {
    if (!userId || !vehiclesLoadedRef.current) return;
    save("vehicles", vehicles.filter(v => !v.isShared));
  }, [vehicles, userId, save]);

  useEffect(() => {
    if (!userId || !dataLoadedRef.current) return;
    save("depenses", depenses);
  }, [depenses, userId, save]);

  useEffect(() => {
    if (!userId || !dataLoadedRef.current) return;
    save("docs", docs);
  }, [docs, userId, save]);

  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(localInvoices));
  }, [localInvoices]);

  useEffect(() => {
    if (!userId) {
      setVehicles([]); setActive(null); setDocs([]); setDepenses([]);
      vehiclesLoadedRef.current = false;
      dataLoadedRef.current = false;
    }
  }, [userId]);

  const allVehicles = [...vehicles, ...sharedVehicles];

  const PLAN = "ultra"; // "free" | "premium" | "ultra" — changer pour verrouiller
  const isPremium = PLAN === "premium" || PLAN === "ultra";
  const isUltra = PLAN === "ultra";
  const maxVehicles = PLAN === "free" ? 1 : PLAN === "premium" ? 3 : Infinity;

  const checklist  = active ? (getChecklist(active.type, lang) || []) : [];
  const prog       = getProgress(active, lang);
  const alertCount = docs.filter(d => d.days <= 30).length;

  const [showAbout, setShowAbout] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showTuto, setShowTuto] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem("tuto_seen")) {
      setShowTuto(true);
    }
  }, [user]);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteAccount = async () => {
    if (!deletePassword) { setDeleteError("Entrez votre mot de passe."); return; }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const { EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      await user.delete();
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setDeleteError("Mot de passe incorrect.");
      } else {
        setDeleteError("Erreur. Réessayez.");
      }
    }
    setDeleteLoading(false);
  };
  const addVehicle = useCallback(() => {
    if (!name.trim()) return;
    if (vehicles.length >= maxVehicles) { setShowPremium(true); return; }
    const v = { id: Date.now(), name: name.trim(), immat: immat.trim().toUpperCase(), type, history: [], checks: {}, garage: { nom: "", tel: "" } };
    setVehicles(prev => [...prev, v]);
    setActive(v);
    setName(""); setImmat("");
    setTab("accueil");
  }, [name, immat, type]);

  const deleteVehicle = useCallback((id) => {
    const vehicle = allVehicles.find(v => v.id === id);
    if (vehicle?.isShared) return;
    setVehicles(prev => {
      const filtered = prev.filter(v => v.id !== id);
      const toSave = filtered.filter(v => !v.isShared).map(({ photo, ...v }) => v);
      save("vehicles", toSave);
      return filtered;
    });
    setActive(prev => prev?.id === id ? null : prev);
    // Supprimer docs et dépenses liés et sauvegarder immédiatement dans Firebase
    setDocs(prev => {
      const filtered = prev.filter(d => d.vehicleId !== id);
      save("docs", filtered, 0);
      return filtered;
    });
    setDepenses(prev => {
      const filtered = prev.filter(d => d.vehicleId !== id);
      save("depenses", filtered, 0);
      return filtered;
    });
  }, [allVehicles, save]);


  const leaveSharedVehicle = useCallback(async (vehicleId, ownerId) => {
    try {
      await removeSharedVehicle(userId, vehicleId, ownerId);
      setSharedVehicles(prev => prev.filter(v => !(v.id === vehicleId)));
      setActive(prev => prev?.id === vehicleId ? null : prev);
    } catch (e) {
      console.error("Erreur suppression partage:", e);
    }
  }, [userId]);

  const updateCheck = useCallback((itemId, newState) => {
    if (!active) return;
    const today = new Date().toLocaleDateString("fr-FR");
    const findLabel = (id) => {
      for (const item of checklist) {
        if (item.id === id) return item.label;
        if (item.group && item.items) {
          const sub = item.items.find(s => s.id === id);
          if (sub) return sub.label;
        }
      }
      return id;
    };
    const itemLabel = findLabel(itemId);
    const activeId = active.id;
    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id !== activeId) return v;
        const newChecks = { ...v.checks, [itemId]: newState };
        const history = [...(v.history || [])];
        const idx = history.findIndex(h => h.date === today);
        const action = { item: `${itemLabel} → ${newState}` };
        if (idx !== -1) {
          // Remplacer l'action existante pour cet item si elle existe déjà aujourd'hui
          const existingActionIdx = history[idx].actions.findIndex(a => a.item.startsWith(itemLabel + " →"));
          if (existingActionIdx !== -1) {
            const newActions = [...history[idx].actions];
            newActions[existingActionIdx] = action;
            history[idx] = { ...history[idx], actions: newActions };
          } else {
            history[idx] = { ...history[idx], actions: [...history[idx].actions, action] };
          }
        } else {
          history.push({ date: today, actions: [action] });
        }
        return { ...v, checks: newChecks, history };
      });
      const newActive = updated.find(v => v.id === activeId);
      if (newActive) setTimeout(() => setActive(newActive), 0);
      return updated;
    });
  }, [active, checklist]);

  const exportPDF = useCallback(async () => {
    if (!active) return;

    const certId   = `CHK-${active.id.toString().slice(-8).toUpperCase()}`;
    const pdfLoc   = lang === "en" ? "en-GB" : "fr-FR";
    const today    = new Date().toLocaleDateString(pdfLoc);
    const nowTime  = new Date().toLocaleTimeString(pdfLoc, { hour: "2-digit", minute: "2-digit" });
    const esc      = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const slugify  = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").toLowerCase();
    const isEn     = lang === "en";

    const TYPE_LABELS_EN = { voiture: "Car", moto: "Motorcycle" };
    const typeLabel = isEn ? (TYPE_LABELS_EN[active.type] || active.type || "") : (TYPE_LABELS[active.type] || active.type || "");
    const depGarage = depenses.filter(
      d => d.vehicleId === active.id && d.type === "general" && (d.categorie === "Garage" || d.categorie === "Contrôle technique")
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // ── Build garage intervention rows HTML ──────────────────────────────
    let rowIdx = 0;
    const CAT_EN_PDF = { "Garage": "Garage", "Contrôle technique": "MOT / Inspection", "Assurance": "Insurance", "Financement": "Financing", "Péage": "Toll", "Lavage": "Car wash", "Contravention": "Fine", "Parking": "Parking", "Général": "General" };
    const garageRowsHtml = depGarage.length === 0
      ? `<tr><td colspan="4" style="padding:16px;text-align:center;font-size:11px;color:#888">${isEn ? "No services recorded" : "Aucune intervention enregistrée"}</td></tr>`
      : depGarage.map(d => {
          const bg      = rowIdx++ % 2 === 0 ? "#ffffff" : "#f5f5f7";
          const sep     = "border-bottom:1px solid #ebebf0";
          const montant = (d.montant != null && d.montant !== "")
            ? Number(d.montant).toLocaleString(pdfLoc, { style: "currency", currency: "EUR" })
            : "—";
          const kmLabel = d.km ? Number(d.km).toLocaleString(pdfLoc) : "—";
          const rawDate = d.date || "";
          const fmtDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
            ? rawDate.split("-").reverse().join("/")
            : rawDate;
          const catLabel = isEn ? (CAT_EN_PDF[d.categorie] || d.categorie || "") : (d.categorie || "");
          const descLabel = d.description ? `${d.description}${catLabel ? ` — ${catLabel}` : ""}` : catLabel;
          return `<tr style="background:${bg}">
            <td style="padding:6px 10px;font-size:11px;color:#888;white-space:nowrap;text-align:left;${sep}">${esc(fmtDate)}</td>
            <td style="padding:6px 10px;font-size:11px;color:#555;text-align:center;white-space:nowrap;${sep}">${esc(kmLabel)}</td>
            <td style="padding:6px 10px;font-size:11px;color:#1c1c1e;text-align:left;${sep}">${esc(descLabel)}</td>
            <td style="padding:6px 10px;font-size:11px;font-weight:700;color:#1a9040;text-align:right;${sep}">${montant}</td>
          </tr>`;
        }).join("");

    // ── Build hidden HTML report div ─────────────────────────────────────
    const html = `
    <div style="width:794px;background:#fff;font-family:Helvetica,Arial,sans-serif;color:#1c1c1e;box-sizing:border-box">

      <div style="background:#0A0A1A;padding:20px 32px 0">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px">
          <div>
            <div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:3px">CHECKAR</div>
            <div style="font-size:12px;color:#a0a0bb;margin-top:5px">${isEn ? "Vehicle maintenance certificate" : "Certificat d'entretien véhicule"}</div>
            <div style="font-size:10px;color:#6666aa;margin-top:3px">${isEn ? `Generated on ${today} at ${nowTime}` : `Généré le ${today} à ${nowTime}`}</div>
          </div>
          <div style="text-align:right;padding-top:8px">
            <div style="font-size:12px;font-weight:700;color:#5566cc;font-family:monospace">${certId}</div>
          </div>
        </div>
        <div style="height:3px;background:#2157FF;margin:0 -32px"></div>
      </div>

      <div style="padding:22px 32px 0">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:22px;font-weight:900;color:#1c1c1e">${esc(active.name)}</div>
          ${active.immat ? `<span style="background:#f0f0f5;border-radius:4px;padding:2px 10px;font-size:12px;font-weight:700;color:#1c1c1e">${esc(active.immat)}</span>` : ""}
          ${active.km ? `<span style="font-size:12px;color:#888;font-weight:600;margin-left:auto">${parseInt(active.km).toLocaleString(pdfLoc)} ${isEn ? "Miles" : "km"}</span>` : ""}
        </div>
        <div style="height:1px;background:#e0e0e8;margin:14px 0 0"></div>
      </div>

      <div style="padding:0 32px 20px">
        <div style="font-size:9px;font-weight:800;color:#999;letter-spacing:1.5px;margin-bottom:8px">${isEn ? "GARAGE & MOT / INSPECTION" : "GARAGE & CONTRÔLE TECHNIQUE"}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e8">
          <thead>
            <tr style="background:#eeeeF5">
              <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#666;text-align:left;width:80px">DATE</th>
              <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#666;text-align:center;width:70px">${isEn ? "MILES" : "KM"}</th>
              <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#666;text-align:left">DESCRIPTION</th>
              <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#666;text-align:right;width:90px">${isEn ? "AMOUNT" : "MONTANT"}</th>
            </tr>
          </thead>
          <tbody>${garageRowsHtml}</tbody>
        </table>
      </div>

      <div style="margin:4px 32px 20px;border:2px solid #1a9040;border-radius:10px;padding:16px 20px;text-align:center">
        <div style="font-size:16px;font-weight:900;color:#1a9040;letter-spacing:1.5px">✓  ${lang === "en" ? "CERTIFIED BY CHECKAR" : "CERTIFIÉ CHECKAR"}</div>
        <div style="font-size:10px;color:#5a9a6a;margin-top:7px">${certId}  ·  ${today} ${isEn ? "at" : "à"} ${nowTime}</div>
      </div>

      <div style="padding:12px 32px 28px;border-top:1px solid #ebebf0;text-align:center">
        <div style="font-size:10px;color:#aaa">${isEn ? "Generated by" : "Généré par"} <b style="color:#2157FF">CHECKAR</b> · ${isEn ? "Smart maintenance logbook" : "Carnet d'entretien intelligent"}</div>
      </div>

    </div>`;

    // ── Mount off-screen, capture, slice into pages ──────────────────────
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:absolute;left:-9999px;top:0;";
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper.firstElementChild, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const PDF_W = 210;
      const PDF_H = 297;
      const mmPerPx   = PDF_W / canvas.width;
      const pageH_px  = Math.floor(PDF_H / mmPerPx);

      const pdfdoc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      let srcY = 0;
      let page = 0;
      while (srcY < canvas.height) {
        const sliceH = Math.min(pageH_px, canvas.height - srcY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width  = canvas.width;
        pageCanvas.height = pageH_px;
        const ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, pageH_px);
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (page > 0) pdfdoc.addPage();
        pdfdoc.addImage(pageCanvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, PDF_W, PDF_H);
        srcY += pageH_px;
        page++;
      }

      pdfdoc.save(`checkar-${slugify(active.name)}-${today.split("/").join("-")}.pdf`);
    } finally {
      document.body.removeChild(wrapper);
    }
  }, [active, depenses]);

  const handleSaveGarage = useCallback((info) => {
    if (!active) return;
    setVehicles(prev => {
      const updated = prev.map(v => v.id === active.id ? { ...v, garage: info } : v);
      setActive(updated.find(v => v.id === active.id) ?? null);
      return updated;
    });
  }, [active]);

  if (showSplash) return <SplashScreen fading={splashFading} />;

  if (authLoading) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14, fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>
        ⏳ Chargement...
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif", position: "relative", paddingBottom: 100 }}>

      {/* About Modal */}
      {showAbout && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "relative", background: "#1a1a1a", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, opacity: 0.08, pointerEvents: "none", userSelect: "none" }}>
              {lang === "fr" ? "🇫🇷" : "🇬🇧"}
            </div>
            <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.34)", borderRadius: 18, padding: 18 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🚗</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>CHECKAR</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{t.version || "Version"} 1.0.0</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.carnetEntretien || "Carnet d'entretien intelligent"}</div>
            </div>
            <div style={{ background: "#2a2a2f", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{t.compteConnecte || "Compte connecté"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user?.email}</div>
            </div>
            <div style={{ background: "#2a2a2f", borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>LANGUE</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { if (lang !== "fr") { if (isPremium) toggleLang(); else setShowPremium(true); } }} style={{ flex: 1, backgroundImage: "linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url(https://flagcdn.com/w320/fr.png)", backgroundSize: "cover", backgroundPosition: "center", border: `3px solid ${lang === "fr" ? "#fff" : "transparent"}`, borderRadius: 12, padding: "20px 0", cursor: "pointer", transition: "all 0.2s", opacity: lang === "fr" ? 1 : 0.45, boxShadow: lang === "fr" ? "0 0 0 2px #ffffff88, 0 4px 20px rgba(0,35,149,0.5)" : "none", color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.5, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                  🇫🇷 Français
                </button>
                <button onClick={() => { if (lang !== "en") { if (isPremium) toggleLang(); else setShowPremium(true); } }} style={{ flex: 1, backgroundImage: "linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url(https://flagcdn.com/w320/gb.png)", backgroundSize: "cover", backgroundPosition: "center", border: `3px solid ${lang === "en" ? "#fff" : "transparent"}`, borderRadius: 12, padding: "20px 0", cursor: "pointer", transition: "all 0.2s", opacity: lang === "en" ? 1 : 0.45, boxShadow: lang === "en" ? "0 0 0 2px #ffffff88, 0 4px 20px rgba(1,33,105,0.5)" : "none", color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.5, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                  🇬🇧 English
                </button>
              </div>
              {!isPremium && <div style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: "center" }}>{t.disponiblePremium || "🔒 Disponible avec Premium"}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => { if (isPremium) { setShowShare(true); setShowAbout(false); } else { setShowPremium(true); } }} style={{ flex: 1, background: "rgba(33,87,255,0.1)", border: "1px solid rgba(33,87,255,0.2)", borderRadius: 12, padding: 12, color: isPremium ? C.blue : C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                {isPremium ? `👨‍👩‍👧 ${t.famille || "Famille"}` : `🔒 ${t.famille || "Famille"}`}
              </button>
            </div>
            {/* PWA install — Ultra only */}
            {isUltra && deferredInstall && (
              <button onClick={() => { deferredInstall.prompt(); deferredInstall.userChoice.then(() => setDeferredInstall(null)); }} style={{ width: "100%", background: "rgba(33,87,255,0.1)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 12, padding: 14, color: C.blue, cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {t.installerApp || "📲 Installer l'app sur le téléphone"}
              </button>
            )}
            {!isUltra && (
              <button onClick={() => { setShowPremium(true); setShowAbout(false); }} style={{ width: "100%", background: "rgba(191,90,242,0.1)", border: "1px solid rgba(191,90,242,0.3)", borderRadius: 12, padding: 14, color: "#bf5af2", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {t.installerAppUltra || "💎 Installer l'app (Ultra)"}
              </button>
            )}

            {/* Notifications push — Ultra only */}
            {isUltra ? (
              <button onClick={() => {
                if (!("Notification" in window)) return;
                Notification.requestPermission().then(p => setNotifStatus(p));
              }} style={{ width: "100%", background: "rgba(33,87,255,0.08)", border: "1px solid rgba(33,87,255,0.2)", borderRadius: 12, padding: 14, color: notifStatus === "granted" ? "#89fc68" : C.blue, cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {notifStatus === "granted" ? (t.notifActivees || "🔔 Notifications activées ✓") : (t.activerNotif || "🔔 Activer les notifications")}
              </button>
            ) : (
              <button onClick={() => { setShowPremium(true); setShowAbout(false); }} style={{ width: "100%", background: "rgba(191,90,242,0.08)", border: "1px solid rgba(191,90,242,0.2)", borderRadius: 12, padding: 14, color: "#bf5af2", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {t.notifPushUltra || "💎 Notifications push (Ultra)"}
              </button>
            )}

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{ width: "100%", background: "rgba(252,63,53,0.1)", border: "1px solid rgba(252,63,53,0.3)", borderRadius: 12, padding: 14, color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {t.supprimerCompte || "🗑️ Supprimer mon compte"}
              </button>
            ) : (
              <div style={{ background: "rgba(252,63,53,0.1)", border: "1px solid rgba(252,63,53,0.3)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.red, marginBottom: 8 }}>{t.confirmerSuppression || "⚠️ Confirmer la suppression"}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{t.actionIrreversibleMdp || "Cette action est irréversible. Entrez votre mot de passe pour confirmer."}</div>
                <input
                  type="password"
                  placeholder={t.votreMdp || "Votre mot de passe"}
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 13, boxSizing: "border-box", marginBottom: 8, outline: "none" }}
                />
                {deleteError && <div style={{ fontSize: 12, color: C.red, marginBottom: 8 }}>{deleteError}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }} style={{ flex: 1, background: "#2a2a2f", border: "none", borderRadius: 10, padding: 10, color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{t.annuler || "Annuler"}</button>
                  <button onClick={deleteAccount} disabled={deleteLoading} style={{ flex: 1, background: C.red, border: "none", borderRadius: 10, padding: 10, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 12, opacity: deleteLoading ? 0.7 : 1 }}>
                    {deleteLoading ? "⏳..." : (t.supprimer || "🗑️ Supprimer")}
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => {
              const shareData = { title: "CHECKAR", text: t.partagerAppTexte || "L'appli carnet d'entretien pour ton véhicule 🚗", url: window.location.origin };
              if (navigator.share) {
                navigator.share(shareData);
              } else {
                navigator.clipboard.writeText(window.location.origin).then(() => {
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                });
              }
            }} style={{ width: "100%", background: "rgba(33,87,255,0.1)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 12, padding: 14, color: C.blue, cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
              {shareCopied ? (t.lienCopie || "✅ Lien copié !") : (t.partagerApp || "🔗 Partager l'app")}
            </button>
            <a href="mailto:contact@checkapp-studio.fr" style={{ display: "block", width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 10, color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
              ✉️ contact@checkapp-studio.fr
            </a>
            <button onClick={() => { setShowAbout(false); setTab("cgu"); }} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 10, color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              {t.cguPolitique || "📄 CGU & Politique de confidentialité"}
            </button>
            <button onClick={() => setShowAbout(false)} style={{ width: "100%", background: C.blue, border: "none", borderRadius: 12, padding: 14, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              {t.fermer || "Fermer"}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Tutoriel premier lancement */}
      {showTuto && <TutoScreen onClose={() => {
        localStorage.setItem("tuto_seen", "1");
        setShowTuto(false);
      }} lang={lang} />}

      {/* PremiumScreen */}
      {showPremium && <PremiumScreen onClose={() => setShowPremium(false)} t={t} />}

      {/* ShareScreen */}
      {showShare && (
        <ShareScreen
          active={active}
          userId={userId}
          onClose={() => setShowShare(false)}
          onVehicleJoined={() => {
            load().then(data => {
              if (data?.vehicles) {
                const vs = JSON.parse(data.vehicles);
                setVehicles(vs.map(v => ({ ...v, photo: localStorage.getItem("photo_" + v.id) || null })));
              }
            });
          }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ padding: "16px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, background: "#000000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>
          {tab === "secours" ? t.secours : t[tab] || TABS.find(t => t.id === tab)?.label}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: C.muted }}>{syncStatus}</span>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 22 }}>🔔</span>
            {alertCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: C.red, color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{alertCount}</span>
            )}
          </div>
          <button onClick={() => setShowPremium(true)} title="Premium" style={{ background: "linear-gradient(135deg, #bf5af2, #8b5cf6)", border: "none", borderRadius: 8, padding: "5px 9px", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>💎</button>
          <button onClick={() => setShowAbout(true)} title={t.aPropos || "À propos"} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 9px", color: C.text, cursor: "pointer", fontSize: 14 }}>ℹ️</button>
          <button onClick={() => logoutUser()} title="Déconnexion" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "5px 9px", color: C.red, cursor: "pointer", fontSize: 14 }}>⏏</button>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div ref={contentRef} style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
        {tab === "accueil" && (
          <AccueilScreen
            vehicles={allVehicles} setVehicles={setVehicles} active={active} setActive={setActive} setTab={setTab}
            name={name} setName={setName} immat={immat} setImmat={setImmat}
            type={type} setType={setType} addVehicle={addVehicle} deleteVehicle={deleteVehicle}
            leaveSharedVehicle={leaveSharedVehicle}
            docs={docs} prog={prog} t={t}
            setDocTab={setDocTab}
            isPremium={isPremium} maxVehicles={maxVehicles} onShowPremium={() => setShowPremium(true)}
          />
        )}
        {tab === "checklist" && (
          <ChecklistScreen active={active} checklist={checklist} prog={prog} updateCheck={updateCheck} setTab={setTab} t={t} isPremium={isPremium} onShowPremium={() => setShowPremium(true)} />
        )}
        {tab === "documents" && (
          <DocumentsScreen
            vehicles={allVehicles} active={active} setActive={setActive}
            docTab={docTab} setDocTab={setDocTab}
            docs={docs} setDocs={setDocs}
            localInvoices={localInvoices} setLocalInvoices={setLocalInvoices}
            garageInfo={garageInfo} onSaveGarage={handleSaveGarage} t={t}
          />
        )}
        {tab === "depenses" && (
          <DepensesScreen active={active} vehicles={allVehicles} setVehicles={setVehicles} setActive={setActive} depenses={depenses} setDepenses={setDepenses} t={t} isPremium={isPremium} isUltra={isUltra} onShowPremium={() => setShowPremium(true)} />
        )}
        {tab === "historique" && (
          <HistoriqueScreen active={active} vehicles={allVehicles} setActive={setActive} depenses={depenses} t={t} isPremium={isPremium} isUltra={isUltra} onShowPremium={() => setShowPremium(true)} />
        )}
        {tab === "rapport" && (
          <RapportScreen active={active} checklist={checklist} prog={prog} docs={docs} exportPDF={exportPDF} localInvoices={localInvoices} depenses={depenses} t={t} isPremium={isPremium} onShowPremium={() => setShowPremium(true)} userId={userId} />
        )}
        {tab === "secours" && (
          <SecoursScreen active={active} setTab={setTab} docs={docs} t={t} />
        )}
        {tab === "cgu" && (
          <CGUScreen onClose={() => setTab("accueil")} lang={lang} />
        )}
        {tab === "confidentialite" && (
          <CGUScreen onClose={() => setTab("accueil")} showPrivacy={true} lang={lang} />
        )}
      </div>

      {/* ── Nav bar ── */}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#000000", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around", padding: "10px 0 18px", zIndex: 100 }}>
        {TABS.map(tab2 => {
          const on = tab === tab2.id;
          return (
            <button key={tab2.id} onClick={() => setTab(tab2.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", flex: 1, border: "none", background: "transparent", padding: "4px 0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: on ? C.blue : "#3A3A40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: on ? `0 4px 16px ${C.blue}66` : "none", transition: "all 0.2s" }}>{tab2.icon}</div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.3, color: on ? C.blue : "#8e8e93" }}>{(t[tab2.id] || tab2.label).toUpperCase()}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
