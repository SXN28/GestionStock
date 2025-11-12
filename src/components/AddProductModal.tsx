import { useState, useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Camera } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    if (!name || ref === "" || quantity === "") return;

    try {
      await addDoc(collection(db, "products"), {
        name,
        ref: Number(ref),
        quantity: Number(quantity),
        userId: user.uid,
      });
      setName("");
      setRef("");
      setQuantity("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
    }
  };

  const startScan = async () => {
    setScanning(true);
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      setRef(Number(result.getText()));
      setScanning(false);
    } catch (err) {
      console.error("Erreur scan :", err);
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
              onChange={(e) => setRef(e.target.value ? Number(e.target.value) : "")}
              required
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1"
              onClick={startScan}
            >
              <Camera className="w-4 h-4" /> Scan
            </button>
          </div>

          {scanning && (
            <video ref={videoRef} className="w-full h-64 border rounded" />
          )}

          <input
            type="number"
            placeholder="Quantité"
            className="input input-bordered"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
            required
          />

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
