import React, { useState } from "react";
import { STATE_COLOR } from "../config/data";
import { C, card, btn, ITEM_COLORS } from "./shared";

function CheckItem({ item, state, onUpdate, t = {} }) {
  const icolor = ITEM_COLORS[item.id] || C.blue;
  return (
    <div style={{ background: state ? STATE_COLOR[state] + "15" : C.surface, borderRadius: 16, padding: "12px 14px", marginBottom: 8, border: `1px solid ${state ? STATE_COLOR[state] + "44" : "transparent"}`, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: icolor + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{item.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.label}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.desc}</div>
      </div>
      <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
        {["OK", "BIENTOT", "PROBLEME"].map(st => {
          const on = state === st;
          const col = STATE_COLOR[st];
          const sym = { OK: "✓", BIENTOT: "!", PROBLEME: "X" }[st];
          return (
            <button key={st} onClick={() => onUpdate(item.id, st)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", cursor: "pointer", background: on ? col : col + "22", color: on ? "#000" : col, fontSize: 15, fontWeight: 900, boxShadow: on ? `0 0 12px ${col}88` : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>{sym}</button>
          );
        })}
      </div>
    </div>
  );
}

function GroupItem({ item, checks, onUpdate, t = {} }) {
  const [open, setOpen] = useState(false);
  const states = item.items.map(sub => checks?.[sub.id]);
  const hasProb = states.some(s => s === "PROBLEME");
  const hasBientot = states.some(s => s === "BIENTOT");
  const allDone = states.every(s => s);
  const groupColor = hasProb ? C.red : hasBientot ? C.yellow : allDone ? C.green : C.blue;

  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(o => !o)} style={{ background: C.bg, borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1px solid ${allDone ? groupColor + "44" : C.border}`, marginBottom: open ? 6 : 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: groupColor + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{item.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.label}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {allDone
              ? `${states.filter(s => s === "OK").length} OK · ${states.filter(s => s === "PROBLEME").length} ${t.probleme || "problème(s)"}`
              : `${states.filter(Boolean).length} / ${item.items.length} ${t.verifie || "vérifiés"}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {[[C.green, "OK"], [C.yellow, "BIENTOT"], [C.red, "PROBLEME"]].map(([c, st], i) => {
              const on = states.some(s => s === st);
              const sym = { OK: "✓", BIENTOT: "!", PROBLEME: "✗" }[st];
              return <div key={i} style={{ width: 34, height: 34, borderRadius: 10, background: on ? c : c + "22", boxShadow: on ? `0 0 12px ${c}88` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: on ? "#000" : c + "66" }}>{on ? sym : ""}</div>;
            })}
          </div>
          <span style={{ color: C.muted, fontSize: 18, display: "inline-block", transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
        </div>
      </div>
      {open && (
        <div style={{ paddingLeft: 14, borderLeft: `3px solid ${groupColor}44`, marginLeft: 6 }}>
          {item.items.map(sub => <CheckItem key={sub.id} item={sub} state={checks?.[sub.id]} onUpdate={onUpdate} t={t} />)}
        </div>
      )}
    </div>
  );
}

export function ChecklistScreen({ active, checklist, prog, updateCheck, setTab, t = {}, isPremium = true, onShowPremium }) {
  if (!active) return <div style={{ padding: 40, textAlign: "center", color: C.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>✅</div><div style={{ fontWeight: 600 }}>{t.choisirVehicule || "Choisis un véhicule depuis l'accueil"}</div></div>;

  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderRadius: 18, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1 }}>{t.commentCaSePassee || "COMMENT ÇA SE PASSE ?"}</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: prog.problems > 0 ? C.red : C.green }}>{prog.pct}%</span>
        </div>
        <div style={{ height: 10, background: "#1a1a1a", borderRadius: 20, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: prog.pct + "%", height: "100%", background: prog.pct === 100 ? "#22ff00" : prog.pct >= 60 ? `linear-gradient(90deg, #ffa200, #22ff00)` : prog.pct >= 30 ? `linear-gradient(90deg, #ff0000, #ffa200)` : "#ff0000", borderRadius: 20, transition: "width 0.5s ease", boxShadow: prog.pct === 100 ? "0 0 10px #22ff0066" : "none" }} />
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓ {prog.ok} {t.ok || "OK"}</span>
          <span style={{ fontSize: 12, color: C.yellow, fontWeight: 700 }}>! {Object.values(active.checks || {}).filter(v => v === "BIENTOT").length} {t.bientot || "BIENTÔT"}</span>
          <span style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>✗ {prog.problems} {(t.probleme || "PROBLÈME").toUpperCase()}{prog.problems !== 1 ? "S" : ""}</span>
        </div>
      </div>
      {checklist.map(item => item.group
        ? <GroupItem key={item.id} item={item} checks={active.checks} onUpdate={updateCheck} t={t} />
        : <CheckItem key={item.id} item={item} state={active.checks?.[item.id]} onUpdate={updateCheck} t={t} />
      )}
      <button style={{ marginTop: 8, background: C.blue, color: "white", border: "none", borderRadius: 18, padding: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%", boxShadow: `0 4px 20px ${C.blue}55` }} onClick={() => setTab("rapport")}>
        📊 {t.voirLeBilan || "Voir le bilan"}
      </button>
    </div>
  );
}
