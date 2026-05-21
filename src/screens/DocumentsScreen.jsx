import React, { useState } from "react";
import { C, input, VehicleChip } from "./shared";

function AssuranceSection({ assDocs, docs, setDocs, form, setForm, showAssForm, setShowAssForm, confirmDocId, setConfirmDocId, addDoc, pillColor, pillLabel, callBtn, sCard, sBtn, t }) {
  const [showEchForm, setShowEchForm] = useState(false);
  const [confirmModify, setConfirmModify] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>📋 COORDONNÉES</div>
      {assDocs.map(d => (
        <div key={d.id} style={sCard()}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.blue + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛡️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{t.assurance?.replace("🛡️ ", "") || "Assurance"}</div>
              {d.org && <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{d.org}</div>}
              {d.num && <div style={{ fontSize: 12, color: C.muted }}>N° {d.num}</div>}
              {d.tel && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📞 {d.tel}</div>}
            </div>
          </div>
          {d.tel && callBtn(d.tel, t.appelerAssurance || "Appeler l'assurance")}
        </div>
      ))}
      <button style={sBtn(!showAssForm)} onClick={() => {
        if (showAssForm) { setShowAssForm(false); setConfirmModify(false); }
        else if (assDocs.length > 0) { setConfirmModify(true); }
        else { setShowAssForm(true); }
      }}>
        {showAssForm ? (t.annuler || "✕ Annuler") : assDocs.length > 0 ? "✏️ " + (t.modifierCoordonnees || "Modifier les coordonnées") : "➕ Ajouter l'assurance"}
      </button>
      {confirmModify && !showAssForm && (
        <div style={{ background: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{t.confirmerModification || "Confirmer la modification ?"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmModify(false)} style={{ flex: 1, background: "#2a2a2f", border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{t.annuler || "Annuler"}</button>
            <button onClick={() => { setConfirmModify(false); setShowAssForm(true); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✏️ {t.modifier || "Modifier"}</button>
          </div>
        </div>
      )}
      {showAssForm && (
        <div style={sCard({ padding: 20 })}>
          {[["ORGANISME","text","AXA, MAAF…","assOrg"],["N° CONTRAT","text","123 456 789","assNum"],["TÉLÉPHONE","tel","01 23 45 67 89","assTel"]].map(([label,type,ph,key]) => (
            <div key={key}><div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{label}</div><input type={type} style={input} placeholder={ph} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
          ))}
          {assDocs.length === 0 && (
            <>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>DATE D'ÉCHÉANCE</div>
              <input type="date" style={input} value={form.assDate || ""} onChange={e => setForm(f => ({ ...f, assDate: e.target.value }))} />
            </>
          )}
          <button style={sBtn(true)} onClick={() => {
            const existingDate = assDocs[0]?.rawDate || form.assDate;
            addDoc("assurance", { label: "Assurance", icon: "🛡️", org: form.assOrg, num: form.assNum, tel: form.assTel, date: existingDate });
            setForm(f => ({ ...f, assOrg: "", assNum: "", assDate: "", assTel: "" }));
            setShowAssForm(false);
          }}>{t.enregistrer || "✅ Enregistrer"}</button>
        </div>
      )}

      <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>📅 ÉCHÉANCE</div>
      {assDocs.length === 0 ? (
        <div style={sCard({ textAlign: "center", color: C.muted, fontSize: 12, padding: 20 })}>
          Ajoutez d'abord vos coordonnées d'assurance
        </div>
      ) : assDocs.map(d => (
        <div key={d.id + "_ech"} style={sCard()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>Date d'échéance</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: pillColor(d.days) }}>{d.date}</div>
              <div style={{ fontSize: 12, color: pillColor(d.days), fontWeight: 700, marginTop: 2 }}>
                {d.days <= 0 ? "Expiré 🔴" : `Expire dans ${d.days} jours`}
              </div>
            </div>
            <span style={{ background: pillColor(d.days) + "25", color: pillColor(d.days), borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>{pillLabel(d.days)}</span>
          </div>
          <button style={sBtn(true, C.blue)} onClick={() => setShowEchForm(f => !f)}>
            {showEchForm ? (t.annuler || "✕ Annuler") : "✏️ " + (t.modifierDate || "Modifier la date")}
          </button>
          {showEchForm && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>NOUVELLE DATE D'ÉCHÉANCE</div>
              <input type="date" style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0 14px", height: 44, color: "#fff", fontSize: 14, boxSizing: "border-box", outline: "none", colorScheme: "dark", marginBottom: 10 }} value={form.assDate || ""} onChange={e => setForm(f => ({ ...f, assDate: e.target.value }))} />
              <button style={sBtn(!!form.assDate)} onClick={() => {
                if (!form.assDate) return;
                addDoc("assurance", { label: "Assurance", icon: "🛡️", org: d.org, num: d.num, tel: d.tel, date: form.assDate });
                setForm(f => ({ ...f, assDate: "" }));
                setShowEchForm(false);
              }}>{t.enregistrer || "✅ Enregistrer"}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DocumentsScreen({ vehicles, active, setActive, docTab, setDocTab, docs, setDocs, localInvoices, setLocalInvoices, garageInfo, onSaveGarage, t = {} }) {
  const [form, setForm] = useState({ assOrg: "", assNum: "", assDate: "", assTel: "", ctDate: "", garNom: garageInfo?.nom || "", garTel: garageInfo?.tel || "", garAdresse: garageInfo?.adresse || "", garRevDate: "" });
  const [garageSaved, setGarageSaved] = useState(false);
  const [showAssForm, setShowAssForm] = useState(false);
  const [showCtForm,  setShowCtForm]  = useState(false);
  const [showGarForm, setShowGarForm] = useState(false);
  const [showRevForm, setShowRevForm] = useState(false);
  const [confirmDocId, setConfirmDocId] = useState(null);
  const [confirmModifyGar, setConfirmModifyGar] = useState(false);
  const [confirmModifyRev, setConfirmModifyRev] = useState(false);

  React.useEffect(() => {
    setForm(f => ({ ...f, garNom: garageInfo?.nom || "", garTel: garageInfo?.tel || "", garAdresse: garageInfo?.adresse || "" }));
  }, [garageInfo]);

  const myDocs  = docs.filter(d => !active || d.vehicleId === active?.id);
  const assDocs = myDocs.filter(d => d.type === "assurance");
  const ctDocs  = myDocs.filter(d => d.type === "controle");

  const addDoc = (type, data) => {
    const diff = Math.ceil((new Date(data.date) - new Date()) / 86400000);
    setDocs(p => {
      const filtered = p.filter(d => !(d.type === type && (!active || d.vehicleId === active?.id)));
      return [...filtered, { id: Date.now(), type, ...data, date: new Date(data.date).toLocaleDateString("fr-FR"), rawDate: data.date, days: diff, status: diff <= 15 ? "Urgent" : diff <= 30 ? "Bientôt" : "OK", vehicleId: active?.id, vehicleName: active?.name }];
    });
  };

  const pillColor = (days) => days <= 0 ? C.red : days <= 15 ? C.red : days <= 30 ? C.yellow : C.green;
  const pillLabel = (days) => days <= 0 ? (t.expireExclam || "Expiré 🔴") : days <= 15 ? (t.urgent || "Urgent ⚠️") : days <= 30 ? (t.bientotLabel || "Bientôt ⏳") : (t.okLabel || "OK ✅");
  const tabStyle  = (on) => ({ flex: 1, padding: "10px 0", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", background: on ? C.green : C.blue, color: on ? "#000" : "white", boxShadow: on ? `0 2px 12px ${C.green}44` : `0 2px 8px ${C.blue}44` });
  const sCard     = (extra = {}) => ({ background: C.surface, borderRadius: 16, padding: "14px 16px", marginBottom: 10, ...extra });
  const sBtn      = (active2 = true, color = C.blue) => ({ background: active2 ? color : C.surface, color: active2 ? "white" : C.muted, border: "none", borderRadius: 14, padding: "13px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10, boxShadow: active2 ? `0 4px 16px ${color}44` : "none" });

  const callBtn = (tel, label) => (
    <a href={`tel:${tel.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 12, padding: "11px 14px", marginTop: 12, color: C.green, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
      📞 {label}
    </a>
  );

  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100vh" }}>
      {vehicles.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
          {vehicles.map(v => <VehicleChip key={v.id} v={v} active={active} setActive={setActive} />)}
        </div>
      )}
      {!active && <div style={{ background: C.yellow + "22", border: `1px solid ${C.yellow}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 14 }}><span style={{ fontSize: 13, color: C.yellow }}>⚠️ {t.choisirVehiculeDocs || "Choisis un véhicule pour lier tes docs."}</span></div>}

      <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 4, marginBottom: 16, gap: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
        <button style={tabStyle(docTab === "assurance")} onClick={() => setDocTab("assurance")}>{t.assurance || "🛡️ Assurance"}</button>
        <button style={tabStyle(docTab === "controle")}  onClick={() => setDocTab("controle")}>{t.controleTechnique || "🚗 CT"}</button>
        <button style={tabStyle(docTab === "garage")}    onClick={() => setDocTab("garage")}>{t.garage || "🔧 Garage"}</button>
      </div>

      {docTab === "assurance" && (
        <AssuranceSection
          assDocs={assDocs} docs={docs} setDocs={setDocs}
          form={form} setForm={setForm}
          showAssForm={showAssForm} setShowAssForm={setShowAssForm}
          confirmDocId={confirmDocId} setConfirmDocId={setConfirmDocId}
          addDoc={addDoc} pillColor={pillColor} pillLabel={pillLabel}
          callBtn={callBtn} sCard={sCard} sBtn={sBtn} t={t}
        />
      )}

      {docTab === "controle" && (
        <div>
          {ctDocs.map(d => (
            <div key={d.id}>
              <div style={sCard({ display: "flex", alignItems: "flex-start", gap: 14 })}>
                <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.purple + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚗</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{t.controleTechnique?.replace("🚗 ", "") || "Contrôle technique"}</div>
                    <span style={{ background: pillColor(d.days) + "25", color: pillColor(d.days), borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{pillLabel(d.days)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: pillColor(d.days), fontWeight: 700 }}>{d.days <= 0 ? (t.expireExclam || "Expiré 🔴") : `${t.expireDans || "Expire dans"} ${d.days} ${t.jours || "jours"}`}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{d.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button style={sBtn(!showCtForm)} onClick={() => setShowCtForm(f => !f)}>{showCtForm ? (t.annuler || "✕ Annuler") : ctDocs.length > 0 ? (t.modifierControle || "✏️ Modifier le contrôle") : (t.ajouterControle || "➕ Ajouter le contrôle technique")}</button>
          {showCtForm && (
            <div style={sCard({ padding: 20 })}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{t.dateEcheance || "DATE D'ÉCHÉANCE"}</div>
              <input type="date" style={input} value={form.ctDate} onChange={e => setForm(f => ({ ...f, ctDate: e.target.value }))} />
              {form.ctDate && (() => { const diff = Math.ceil((new Date(form.ctDate) - new Date()) / 86400000); const col = diff <= 15 ? C.red : diff <= 30 ? C.yellow : C.green; return <div style={{ background: col + "22", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 13 }}><span style={{ color: col, fontWeight: 700 }}>{diff > 0 ? `⏰ ${t.dans || "Dans"} ${diff} ${t.jours || "jours"}` : (t.expireExclam || "⚠️ Expiré 🔴")}</span></div>; })()}
              <button style={sBtn(!!form.ctDate)} onClick={() => { if (!form.ctDate) return; addDoc("controle", { label: "Contrôle technique", icon: "🚗", date: form.ctDate }); setForm(f => ({ ...f, ctDate: "" })); setShowCtForm(false); }}>{t.enregistrer || "✅ Enregistrer"}</button>
            </div>
          )}
        </div>
      )}

      {docTab === "garage" && (
        <div>
          {garageInfo?.nom && (
            <div style={sCard()}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.orange + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{garageInfo.nom}</div>
                  {garageInfo.tel && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📞 {garageInfo.tel}</div>}
                  {garageInfo.adresse && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📍 {garageInfo.adresse}</div>}
                </div>
              </div>
              {garageInfo.tel && callBtn(garageInfo.tel, t.appelerGarage || "Appeler le garage")}
              {garageInfo.adresse && (
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(garageInfo.adresse)}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.blue + "22", border: `1px solid ${C.blue}44`, borderRadius: 12, padding: "11px 14px", marginTop: 8, color: C.blue, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                  📍 Voir sur Google Maps
                </a>
              )}
            </div>
          )}
          <button style={sBtn(!showGarForm)} onClick={() => {
            if (showGarForm) { setShowGarForm(false); setConfirmModifyGar(false); }
            else if (garageInfo?.nom) { setConfirmModifyGar(true); }
            else { setShowGarForm(true); }
          }}>{showGarForm ? (t.annuler || "✕ Annuler") : garageInfo?.nom ? (t.modifierGarage || "✏️ Modifier le garage") : (t.ajouterGarage || "➕ Ajouter le garage")}</button>
          {confirmModifyGar && !showGarForm && (
            <div style={{ background: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{t.confirmerModification || "Confirmer la modification ?"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmModifyGar(false)} style={{ flex: 1, background: "#2a2a2f", border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{t.annuler || "Annuler"}</button>
                <button onClick={() => { setConfirmModifyGar(false); setShowGarForm(true); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✏️ {t.modifier || "Modifier"}</button>
              </div>
            </div>
          )}
          {showGarForm && (
            <div style={sCard({ padding: 20 })}>
              {[[t.nomGarage || "NOM DU GARAGE","text","Garage Dupont…","garNom"],[t.telephone || "TÉLÉPHONE","tel","01 23 45 67 89","garTel"],[t.adresse || "ADRESSE","text","12 rue de la Paix, Paris","garAdresse"]].map(([label,type,ph,key]) => (
                <div key={key}><div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>{label}</div><input type={type} style={input} placeholder={ph} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
              ))}
              <button style={sBtn(form.garNom.trim().length > 0, garageSaved ? C.green : C.blue)} onClick={() => { if (!form.garNom.trim()) return; onSaveGarage({ nom: form.garNom, tel: form.garTel, adresse: form.garAdresse }); setGarageSaved(true); setShowGarForm(false); setTimeout(() => setGarageSaved(false), 2000); }}>{garageSaved ? (t.enregistre || "✅ Enregistré !") : (t.enregistrerInfos || "💾 Enregistrer les infos")}</button>
            </div>
          )}

          {myDocs.filter(d => d.type === "revision").map(d => (
            <div key={d.id}>
              <div style={sCard({ display: "flex", alignItems: "flex-start", gap: 14 })}>
                <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.orange + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔩</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{t.revision || "Révision"}</div>
                    <span style={{ background: pillColor(d.days) + "25", color: pillColor(d.days), borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{pillLabel(d.days)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>Prochaine révision</span>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 800 }}>{d.km ? Number(d.km).toLocaleString("fr-FR") + " km" : d.date}</span>
                  </div>
                </div>
                <button onClick={() => setConfirmDocId(d.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              {confirmDocId === d.id && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setConfirmDocId(null)} style={{ flex: 1, background: C.surface2, border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{t.annuler || "Annuler"}</button>
                  <button onClick={() => { setDocs(p => p.filter(x => x.id !== d.id)); setConfirmDocId(null); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>🗑️ Supprimer</button>
                </div>
              )}
            </div>
          ))}
          <button style={sBtn(!showRevForm)} onClick={() => {
            if (showRevForm) { setShowRevForm(false); setConfirmModifyRev(false); }
            else if (myDocs.filter(d => d.type === "revision").length > 0) { setConfirmModifyRev(true); }
            else { setShowRevForm(true); }
          }}>{showRevForm ? (t.annuler || "✕ Annuler") : myDocs.filter(d => d.type === "revision").length > 0 ? (t.modifierRevision || "✏️ Modifier la révision") : (t.ajouterRevision || "➕ Ajouter une révision")}</button>
          {confirmModifyRev && !showRevForm && (
            <div style={{ background: "#1e1e24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{t.confirmerModification || "Confirmer la modification ?"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmModifyRev(false)} style={{ flex: 1, background: "#2a2a2f", border: "none", borderRadius: 10, padding: "8px 0", color: C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{t.annuler || "Annuler"}</button>
                <button onClick={() => { setConfirmModifyRev(false); setShowRevForm(true); }} style={{ flex: 1, background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "8px 0", color: C.red, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✏️ {t.modifier || "Modifier"}</button>
              </div>
            </div>
          )}
          {showRevForm && (
            <div style={sCard({ padding: 20 })}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700 }}>KM DE LA PROCHAINE RÉVISION</div>
              <input type="number" style={input} placeholder="Ex : 95 000" value={form.garRevKm || ""} onChange={e => setForm(f => ({ ...f, garRevKm: e.target.value }))} />
              <button style={sBtn(!!form.garRevKm)} onClick={() => {
                if (!form.garRevKm) return;
                setDocs(p => {
                  const filtered = p.filter(d => !(d.type === "revision" && (!active || d.vehicleId === active?.id)));
                  return [...filtered, {
                    id: Date.now(), type: "revision", label: "Révision", icon: "🔩",
                    km: form.garRevKm,
                    date: form.garRevKm + " km",
                    days: 9999,
                    status: "OK",
                    vehicleId: active?.id, vehicleName: active?.name
                  }];
                });
                setForm(f => ({ ...f, garRevKm: "" }));
                setShowRevForm(false);
              }}>{t.enregistrerRevision || "✅ Enregistrer la révision"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
