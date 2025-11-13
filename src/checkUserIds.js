import admin from "firebase-admin";
import fs from "fs";

// Lire le fichier JSON de service account
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

// Initialise Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkProducts() {
  const snapshot = await db.collection("products").get();

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`DocID: ${doc.id} | Name: ${data.name} | UserID: ${data.userId}`);
  });

  console.log(`Total produits: ${snapshot.size}`);
}

// Exemple pour corriger les userId
async function fixUserIds(oldUid, newUid) {
  const snapshot = await db.collection("products").where("userId", "==", oldUid).get();
  console.log(`Produits à corriger: ${snapshot.size}`);

  for (const doc of snapshot.docs) {
    await db.collection("products").doc(doc.id).update({ userId: newUid });
    console.log(`Produit ${doc.id} corrigé`);
  }

  console.log("Correction terminée !");
}

// Lancement
checkProducts().catch(console.error);

// Si tu veux corriger un userId, décommente et lance
// fixUserIds("ancienUID", "hrYCZ7aeOLWgSeRBbjg290pdk2o1");
