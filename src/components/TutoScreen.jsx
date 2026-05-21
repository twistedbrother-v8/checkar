// src/components/TutoScreen.jsx
import React, { useState } from "react";

const C = {
  bg:      "#000000",
  surface: "#1a1a1a",
  blue:    "#2157FF",
  text:    "#ffffff",
  muted:   "#8e8e93",
  green:   "#89fc68",
  yellow:  "#ffb133",
  red:     "#fc3f35",
};

const stepsFR = [
  { emoji: "🚗", title: "Bienvenue sur CHECKAR !", desc: "Votre carnet d'entretien intelligent. Gardez votre véhicule en parfait état en quelques minutes.", color: "#2157FF" },
  { emoji: "✅", title: "Faites votre checklist", desc: "Vérifiez l'état de votre véhicule point par point — huile, pneus, freins, éclairage... La barre verte vous indique l'état général.", color: "#89fc68" },
  { emoji: "📄", title: "Gérez vos documents", desc: "Enregistrez votre assurance et contrôle technique. L'app vous rappelle automatiquement avant les échéances.", color: "#ffb133" },
  { emoji: "💰", title: "Suivez vos dépenses", desc: "Notez vos pleins et dépenses garage. L'app calcule automatiquement votre consommation et coût au km.", color: "#f97316" },
  { emoji: "🆘", title: "Le bouton SOS", desc: "En cas d'accident, accédez en un clic à la procédure d'urgence, guide constat et services proches.", color: "#fc3f35" },
  { emoji: "🔗", title: "Certificat & QR Code", desc: "Chaque véhicule génère automatiquement un certificat d'entretien avec QR code. Partagez-le en un clic avec votre garagiste ou lors d'une vente — il contient toutes vos interventions et photos de factures.", color: "#22ff00" },
  { emoji: "🚀", title: "C'est parti !", desc: "Commencez par ajouter votre véhicule. En moins de 2 minutes votre carnet est prêt !", color: "#2157FF" },
];

const stepsEN = [
  { emoji: "🚗", title: "Welcome to CHECKAR!", desc: "Your smart maintenance logbook. Keep your vehicle in perfect condition in just a few minutes.", color: "#2157FF" },
  { emoji: "✅", title: "Run your checklist", desc: "Check your vehicle point by point — oil, tyres, brakes, lights... The green bar shows the overall status.", color: "#89fc68" },
  { emoji: "📄", title: "Manage your documents", desc: "Store your insurance and MOT details. The app automatically reminds you before deadlines.", color: "#ffb133" },
  { emoji: "💰", title: "Track your expenses", desc: "Log your fuel fill-ups and garage costs. The app automatically calculates your consumption and cost per km.", color: "#f97316" },
  { emoji: "🆘", title: "SOS button", desc: "In case of an accident, access the emergency procedure, accident report guide and nearby services in one tap.", color: "#fc3f35" },
  { emoji: "🔗", title: "Certificate & QR Code", desc: "Each vehicle automatically generates a maintenance certificate with a QR code. Share it instantly with your garage or when selling — it includes all your service history and invoice photos.", color: "#22ff00" },
  { emoji: "🚀", title: "Let's go!", desc: "Start by adding your vehicle. Your logbook will be ready in less than 2 minutes!", color: "#2157FF" },
];

export default function TutoScreen(props) {
  const steps = props.lang === "en" ? stepsEN : stepsFR;
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const en = props.lang === "en";

  const handleClose = () => {
    if (typeof props.onClose === "function") {
      props.onClose();
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>
      <div style={{ background: C.surface, borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, border: `1px solid ${current.color}33`, boxShadow: `0 0 40px ${current.color}22` }}>

        {/* Indicateurs */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, transition: "all 0.3s", background: i === step ? current.color : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>

        {/* Contenu */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>{current.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 12 }}>{current.title}</div>
          <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{current.desc}</div>
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 14, color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              {en ? "← Back" : "← Retour"}
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                handleClose();
              } else {
                setStep(s => s + 1);
              }
            }}
            style={{ flex: 2, background: current.color, border: "none", borderRadius: 14, padding: 14, color: current.color === "#89fc68" || current.color === "#ffb133" ? "#000" : "white", cursor: "pointer", fontWeight: 800, fontSize: 14, boxShadow: `0 4px 20px ${current.color}55` }}
          >
            {isLast ? (en ? "🚀 Let's go!" : "🚀 Commencer !") : (en ? "Next →" : "Suivant →")}
          </button>
        </div>

        {!isLast && (
          <button onClick={handleClose} style={{ width: "100%", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, marginTop: 16, padding: 8 }}>
            {en ? "Skip tutorial" : "Passer le tutoriel"}
          </button>
        )}
      </div>
    </div>
  );
}
