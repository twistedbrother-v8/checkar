// src/components/CGUScreen.jsx
import React, { useState } from "react";

const C = {
  bg:      "#000000",
  surface: "#3A3A40",
  border:  "rgba(255,255,255,0.08)",
  blue:    "#2157FF",
  text:    "#ffffff",
  muted:   "#8e8e93",
  muted2:  "#aeaeb2",
};

const contentFR = {
  title: "📋 Mentions légales",
  close: "✕ Fermer",
  tabCGU: "📄 CGU",
  tabPrivacy: "🔒 Confidentialité",
  cguTitle: "Conditions Générales d'Utilisation",
  cguDate: "CHECKAR — CheckApp Studio — Dernière mise à jour : mai 2026",
  privacyTitle: "Politique de Confidentialité",
  privacyDate: "CHECKAR — CheckApp Studio — Conforme au RGPD — Mai 2026",
  cgu: [
    { titre: "1. Présentation", texte: "CHECKAR est une application gratuite de gestion et d'entretien de véhicules, éditée par CheckApp Studio (checkapp-studio.fr). Elle permet à l'utilisateur de suivre l'état de ses véhicules, gérer ses documents, ses dépenses et d'accéder à des informations utiles en cas d'urgence." },
    { titre: "2. Éditeur", texte: "L'application CHECKAR est éditée par CheckApp Studio. Site web : checkapp-studio.fr — Contact : contact@checkapp-studio.fr" },
    { titre: "3. Accès au service", texte: "L'application est accessible gratuitement à toute personne disposant d'un accès internet et d'un compte utilisateur. La création d'un compte nécessite une adresse email valide et un mot de passe. L'utilisateur est seul responsable de la confidentialité de ses identifiants." },
    { titre: "4. Utilisation du service", texte: "L'utilisateur s'engage à utiliser l'application de manière loyale et conforme à sa destination. Il est interdit d'utiliser le service à des fins illicites, frauduleuses ou contraires aux bonnes mœurs. CheckApp Studio se réserve le droit de suspendre un compte en cas d'utilisation abusive." },
    { titre: "5. Responsabilité", texte: "Les informations fournies par l'application (procédures d'urgence, guide constat, état du véhicule) sont données à titre indicatif. CheckApp Studio ne saurait être tenu responsable des décisions prises par l'utilisateur sur la base de ces informations. En cas d'urgence, contactez toujours les services officiels (15, 17, 18, 112)." },
    { titre: "6. Propriété intellectuelle", texte: "L'application CHECKAR, son code, son design et son contenu sont la propriété exclusive de CheckApp Studio et sont protégés par les droits de propriété intellectuelle. Toute reproduction, modification ou distribution sans autorisation écrite est interdite." },
    { titre: "7. Disponibilité", texte: "CheckApp Studio s'efforce d'assurer la disponibilité du service 24h/24 et 7j/7. Cependant, des interruptions peuvent survenir pour maintenance ou en cas de force majeure. Aucune indemnisation ne pourra être réclamée pour ces interruptions." },
    { titre: "8. Modification des CGU", texte: "CheckApp Studio se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera informé des modifications significatives. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions." },
    { titre: "9. Droit applicable", texte: "Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront compétents." },
    { titre: "10. Contact", texte: "Pour toute question concernant ces CGU, contactez CheckApp Studio à l'adresse : contact@checkapp-studio.fr" },
  ],
  privacy: [
    { titre: "1. Responsable du traitement", texte: "Le responsable du traitement des données est CheckApp Studio, éditeur de l'application CHECKAR. Contact : contact@checkapp-studio.fr — Site : checkapp-studio.fr" },
    { titre: "2. Données collectées", texte: "CHECKAR collecte uniquement les données nécessaires au fonctionnement du service : adresse email (pour la connexion), données véhicules (nom, immatriculation, type), documents (assurance, contrôle technique, garage), photos de factures, dépenses et historique d'entretien. Aucune donnée bancaire n'est collectée." },
    { titre: "3. Finalité de la collecte", texte: "Vos données sont utilisées exclusivement pour le fonctionnement de l'application : synchronisation multi-appareils, sauvegarde de vos informations véhicules et génération de rapports d'entretien. Vos données ne sont jamais vendues ni cédées à des tiers." },
    { titre: "4. Stockage des données", texte: "Vos données sont stockées de manière sécurisée via Firebase (Google Cloud), conforme aux normes européennes de protection des données (RGPD). Les photos de factures sont stockées sur Firebase Storage et accessibles uniquement par votre compte." },
    { titre: "5. Localisation", texte: "L'application accède à votre position géographique uniquement lorsque vous utilisez la fonction 'Services proches'. Cette donnée n'est pas sauvegardée et sert uniquement à ouvrir Google Maps." },
    { titre: "6. Vos droits (RGPD)", texte: "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès, droit de rectification, droit à l'effacement (droit à l'oubli), droit à la portabilité. Pour exercer ces droits, supprimez votre compte depuis l'application ou écrivez à contact@checkapp-studio.fr." },
    { titre: "7. Cookies", texte: "CHECKAR n'utilise pas de cookies publicitaires ou de tracking. Seuls des cookies techniques nécessaires au fonctionnement de l'authentification Firebase sont utilisés." },
    { titre: "8. Sécurité", texte: "CheckApp Studio met en œuvre toutes les mesures techniques appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Les accès sont sécurisés par authentification Firebase." },
    { titre: "9. Durée de conservation", texte: "Vos données sont conservées tant que votre compte est actif. En cas de suppression du compte, l'ensemble des données associées est définitivement supprimé dans un délai de 30 jours." },
    { titre: "10. Contact", texte: "Pour toute question relative à vos données personnelles, contactez CheckApp Studio : contact@checkapp-studio.fr — checkapp-studio.fr" },
  ],
};

const contentEN = {
  title: "📋 Legal notices",
  close: "✕ Close",
  tabCGU: "📄 Terms",
  tabPrivacy: "🔒 Privacy",
  cguTitle: "Terms and Conditions of Use",
  cguDate: "CHECKAR — CheckApp Studio — Last updated: May 2026",
  privacyTitle: "Privacy Policy",
  privacyDate: "CHECKAR — CheckApp Studio — GDPR compliant — May 2026",
  cgu: [
    { titre: "1. Overview", texte: "CHECKAR is a free vehicle management and maintenance application published by CheckApp Studio (checkapp-studio.fr). It allows users to track vehicle condition, manage documents, expenses and access useful information in emergencies." },
    { titre: "2. Publisher", texte: "The CHECKAR application is published by CheckApp Studio. Website: checkapp-studio.fr — Contact: contact@checkapp-studio.fr" },
    { titre: "3. Access to the service", texte: "The application is freely accessible to anyone with internet access and a user account. Creating an account requires a valid email address and password. The user is solely responsible for the confidentiality of their credentials." },
    { titre: "4. Use of the service", texte: "The user agrees to use the application in a fair manner consistent with its purpose. It is prohibited to use the service for unlawful, fraudulent or immoral purposes. CheckApp Studio reserves the right to suspend an account in case of abusive use." },
    { titre: "5. Liability", texte: "Information provided by the application (emergency procedures, accident report guide, vehicle status) is for informational purposes only. CheckApp Studio cannot be held liable for decisions made by users based on this information. In an emergency, always contact official services (15, 17, 18, 112)." },
    { titre: "6. Intellectual property", texte: "The CHECKAR application, its code, design and content are the exclusive property of CheckApp Studio and are protected by intellectual property rights. Any reproduction, modification or distribution without written permission is prohibited." },
    { titre: "7. Availability", texte: "CheckApp Studio strives to ensure service availability 24/7. However, interruptions may occur for maintenance or force majeure. No compensation may be claimed for such interruptions." },
    { titre: "8. Changes to Terms", texte: "CheckApp Studio reserves the right to modify these Terms at any time. Users will be informed of significant changes. Continued use of the service constitutes acceptance of the new terms." },
    { titre: "9. Applicable law", texte: "These Terms are governed by French law. In case of dispute, and failing amicable resolution, French courts shall have jurisdiction." },
    { titre: "10. Contact", texte: "For any questions regarding these Terms, contact CheckApp Studio at: contact@checkapp-studio.fr" },
  ],
  privacy: [
    { titre: "1. Data controller", texte: "The data controller is CheckApp Studio, publisher of the CHECKAR application. Contact: contact@checkapp-studio.fr — Website: checkapp-studio.fr" },
    { titre: "2. Data collected", texte: "CHECKAR only collects data necessary for the service: email address (for login), vehicle data (name, registration, type), documents (insurance, MOT, garage), invoice photos, expenses and maintenance history. No financial data is collected." },
    { titre: "3. Purpose of collection", texte: "Your data is used exclusively for the application: multi-device synchronisation, backup of vehicle information and generation of maintenance reports. Your data is never sold or shared with third parties." },
    { titre: "4. Data storage", texte: "Your data is securely stored via Firebase (Google Cloud), compliant with European data protection standards (GDPR). Invoice photos are stored on Firebase Storage and accessible only by your account." },
    { titre: "5. Location", texte: "The application accesses your location only when you use the 'Nearby services' feature. This data is not saved and is only used to open Google Maps." },
    { titre: "6. Your rights (GDPR)", texte: "Under the General Data Protection Regulation (GDPR), you have the following rights: right of access, right of rectification, right to erasure (right to be forgotten), right to portability. To exercise these rights, delete your account from the app or write to contact@checkapp-studio.fr." },
    { titre: "7. Cookies", texte: "CHECKAR does not use advertising or tracking cookies. Only technical cookies necessary for Firebase authentication are used." },
    { titre: "8. Security", texte: "CheckApp Studio implements all appropriate technical measures to protect your data against unauthorised access, loss or disclosure. Access is secured by Firebase authentication." },
    { titre: "9. Retention period", texte: "Your data is kept as long as your account is active. If the account is deleted, all associated data is permanently deleted within 30 days." },
    { titre: "10. Contact", texte: "For any questions regarding your personal data, contact CheckApp Studio: contact@checkapp-studio.fr — checkapp-studio.fr" },
  ],
};

export default function CGUScreen({ onClose, onBack, showPrivacy, lang }) {
  const [tab, setTab] = useState(showPrivacy ? "confidentialite" : "cgu");
  const content = lang === "en" ? contentEN : contentFR;

  const tabStyle = (on) => ({
    flex: 1, padding: "10px 0", borderRadius: 20, border: "none",
    cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s",
    background: on ? "white" : C.blue,
    color: on ? "#000" : "white",
    boxShadow: on ? "0 2px 12px rgba(255,255,255,0.2)" : `0 2px 8px ${C.blue}44`,
  });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, zIndex: 999, overflowY: "auto",
      fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
      color: C.text, maxWidth: 430, margin: "0 auto",
    }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.bg, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{content.title}</div>
        <button onClick={onClose} style={{ background: C.surface, border: "none", borderRadius: 10, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 13 }}>{content.close}</button>
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 4, margin: "16px 16px 0", gap: 4, border: `1px solid ${C.border}` }}>
        <button style={tabStyle(tab === "cgu")} onClick={() => setTab("cgu")}>{content.tabCGU}</button>
        <button style={tabStyle(tab === "confidentialite")} onClick={() => setTab("confidentialite")}>{content.tabPrivacy}</button>
      </div>

      <div style={{ padding: "20px 16px 40px" }}>
        {tab === "cgu" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.blue, marginBottom: 4 }}>{content.cguTitle}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>{content.cguDate}</div>
            {content.cgu.map(({ titre, texte }) => (
              <div key={titre} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, marginBottom: 6 }}>{titre}</div>
                <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.6 }}>{texte}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "confidentialite" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.blue, marginBottom: 4 }}>{content.privacyTitle}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>{content.privacyDate}</div>
            {content.privacy.map(({ titre, texte }) => (
              <div key={titre} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, marginBottom: 6 }}>{titre}</div>
                <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.6 }}>{texte}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
