import React, { useState } from "react";
import { C, card, VehicleChip } from "./shared";

export function HistoriqueScreen({ active, vehicles, setActive, depenses = [], t = {}, isPremium = true, isUltra = true, onShowPremium }) {
  const [photo, setPhoto] = useState(null);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyserPhoto = async () => {
    if (!photo) return;
    setLoading(true);
    setAnalyse(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photo.split(",")[1] } },
            { type: "text", text: t.unitKm === "Miles"
              ? `You are a car expert. Analyse this dashboard and identify any warning lights that are on. For each light, provide: 1) Its name 2) What it means 3) Its severity level (🔴 STOP - stop immediately / 🟠 ATTENTION - check soon / 🟢 INFO - not urgent). Reply in JSON with this exact format: {"voyants": [{"nom": "...", "signification": "...", "gravite": "STOP|ATTENTION|INFO", "emoji": "🔴|🟠|🟢", "action": "..."}]}. If no warning lights are on, reply {"voyants": [], "message": "No warning lights detected"}.`
              : `Tu es un expert automobile. Analyse ce tableau de bord et identifie les voyants allumés. Pour chaque voyant, donne : 1) Son nom 2) Ce qu'il signifie 3) Son niveau de gravité (🔴 STOP - arrêtez-vous immédiatement / 🟠 ATTENTION - vérifiez bientôt / 🟢 INFO - pas urgent). Réponds en JSON avec ce format : {"voyants": [{"nom": "...", "signification": "...", "gravite": "STOP|ATTENTION|INFO", "emoji": "🔴|🟠|🟢", "action": "..."}]}. Si tu ne vois pas de voyant allumé, réponds {"voyants": [], "message": "Aucun voyant allumé détecté"}.` }
          ]}]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const result = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAnalyse(result);
    } catch (e) {
      setAnalyse({ error: t.diagErreur || "Impossible d'analyser la photo. Réessayez." });
    }
    setLoading(false);
  };
  const allHistory = [...(active?.history || [])].reverse();
  const cutoff3m = (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })();
  const history = isUltra
    ? allHistory
    : isPremium
      ? allHistory.filter(h => { const [d, m, y] = h.date.split("/"); return new Date(`${y}-${m}-${d}`) >= cutoff3m; })
      : [];
  const historyRecent = history.slice(0, isUltra ? undefined : 50);

  const getDetails = (actions = []) => {
    const problemes = actions.filter(a => a.item?.includes("→ PROBLEME")).map(a => a.item.replace(" → PROBLEME", "").trim());
    const bientot = actions.filter(a => a.item?.includes("→ BIENTOT")).map(a => a.item.replace(" → BIENTOT", "").trim());
    return { problemes, bientot, hasProb: problemes.length > 0, hasBientot: bientot.length > 0 };
  };

  if (!active) return <div style={{ padding: 40, textAlign: "center", color: C.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div><div style={{ fontWeight: 600 }}>{t.choisirVehicule || "Choisis un véhicule depuis l'accueil"}</div></div>;

  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100vh" }}>
      {vehicles.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
          {vehicles.map(v => <VehicleChip key={v.id} v={v} active={active} setActive={setActive} />)}
        </div>
      )}

      {/* ── OBD2 ── */}
      <div style={{ background: "linear-gradient(135deg, #0d1a2e, #0a1220)", border: "1px solid rgba(33,87,255,0.35)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 32 }}>🔌</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#2157FF", letterSpacing: 0.5 }}>OBD2 DIAGNOSTIC</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.bientotDispo || "Bientôt disponible"}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6, marginBottom: 14 }}>
          {t.obd2Desc || "Connectez un boîtier OBD2 pour lire les codes d'erreur de votre véhicule, surveiller les paramètres moteur en temps réel et détecter les pannes avant qu'elles arrivent."}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {["⚡ Codes erreur", "🌡️ Température", "🔋 Batterie", "📡 Capteurs"].map(tag => (
            <span key={tag} style={{ background: "rgba(33,87,255,0.12)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#2157FF", fontWeight: 700 }}>{tag}</span>
          ))}
        </div>
        <button disabled style={{ width: "100%", background: "rgba(33,87,255,0.15)", border: "1px solid rgba(33,87,255,0.3)", borderRadius: 14, padding: "12px 0", color: "#2157FF", fontSize: 13, fontWeight: 800, cursor: "not-allowed", opacity: 0.7 }}>
          🔌 {t.connecterOBD2 || "Connecter un OBD2"} — {t.obd2Soon || "Prochainement"}
        </button>
      </div>

      {/* ── BANDEAU BIENTÔT DISPONIBLE ── */}
      <div style={{ background: "linear-gradient(135deg, #ff6b00, #ffa200)", borderRadius: 16, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🚧</span>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#000", lineHeight: 1.5 }}>
          {t.diagBientot || "Les fonctions diagnostic de cette page seront bientôt disponibles"}
        </div>
      </div>

      {/* ── DIAGNOSTIC IA ── */}
      <div style={{ background: "linear-gradient(135deg, #1a0d2e, #2d1b4e)", border: "1px solid rgba(191,90,242,0.35)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 32 }}>🔍</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#bf5af2", letterSpacing: 0.5 }}>{t.diagIATitre || "DIAGNOSTIC IA — VOYANTS"}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.diagIASous || "Prends une photo de ton tableau de bord"}</div>
          </div>
        </div>
        {isPremium ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 16px", background: "rgba(191,90,242,0.08)", border: `2px dashed rgba(191,90,242,0.3)`, borderRadius: 16, cursor: "pointer", marginBottom: 12 }}>
              {photo ? (
                <img src={photo} alt="tableau de bord" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
              ) : (
                <>
                  <span style={{ fontSize: 40 }}>📷</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#bf5af2" }}>{t.diagPrendrePhoto || "Prendre une photo"}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.diagDashboard || "Tableau de bord · Voyants"}</div>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => { setPhoto(ev.target.result); setAnalyse(null); };
                reader.readAsDataURL(file);
              }} />
            </label>
            {photo && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={() => { setPhoto(null); setAnalyse(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: 12, color: C.muted, cursor: "pointer", fontWeight: 700 }}>{t.supprimer || "🗑️ Supprimer"}</button>
                <button onClick={analyserPhoto} disabled={loading} style={{ flex: 2, background: "#bf5af2", border: "none", borderRadius: 12, padding: 12, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: loading ? 0.7 : 1 }}>
                  {loading ? (t.analyseEnCours || "⏳ Analyse en cours...") : (t.diagAnalyser || "🔍 Analyser")}
                </button>
              </div>
            )}
            {analyse && !analyse.error && (
              analyse.voyants?.length === 0 ? (
                <div style={{ background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 14, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{t.diagAucunVoyant || "Aucun voyant allumé détecté !"}</div>
                </div>
              ) : (
                analyse.voyants?.map((v, i) => {
                  const col = v.gravite === "STOP" ? C.red : v.gravite === "ATTENTION" ? C.yellow : C.green;
                  return (
                    <div key={i} style={{ background: col + "15", border: `1px solid ${col}44`, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>{v.emoji}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{v.nom}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: col }}>{v.gravite}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{v.signification}</div>
                      <div style={{ fontSize: 11, color: col, fontWeight: 600 }}>👉 {v.action}</div>
                    </div>
                  );
                })
              )
            )}
            {analyse?.error && (
              <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 14, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.red }}>{analyse.error}</div>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => onShowPremium?.()} style={{ width: "100%", background: "rgba(191,90,242,0.15)", border: "1px solid rgba(191,90,242,0.3)", borderRadius: 14, padding: 14, color: "#bf5af2", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            {t.disponiblePremium || "🔒 Disponible avec Premium"}
          </button>
        )}
      </div>

      {/* ── HISTORIQUE ── */}
      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>
        {t.historiqueVerifs || "HISTORIQUE DES VÉRIFICATIONS"}
      </div>

      {(
        <>
          {!isPremium && (
            <div style={{ background: C.surface, borderRadius: 18, padding: 24, textAlign: "center", border: `1px solid ${C.blue}33`, marginBottom: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>Historique verrouillé</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Accédez aux 3 derniers mois avec Premium, ou à l'historique illimité avec Ultra.</div>
              <button onClick={() => onShowPremium?.()} style={{ background: C.blue, border: "none", borderRadius: 14, padding: "12px 24px", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🔒 Voir les plans</button>
            </div>
          )}
          {isPremium && historyRecent.length === 0 ? (
            <div style={card({ textAlign: "center", padding: 32, color: C.muted })}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600 }}>{t.pasDeVerif || 'Pas encore de vérif ici'}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{t.lancerChecklist || 'Lance ta première checklist !'}</div>
            </div>
          ) : isPremium && historyRecent.map((entry, i) => {
            const { problemes, bientot, hasProb, hasBientot } = getDetails(entry.actions);
            const okCount = (entry.actions || []).filter(a => a.item?.includes("→ OK")).length;
            const statusColor = hasProb ? C.red : hasBientot ? C.yellow : C.green;
            const statusLabel = hasProb ? "PROBLEME" : hasBientot ? "BIENTOT" : "OK";
            return (
              <div key={i} style={card()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{entry.date}</span>
                  <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: statusColor + "22", color: statusColor }}>{statusLabel}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: hasProb || hasBientot ? 10 : 0 }}>✓ {okCount} OK</div>
                {hasBientot && (
                  <div style={{ marginBottom: hasProb ? 8 : 0 }}>
                    {bientot.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", marginBottom: 4, background: C.yellow + "15", borderRadius: 10, border: `1px solid ${C.yellow}33` }}>
                        <span style={{ fontSize: 13 }}>⚠️</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.yellow }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {hasProb && (
                  <div>
                    {problemes.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", marginBottom: 4, background: C.red + "15", borderRadius: 10, border: `1px solid ${C.red}33` }}>
                        <span style={{ fontSize: 13 }}>🔴</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
