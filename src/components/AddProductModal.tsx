import { useState, useRef } from "react";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Camera } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { toast } from "react-hot-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Tu dois être connecté pour ajouter un produit !");
      return;
    }

    if (!name || ref === "" || quantity === "") {
      toast.error("Tous les champs doivent être remplis !");
      return;
    }

    try {
      setLoading(true);

      // Vérifie si la référence existe déjà pour cet utilisateur
      const q = query(
        collection(db, "products"),
        where("userId", "==", user.uid),
        where("ref", "==", Number(ref))
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Produit existant → on met à jour la quantité
        const existingDoc = snapshot.docs[0];
        const existingData = existingDoc.data();
        const newQty = existingData.quantity + Number(quantity);

        await updateDoc(doc(db, "products", existingDoc.id), {
          quantity: newQty,
        });

        toast.success(
          `Quantité mise à jour (+${quantity}) pour "${existingData.name}"`
        );
      } else {
        // Nouveau produit → ajout
        await addDoc(collection(db, "products"), {
          name,
          ref: Number(ref),
          quantity: Number(quantity),
          userId: user.uid,
        });

        toast.success(`Produit "${name}" ajouté avec succès !`);
      }

      setName("");
      setRef("");
      setQuantity("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      toast.error("Erreur lors de l’ajout du produit !");
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    setScanning(true);
    const codeReader = new BrowserMultiFormatReader();

    try {
      const result = await codeReader.decodeOnceFromVideoDevice(
        undefined,
        videoRef.current!
      );
      setRef(Number(result.getText()));
      setScanning(false);
      toast.success("Code-barres scanné avec succès !");
    } catch (err) {
      console.error("Erreur scan :", err);
      toast.error("Erreur lors du scan du code-barres !");
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Ajouter un produit</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom du produit"
            className="input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Réf"
              className="input input-bordered flex-1"
              value={ref}
              onChange={(e) =>
                setRef(e.target.value ? Number(e.target.value) : "")
              }
              required
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1"
              onClick={startScan}
              disabled={scanning}
            >
              <Camera className="w-4 h-4" /> {scanning ? "Scan..." : "Scan"}
            </button>
          </div>

          {scanning && (
            <video
              ref={videoRef}
              className="w-full h-64 border rounded"
              autoPlay
              muted
            />
          )}

          <input
            type="number"
            placeholder="Quantité"
            className="input input-bordered"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value ? Number(e.target.value) : "")
            }
            required
          />

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-1" />{" "}
              {loading ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
