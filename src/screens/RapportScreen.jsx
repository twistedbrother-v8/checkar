import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { TYPE_LABELS } from "../config/data";
import { C, card, btn } from "./shared";
import { saveCertificat, loadFacturePhotos } from "../config/firestore";

async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("fetch failed");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxPx = 350;
          const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.45));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("[CERT] fetch image failed:", e.message);
    return null;
  }
}

export function RapportScreen({ active, checklist, prog, docs, exportPDF, localInvoices, depenses, t = {}, isPremium = true, onShowPremium, userId }) {
  const certId    = active ? `CHK-${active.id.toString().slice(-8).toUpperCase()}` : null;
  const publicUrl = certId ? `https://checkar.checkapp-studio.fr/certificat.html?id=${certId}` : null;

  const [showRappels, setShowRappels] = useState(false);

  useEffect(() => {
    if (!active || !certId) return;
    const depGarageNow = (depenses || []).filter(
      d => d.vehicleId === active.id && d.type === "general" && d.categorie === "Garage"
    );
    if (depGarageNow.length === 0) return;
    const today = new Date().toLocaleDateString("fr-FR");

    const doSave = async () => {
      const photos = await loadFacturePhotos(userId);
      console.log("[CERT] userId utilisé:", userId);
      console.log("[CERT] photos chargées:", photos.length, photos.map(p => ({ id: p.id, url: p.url?.substring(0, 50), categorie: p.categorie, vehicleId: p.vehicleId })));

      const factures_garage_raw = await Promise.all(
        photos
          .filter(p => p.vehicleId === active.id && p.categorie === "Garage" && p.url)
          .map(async (p) => {
            const thumb = await urlToBase64(p.url);
            return thumb ? { factureId: String(p.id || Date.now()), image: thumb, date: p.date || "" } : null;
          })
      );
      const factures_garage = factures_garage_raw.filter(Boolean);
      console.log("[CERT] factures_garage compressées:", factures_garage.length);

      const travaux = depGarageNow.map(d => ({
        date: d.date,
        desc: d.description || d.categorie,
        montant: d.montant,
        km: d.km || "",
        photoUrl: typeof d.photoUrl === "string" && d.photoUrl.startsWith("http") ? d.photoUrl : "",
      }));

      saveCertificat(certId, {
        vehicleName: active.name,
        vehicleImmat: active.immat || "",
        vehicleId: active.id,
        nbInterventions: depGarageNow.length,
        date: today,
        url: publicUrl,
        travaux,
        factures_garage,
      });
    };
    doSave();
  }, [active, depenses, certId, publicUrl]);

  if (!active) return (
    <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
      <div style={{ fontWeight: 600 }}>{t.choisirVehicule || "Choisis un véhicule depuis l'accueil"}</div>
    </div>
  );

  const vals       = Object.values(active.checks || {});
  const today      = new Date().toLocaleDateString("fr-FR");
  const history    = active.history || [];
  const depGarage  = (depenses || []).filter(
    d => d.vehicleId === active.id && d.type === "general" && d.categorie === "Garage"
  );

  // Docs de rappel — même filtre que AccueilScreen, dédupliqués par type
  const seen = new Map();
  const reportDocs = docs
    .filter(d => d.vehicleId === active.id)
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
    .filter(d => { if (seen.has(d.type)) return false; seen.set(d.type, true); return true; });

  const docLabel = d =>
    d.type === "assurance" ? (t.assurance?.replace("🛡️ ", "") || d.label) :
    d.type === "controle"  ? (t.controleTechnique?.replace("🚗 ", "") || d.label) :
    d.type === "revision"  ? (t.revision || d.label) : d.label;

  const docColor = d => {
    if (d.type === "revision" && d.km) {
      const diff = parseInt(d.km) - (parseInt(active?.km) || 0);
      return diff <= 0 ? C.red : diff <= 2000 ? C.yellow : C.green;
    }
    return d.days <= 0 ? C.red : d.days <= 15 ? C.red : d.days <= 30 ? C.yellow : C.green;
  };

  const docValue = (d) => {
    if (d.type === "revision" && d.km) {
      const diff = parseInt(d.km) - (parseInt(active?.km) || 0);
      return diff <= 0 ? (t.revisionDue || "Révision due !") : `${diff.toLocaleString()} ${t.unitKm || "km"}`;
    }
    return d.days <= 0 ? (t.expire || "Expiré") : `${t.dans || "Dans"} ${d.days} ${t.jours || "j"}`;
  };

  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100vh" }}>

      {/* ── VÉHICULE ── */}
      <div style={card({ padding: "14px 16px", marginBottom: 10 })}>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.text }}>{active.name}</div>
        {(active.immat || active.type) && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 5, display: "flex", alignItems: "center", gap: 8 }}>
            {active.immat && (
              <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 10px", fontWeight: 700, color: C.text }}>
                {active.immat}
              </span>
            )}
            {active.type && <span style={{ color: C.muted2 }}>{TYPE_LABELS[active.type]}</span>}
          </div>
        )}
      </div>

      {/* ── STATISTIQUES ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[
          { label: t.ok || "OK",           count: prog.ok,                                      color: C.green,  bg: "rgba(137,252,104,0.08)", border: "rgba(137,252,104,0.25)" },
          { label: t.bientot || "BIENTÔT", count: vals.filter(v => v === "BIENTOT").length,     color: C.yellow, bg: "rgba(255,177,51,0.08)",  border: "rgba(255,177,51,0.25)"  },
          { label: t.probleme || "PROBLÈME", count: prog.problems,                                 color: C.red,    bg: "rgba(252,63,53,0.08)",   border: "rgba(252,63,53,0.25)"   },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.8, marginTop: 4, letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── À NE PAS OUBLIER — bloc dark cliquable ── */}
      {(
        <div
          onClick={() => setShowRappels(true)}
          style={{ ...card({ padding: "14px 16px", marginBottom: 10 }), cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted2, letterSpacing: 0.5 }}>{t.aNePasOublier || "📅 À NE PAS OUBLIER"}</div>
            <span style={{ fontSize: 16, color: C.muted }}>›</span>
          </div>
          {reportDocs.map((d, i) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 10 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.icon} {docLabel(d)}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: docColor(d) }}>
                  {docValue(d)}
                </div>
                {d.date && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{(d.type === "revision" && d.km && t.unitKm === "Miles") ? `${parseInt(d.km).toLocaleString()} Miles` : d.date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL À NE PAS OUBLIER ── */}
      {showRappels && (
        <div
          onClick={() => setShowRappels(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#1a1a22", borderRadius: 24, padding: 24, width: "100%", maxWidth: 420, border: `1px solid ${C.border}`, marginBottom: 8 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>📅 {t.aNePasOublier || "À ne pas oublier"}</div>
              <button
                onClick={() => setShowRappels(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 20, width: 32, height: 32, color: C.muted2, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>

            {reportDocs.map((d, i) => (
              <div
                key={d.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < reportDocs.length - 1 ? `1px solid ${C.border}` : "none" }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{d.icon} {docLabel(d)}</div>
                  {d.date && <div style={{ fontSize: 12, color: C.muted }}>{(d.type === "revision" && d.km && t.unitKm === "Miles") ? `${parseInt(d.km).toLocaleString()} Miles` : d.date}</div>}
                </div>
                <div style={{ background: docColor(d) + "18", border: `1px solid ${docColor(d)}44`, borderRadius: 10, padding: "5px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: docColor(d) }}>
                    {docValue(d)}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowRappels(false)}
              style={{ marginTop: 20, width: "100%", background: C.blue, border: "none", borderRadius: 14, padding: "14px 0", color: "white", cursor: "pointer", fontSize: 15, fontWeight: 700, boxShadow: `0 4px 16px ${C.blue}44` }}
            >
              {t.fermer || "Fermer"}
            </button>
          </div>
        </div>
      )}

      {/* ── BOUTON PDF ── */}
      {isPremium
        ? <button style={btn({ marginBottom: 12 })} onClick={exportPDF}>
            {t.telechargerPDF || "📄 Télécharger le rapport (PDF)"}
          </button>
        : <button style={btn({ background: C.purple, boxShadow: `0 4px 20px ${C.purple}55`, marginBottom: 12 })} onClick={() => onShowPremium?.()}>
            🔒 Export PDF — Premium requis
          </button>
      }

      {/* ── CERTIFICAT D'ENTRETIEN ── */}
      {(history.length > 0 || depGarage.length > 0) && (
        <div style={{ background: "linear-gradient(135deg, #1a2a1a, #0a1a0a)", border: "2px solid #22ff0044", borderRadius: 20, padding: 20, marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#22ff00", letterSpacing: 2, marginBottom: 4 }}>{t.certificatEntretien || "🔗 CERTIFICAT D'ENTRETIEN"}</div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 16 }}>{t.poweredBy || "Powered by CHECKAR — Bientôt sur Blockchain"}</div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ background: "white", padding: 10, borderRadius: 14, border: "2px solid #22ff0033" }}>
              <QRCodeSVG value={publicUrl} size={140} bgColor="#ffffff" fgColor="#0a0a0a" />
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{t.idCertificat || "ID CERTIFICAT"}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#22ff00", letterSpacing: 2, fontFamily: "monospace" }}>{certId}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#22ff00" }}>{depGarage.length}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{t.interventionsGarage || "Interventions garage"}</div>
            </div>
            <div style={{ width: 1, background: "#22ff0022" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#22ff00", marginTop: 4 }}>{today}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{t.genereLe || "Généré le"}</div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
            {t.scanQR || "Scannez ce QR code pour voir l'historique complet des interventions"}
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: (t.certificatEntretien || "Certificat entretien") + " " + active.name,
                  text: (t.voiciCertificat || "Voici le certificat d'entretien de mon véhicule ") + (active.immat || active.name),
                  url: publicUrl,
                });
              } else {
                navigator.clipboard.writeText(publicUrl).then(() => alert(t.lienCopie || "Lien copié !"));
              }
            }}
            style={{
              marginTop: 14, width: "100%", padding: "13px 0",
              background: "#22ff0022", border: "2px solid #22ff0066",
              borderRadius: 14, color: "#22ff00",
              fontSize: 14, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              letterSpacing: 0.5,
            }}
          >
            {t.partagerCertificat || "📤 Partager le certificat"}
          </button>
        </div>
      )}

    </div>
  );
}
