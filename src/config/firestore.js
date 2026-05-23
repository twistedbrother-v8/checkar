import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

const COL    = "autocheck";
const INV    = "invitations";
const CERT   = "certificats";
const PHOTOS = "facture_photos";

// ─── Certificats d'entretien ──────────────────────────────────────
export const saveCertificat = async (certId, data) => {
  try {
    await setDoc(doc(db, CERT, certId), data);
  } catch (e) {
    console.error("Erreur sauvegarde certificat:", e);
  }
};

// ─── Photos de factures ───────────────────────────────────────────
export const saveFacturePhoto = async (data) => {
  try {
    const docRef = await addDoc(collection(db, PHOTOS), data);
    return docRef.id;
  } catch (e) {
    console.error("Erreur save photo:", e);
    return null;
  }
};

export const loadFacturePhotos = async (userId) => {
  try {
    const q = query(collection(db, PHOTOS), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
};

export const deleteFacturePhotoById = async (photoId) => {
  try {
    await deleteDoc(doc(db, PHOTOS, photoId));
  } catch (e) {
    console.error("Erreur delete photo:", e);
  }
};

export const clearAllFacturePhotos = async (userId) => {
  try {
    const q = query(collection(db, PHOTOS), where("userId", "==", userId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      if (data.storagePath) {
        try { await deleteObject(ref(storage, data.storagePath)); } catch (_) {}
      }
      await deleteDoc(doc(db, PHOTOS, d.id));
    }));
    return snap.docs.length;
  } catch (e) {
    console.error("Erreur clear photos:", e);
    return 0;
  }
};

// ─── Sauvegarde / Chargement existants ───────────────────────────
export const saveKey = async (userId, key, data) => {
  try {
    await setDoc(
      doc(db, COL, userId),
      { [key]: typeof data === "string" ? data : JSON.stringify(data) },
      { merge: true }
    );
  } catch (e) {
    console.error("Erreur sauvegarde Firebase:", e);
  }
};

export const loadAll = async (userId) => {
  try {
    const snap = await getDoc(doc(db, COL, userId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Erreur chargement Firebase:", e);
    return null;
  }
};

// ─── Invitations ─────────────────────────────────────────────────

// Générer un code unique à 8 chiffres et le sauvegarder
export const createInvitation = async (ownerId, vehicleId, vehicleData) => {
  try {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                 Math.random().toString(36).substring(2, 6).toUpperCase();
    await addDoc(collection(db, INV), {
      code,
      ownerId,
      vehicleId,
      vehicleData: JSON.stringify(vehicleData),
      createdAt: Date.now(),
      used: false,
    });
    return code;
  } catch (e) {
    console.error("Erreur création invitation:", e);
    return null;
  }
};

// Utiliser un code d'invitation
export const applyInvitation = async (code, newUserId) => {
  try {
    const q = query(collection(db, INV), where("code", "==", code), where("used", "==", false));
    const snap = await getDocs(q);
    if (snap.empty) return { success: false, error: "Code invalide ou déjà utilisé." };

    const invDoc = snap.docs[0];
    const inv = invDoc.data();

    // Marquer comme utilisé
    await setDoc(doc(db, INV, invDoc.id), { used: true, usedBy: newUserId, usedAt: Date.now() }, { merge: true });

    // Ajouter le véhicule partagé dans le compte du nouveau membre
    const vehicleData = JSON.parse(inv.vehicleData);
    const userSnap = await getDoc(doc(db, COL, newUserId));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const sharedVehicles = userData.sharedVehicles ? JSON.parse(userData.sharedVehicles) : [];

    // Éviter les doublons
    if (sharedVehicles.find(v => v.vehicleId === inv.vehicleId && v.ownerId === inv.ownerId)) {
      return { success: false, error: "Ce véhicule est déjà partagé avec vous." };
    }

    sharedVehicles.push({
      vehicleId: inv.vehicleId,
      ownerId: inv.ownerId,
      vehicleName: vehicleData.name,
      vehicleType: vehicleData.type,
      vehicleImmat: vehicleData.immat,
      joinedAt: Date.now(),
    });

    await setDoc(doc(db, COL, newUserId), { sharedVehicles: JSON.stringify(sharedVehicles) }, { merge: true });

    return { success: true, vehicle: vehicleData, ownerId: inv.ownerId };
  } catch (e) {
    console.error("Erreur utilisation invitation:", e);
    return { success: false, error: "Erreur technique, réessaie." };
  }
};

// Charger les véhicules partagés avec moi
export const loadSharedVehicles = async (userId) => {
  try {
    const snap = await getDoc(doc(db, COL, userId));
    if (!snap.exists()) return [];
    const data = snap.data();
    return data.sharedVehicles ? JSON.parse(data.sharedVehicles) : [];
  } catch (e) {
    return [];
  }
};

// Supprimer un véhicule partagé
export const removeSharedVehicle = async (userId, vehicleId, ownerId) => {
  try {
    const snap = await getDoc(doc(db, COL, userId));
    if (!snap.exists()) return;
    const data = snap.data();
    const sharedVehicles = data.sharedVehicles ? JSON.parse(data.sharedVehicles) : [];
    const updated = sharedVehicles.filter(v => !(v.vehicleId === vehicleId && v.ownerId === ownerId));
    await setDoc(doc(db, COL, userId), { sharedVehicles: JSON.stringify(updated) }, { merge: true });
  } catch (e) {
    console.error("Erreur suppression partage:", e);
  }
};
