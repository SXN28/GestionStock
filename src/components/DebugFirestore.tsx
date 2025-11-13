import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function DebugFirestore() {
  const [user, setUser] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    console.log("Current user:", currentUser);

    if (!currentUser) {
      setError("Pas d'utilisateur connecté !");
      return;
    }

    // Récupérer tous les produits
    getDocs(collection(db, "products"))
      .then(snapshot => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllProducts(docs);
        console.log("Tous les produits:", docs);
      })
      .catch(err => {
        console.error("Erreur getDocs all products:", err);
        setError(err.message);
      });

    // Récupérer uniquement les produits de l'utilisateur
    const q = query(
      collection(db, "products"),
      where("userId", "==", currentUser.uid)
    );

    getDocs(q)
      .then(snapshot => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUserProducts(docs);
        console.log("Produits de l'utilisateur:", docs);
      })
      .catch(err => {
        console.error("Erreur getDocs user products:", err);
        setError(err.message);
      });

  }, []);

  return (
    <div className="p-4 bg-base-100 shadow rounded max-w-3xl mx-auto mt-6">
      <h2 className="text-lg font-bold mb-2">Debug Firestore</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <p>
        <strong>Utilisateur connecté :</strong>{" "}
        {user ? `${user.displayName || "no-name"} (UID: ${user.uid})` : "None"}
      </p>

      <div className="mt-4">
        <p className="font-semibold">Tous les produits :</p>
        <pre>{JSON.stringify(allProducts, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <p className="font-semibold">Produits filtrés par UID :</p>
        <pre>{JSON.stringify(userProducts, null, 2)}</pre>
      </div>
    </div>
  );
}
