// src/components/LoginScreen.jsx
import React, { useState } from "react";
import { loginUser, registerUser } from "../config/firebase";
import { btn, inputStyle, fieldLabel } from "../config/styles";
import CGUScreen from "./CGUScreen";

export default function LoginScreen() {
  const [lang,    setLang]    = useState(() => localStorage.getItem("lang") || "fr");
  const [mode,    setMode]    = useState("login");
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showCGU, setShowCGU] = useState(false);

  const switchLang = (l) => { setLang(l); localStorage.setItem("lang", l); };

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") await loginUser(email, pw);
      else                  await registerUser(email, pw);
    } catch (e) {
      const msgs = lang === "en" ? {
        "auth/user-not-found":       "No account with this email.",
        "auth/wrong-password":       "Incorrect password.",
        "auth/email-already-in-use": "Email already in use.",
        "auth/weak-password":        "Password too weak (min 6 chars).",
        "auth/invalid-email":        "Invalid email.",
      } : {
        "auth/user-not-found":       "Aucun compte avec cet email.",
        "auth/wrong-password":       "Mot de passe incorrect.",
        "auth/email-already-in-use": "Email déjà utilisé.",
        "auth/weak-password":        "Mot de passe trop faible (6 car. min).",
        "auth/invalid-email":        "Email invalide.",
      };
      setError(msgs[e.code] || (lang === "en" ? "Error: " : "Erreur : ") + e.message);
    }
    setLoading(false);
  };

  const isLogin = mode === "login";
  const en = lang === "en";

  return (
    <>
      {showCGU && <CGUScreen onClose={() => setShowCGU(false)} lang={lang} />}

      <div style={{
        maxWidth: 430, margin: "0 auto", minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, #0d1f4a, #020408 65%)",
        color: "#e2e8f0", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "0 24px",
        fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif",
        position: "relative",
      }}>

        {/* Sélecteur de langue */}
        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 6 }}>
          {["fr", "en"].map(l => (
            <button key={l} onClick={() => switchLang(l)} style={{
              padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
              background: lang === l ? "#2157FF" : "rgba(255,255,255,0.08)",
              color: lang === l ? "white" : "#475569",
              fontSize: 12, fontWeight: 700,
            }}>
              {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
          ))}
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🚘</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#4d4df7", letterSpacing: 1 }}>CHECKAR</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            {en ? "Smart maintenance logbook" : "Carnet d'entretien intelligent"}
          </div>
        </div>

        {/* Carte */}
        <div style={{
          width: "100%", background: "rgba(10,10,20,0.8)",
          borderRadius: 24, padding: 24,
          border: "1px solid rgba(6,6,229,0.2)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          backdropFilter: "blur(24px)",
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(5,5,15,0.8)", borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, transition: "all 0.25s",
                background: mode === m ? "linear-gradient(135deg,#0606E5,#0404B0)" : "transparent",
                color: mode === m ? "white" : "#475569",
                boxShadow: mode === m ? "0 4px 16px rgba(6,6,229,0.4)" : "none",
              }}>
                {m === "login"
                  ? (en ? "🔑 Sign in" : "🔑 Connexion")
                  : (en ? "✨ Create account" : "✨ Créer un compte")}
              </button>
            ))}
          </div>

          <div style={fieldLabel}>EMAIL</div>
          <input
            type="email" style={inputStyle} placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
          />

          <div style={fieldLabel}>{en ? "PASSWORD" : "MOT DE PASSE"}</div>
          <input
            type="password" style={inputStyle} placeholder="••••••••"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
          />

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              fontSize: 13, color: "#ef4444",
            }}>⚠️ {error}</div>
          )}

          <button
            style={{
              ...btn, marginTop: 8, opacity: loading ? 0.6 : 1,
              background: isLogin
                ? "linear-gradient(135deg, #16a34a, #22c55e)"
                : "linear-gradient(135deg, #0606E5, #0404B0)",
              boxShadow: isLogin
                ? "0 4px 20px rgba(34,197,94,0.4)"
                : "0 4px 20px rgba(6,6,229,0.4)",
            }}
            onClick={handle}
            disabled={loading}
          >
            {loading
              ? (en ? "⏳ Loading..." : "⏳ Chargement...")
              : isLogin
                ? (en ? "🔑 Sign in" : "🔑 Se connecter")
                : (en ? "✨ Create account" : "✨ Créer le compte")}
          </button>
        </div>

        {/* Lien CGU */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={() => setShowCGU(true)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, color: "#475569", textDecoration: "underline",
          }}>
            {en ? "Terms of use · Privacy policy" : "Conditions d'utilisation · Politique de confidentialité"}
          </button>
        </div>

      </div>
    </>
  );
}
