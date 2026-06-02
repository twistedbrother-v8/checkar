import React from "react";

const features = [
  { icon: "✅", title: "Checklist intelligente", desc: "Vérifiez l'état de votre véhicule point par point." },
  { icon: "📄", title: "Dossiers & documents", desc: "Assurance, contrôle technique, garage — tout en un." },
  { icon: "💰", title: "Suivi des dépenses", desc: "Carburant, entretien, coût au km en temps réel." },
  { icon: "📊", title: "Rapports & certificats", desc: "PDF téléchargeable avec QR code d'authenticité." },
  { icon: "🆘", title: "Bouton de secours", desc: "Procédure accident, numéros d'urgence, services proches." },
  { icon: "🔍", title: "Diagnostic IA — Voyants", desc: "Photo du tableau de bord → analyse instantanée." },
];

const plans = [
  { label: "Gratuit", color: "#64748b", features: ["1 véhicule", "Checklist complète", "Documents & rappels", "Dépenses du mois", "Bouton secours 🆘"] },
  { label: "Premium", color: "#2157FF", badge: "⭐ Populaire", features: ["Jusqu'à 3 véhicules", "Historique 3 mois", "Rapport PDF", "Partage familial", "Multilingue FR/EN"] },
  { label: "Ultra", color: "#bf5af2", badge: "💎 Complet", features: ["Véhicules illimités", "Historique 1 an", "Scanner OCR factures", "Notifications push", "Diagnostic IA voyants"] },
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "-apple-system,'SF Pro Display','Segoe UI',sans-serif", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(170deg, #0a0e1a 60%, #111827)", padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🚗</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#2157FF", letterSpacing: 3, marginBottom: 8 }}>CHECKAR</div>
        <div style={{ fontSize: 16, color: "#a0a0bb", lineHeight: 1.6, marginBottom: 28 }}>
          Le carnet d'entretien intelligent<br />pour votre véhicule 🚗
        </div>
        <button
          onClick={onGetStarted}
          style={{ background: "#2157FF", border: "none", borderRadius: 18, padding: "16px 40px", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(33,87,255,0.5)", letterSpacing: 0.5 }}
        >
          Commencer gratuitement →
        </button>
        <div style={{ fontSize: 12, color: "#5566aa", marginTop: 12 }}>Sans carte bancaire · Gratuit pour toujours</div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: "32px 16px 8px" }}>
        <div style={{ fontSize: 11, color: "#5566aa", fontWeight: 800, letterSpacing: 2, textAlign: "center", marginBottom: 20 }}>FONCTIONNALITÉS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 12px" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLANS ── */}
      <div style={{ padding: "32px 16px 8px" }}>
        <div style={{ fontSize: 11, color: "#5566aa", fontWeight: 800, letterSpacing: 2, textAlign: "center", marginBottom: 20 }}>NOS PLANS</div>
        {plans.map(p => (
          <div key={p.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p.color}44`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: p.color }}>{p.label}</div>
              {p.badge && <span style={{ background: p.color + "22", color: p.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{p.badge}</span>}
            </div>
            {p.features.map(feat => (
              <div key={feat} style={{ fontSize: 12, color: "#a0a0bb", marginBottom: 5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: p.color, fontSize: 10 }}>✓</span> {feat}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── CTA BAS ── */}
      <div style={{ padding: "32px 24px 48px", textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Prêt à prendre soin de votre véhicule ?</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Rejoignez les conducteurs qui font confiance à CHECKAR.</div>
        <button
          onClick={onGetStarted}
          style={{ background: "linear-gradient(135deg, #2157FF, #4f8ef7)", border: "none", borderRadius: 18, padding: "16px 40px", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(33,87,255,0.4)", width: "100%" }}
        >
          Créer mon compte →
        </button>
        <div style={{ fontSize: 11, color: "#5566aa", marginTop: 10 }}>contact@checkapp-studio.fr</div>
      </div>

    </div>
  );
}
