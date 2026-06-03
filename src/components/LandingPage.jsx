import React from "react";

export default function LandingPage({ onGetStarted, lang = "fr" }) {
  const lp = {
    fr: {
      tagline: "Le score santé de ta voiture,\ntoujours dans ta poche.",
      desc: "La plupart des gens oublient de suivre l'entretien de leur voiture — jusqu'à la panne. CheckAr centralise tout pour que tu aies toujours un coup d'avance.",
      scoreLabel: "Score santé",
      scoreDesc: "Ton véhicule, toujours évalué",
      cta: "Commencer — C'est gratuit",
      signin: "Déjà un compte ? Se connecter",
      secure: "Données sécurisées",
      offline: "Fonctionne hors ligne",
      multidevice: "Multi-appareils",
      featuresTitle: "Tout ce qu'il vous faut",
      ctaBottom: "Essayer CheckAr gratuitement",
      noCB: "Plan gratuit disponible · Sans carte bancaire",
      phTitle: "Disponible sur Product Hunt",
      phDesc: "Soutenez-nous avec un commentaire ou un upvote — ça compte beaucoup ! 🙏",
      features: [
        { icon: "✅", title: "Checklist intelligente", desc: "Checklists d'entretien détaillées adaptées à votre type de véhicule. Ne ratez plus jamais une révision." },
        { icon: "📄", title: "Documents & rappels", desc: "CT, assurance, révision — tous vos documents au même endroit avec des rappels intelligents." },
        { icon: "💰", title: "Dépenses & kilométrage", desc: "Suivez chaque coût et chaque kilomètre pour maîtriser votre budget." },
        { icon: "🔌", title: "Historique complet", desc: "Historique d'entretien et diagnostic de votre véhicule, toujours accessible." },
        { icon: "📊", title: "Rapport QR certifié", desc: "Générez un rapport QR certifié pour partager l'état de votre véhicule." },
        { icon: "🆘", title: "Bouton SOS", desc: "Accès rapide aux essentiels d'urgence, où que vous soyez sur la route." },
      ],
    },
    en: {
      tagline: "Your car's health score,\nalways in your pocket.",
      desc: "Most people forget to track their car's health — until something breaks. CheckAr puts everything in one place so you're always one step ahead.",
      scoreLabel: "Health Score",
      scoreDesc: "Your vehicle, always evaluated",
      cta: "Get Started — It's Free",
      signin: "Already have an account? Sign in",
      secure: "Secure data",
      offline: "Works offline",
      multidevice: "Multi-device",
      featuresTitle: "Everything you need",
      ctaBottom: "Try CheckAr for Free",
      noCB: "Free plan available · No credit card required",
      phTitle: "Featured on Product Hunt",
      phDesc: "Support us with a comment or upvote — it means a lot! 🙏",
      features: [
        { icon: "✅", title: "Smart Checklist", desc: "Detailed maintenance checklists tailored to your vehicle type. Never miss a service again." },
        { icon: "📄", title: "Documents & Reminders", desc: "MOT, insurance, service — all your documents in one place with smart reminders." },
        { icon: "💰", title: "Expenses & Mileage", desc: "Track every cost and kilometre to master your budget and anticipate future needs." },
        { icon: "🔌", title: "Full History", desc: "Complete maintenance history and diagnostics for your vehicle, always accessible." },
        { icon: "📊", title: "QR Report", desc: "Generate a certified QR report to share your vehicle's health with garages or buyers." },
        { icon: "🆘", title: "SOS Button", desc: "Quick access to emergency essentials, wherever you are on the road." },
      ],
    },
  }[lang] || {};

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "-apple-system,'SF Pro Display','Segoe UI',sans-serif", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(170deg, #0a0e1a 60%, #111827)", padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🚗</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#2157FF", letterSpacing: 3, marginBottom: 16 }}>CHECKAR</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.4, marginBottom: 16, whiteSpace: "pre-line" }}>
          {lp.tagline}
        </div>
        <div style={{ fontSize: 14, color: "#a0a0bb", lineHeight: 1.7, marginBottom: 32 }}>
          {lp.desc}
        </div>

        {/* Score santé visuel */}
        <div style={{ background: "rgba(33,87,255,0.1)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 20, padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
            <svg viewBox="0 0 56 56" width="56" height="56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="#22ff00" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 24 * 0.82} ${2 * Math.PI * 24}`}
                strokeDashoffset={2 * Math.PI * 24 * 0.25}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#22ff00" }}>82%</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{lp.scoreLabel}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{lp.scoreDesc}</div>
          </div>
        </div>

        <button onClick={onGetStarted} style={{ background: "#2157FF", border: "none", borderRadius: 18, padding: "16px 32px", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(33,87,255,0.5)", width: "100%", marginBottom: 12 }}>
          {lp.cta}
        </button>
        <button onClick={onGetStarted} style={{ background: "transparent", border: "none", color: "#5566aa", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
          {lp.signin}
        </button>

        {/* Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {[{ icon: "🔒", label: lp.secure }, { icon: "📡", label: lp.offline }, { icon: "📱", label: lp.multidevice }].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "5px 12px" }}>
              <span style={{ fontSize: 12 }}>{b.icon}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: "32px 16px 8px" }}>
        <div style={{ fontSize: 11, color: "#5566aa", fontWeight: 800, letterSpacing: 2, textAlign: "center", marginBottom: 20 }}>{lp.featuresTitle?.toUpperCase()}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {lp.features?.map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 12px" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA BAS ── */}
      <div style={{ padding: "16px 24px 56px", textAlign: "center" }}>
        <button onClick={onGetStarted} style={{ background: "linear-gradient(135deg, #2157FF, #4f8ef7)", border: "none", borderRadius: 18, padding: "16px 32px", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(33,87,255,0.4)", width: "100%", marginBottom: 10 }}>
          {lp.ctaBottom}
        </button>
        <div style={{ fontSize: 11, color: "#5566aa" }}>{lp.noCB}</div>
      </div>

    </div>
  );
}
