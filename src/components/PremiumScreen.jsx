// src/components/PremiumScreen.jsx
import React from "react";

const C = {
  bg:      "#000000",
  surface: "#1a1a1a",
  surface2:"#2a2a2f",
  border:  "rgba(255,255,255,0.08)",
  blue:    "#2157FF",
  text:    "#ffffff",
  muted:   "#8e8e93",
  green:   "#89fc68",
  yellow:  "#ffb133",
  red:     "#fc3f35",
  purple:  "#bf5af2",
};

export default function PremiumScreen({ onClose, t = {} }) {

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      emoji: "🆓",
      color: C.muted,
      price: { monthly: "0€", yearly: "0€" },
      features: [
        "1 véhicule",
        "Checklist complète",
        "Documents & rappels",
        "Bouton secours 🆘",
        "Dépenses — mois en cours",
        "Statistiques — mois en cours",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      emoji: "🔒",
      color: C.blue,
      price: { monthly: "2,99€", yearly: "19,99€" },
      popular: true,
      features: [
        "Jusqu'à 3 véhicules",
        "Multilingue FR/EN (auto) 🌍",
        "Diagnostic voyants IA 🔍",
        "Dépenses & km — 3 mois",
        "Historique — 3 mois",
        "Partage familial par code 👨‍👩‍👧",
        "Export PDF 📄",
        "Statistiques — 3 mois",
      ],
    },
    {
      id: "ultra",
      name: "Ultra Premium",
      emoji: "💎",
      color: C.purple,
      price: { monthly: "4,99€", yearly: "34,99€" },
      features: [
        "Véhicules illimités",
        "Tout du Premium +",
        "PWA installable 📲",
        "Notifications push 🔔",
        "Dépenses & km illimité",
        "Historique illimité",
        "Export PDF + Scanner OCR 📷",
        "Diagnostic OBD2 🔌",
        "Support prioritaire ⚡ (24h)",
        "Statistiques — 1 an",
      ],
    },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, zIndex: 999, overflowY: "auto",
      fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
      color: C.text, maxWidth: 430, margin: "0 auto",
    }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>Choisir un plan</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Passez à la vitesse supérieure 🚀</div>
        </div>
        <button onClick={onClose} style={{ background: C.surface2, border: "none", borderRadius: 10, padding: "8px 14px", color: C.muted, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>✕</button>
      </div>

      <div style={{ padding: "16px 20px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            background: plan.popular ? `linear-gradient(135deg, ${C.blue}22, ${C.blue}11)` : plan.id === "ultra" ? `linear-gradient(135deg, ${C.purple}18, ${C.purple}08)` : C.surface,
            border: `2px solid ${plan.popular ? C.blue : plan.id === "ultra" ? C.purple : "rgba(255,255,255,0.06)"}`,
            borderRadius: 20, padding: 20, position: "relative",
          }}>
            {plan.popular && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.blue, color: "white", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                ⭐ LE PLUS POPULAIRE
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: plan.color, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{plan.emoji} {plan.name.toUpperCase()}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.text }}>
                  {plan.price.monthly}
                  {plan.id !== "free" && <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>/mois</span>}
                </div>
                {plan.id !== "free" && (
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginTop: 4 }}>
                    ou {plan.price.yearly}/an <span style={{ background: C.green, color: "#000", borderRadius: 20, padding: "1px 6px", fontSize: 10, fontWeight: 900 }}>-44%</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: plan.id === "free" ? C.muted : plan.color, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: plan.id === "free" ? C.muted : C.text }}>{f}</span>
                </div>
              ))}
            </div>
            {plan.id !== "free" && (
              <button style={{
                width: "100%", border: "none", borderRadius: 14, padding: "14px 0",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
                background: plan.id === "ultra" ? `linear-gradient(135deg, ${C.purple}, #8b5cf6)` : C.blue,
                color: "white",
                boxShadow: plan.id === "ultra" ? `0 4px 20px ${C.purple}55` : `0 4px 20px ${C.blue}55`,
              }}>
                {plan.id === "premium" ? "Passer Premium 🔒" : "Passer Ultra Premium 💎"}
              </button>
            )}
            {plan.id === "free" && (
              <div style={{ textAlign: "center", fontSize: 12, color: C.muted, padding: "10px 0" }}>Votre plan actuel</div>
            )}
          </div>
        ))}

        <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.purple}33` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, marginBottom: 6 }}>⚡ Support prioritaire Ultra Premium</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Réponse garantie sous 24h par email. Nos équipes traitent vos demandes en priorité absolue.
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          Paiement sécurisé · Sans engagement · Résiliable à tout moment
        </div>
      </div>
    </div>
  );
}
