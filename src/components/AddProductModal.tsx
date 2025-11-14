import { useState, useRef, useEffect } from "react";
import { addDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Camera } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";
import toast from "react-hot-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [image, setImage] = useState<string>("none");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fonction pour récupérer le produit depuis l'API
  const fetchProductFromAPI = async (barcode: number) => {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        setName(data.product.product_name || "");
        setImage(data.product.image_front_small_url || "none");
      } else {
        setName("");
        setImage("none");
        toast("Produit non trouvé, saisissez-le manuellement", { icon: "⚠️" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la récupération du produit");
      setName("");
      setImage("none");
    }
  };

  // Déclencher la recherche si l'utilisateur saisit un code-barres manuellement
  useEffect(() => {
    if (ref !== "") {
      fetchProductFromAPI(Number(ref));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    if (!name || ref === "" || quantity === "") return;

    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("userId", "==", user.uid), where("ref", "==", Number(ref)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // doublon : ajouter quantité
        const docRef = querySnapshot.docs[0].ref;
        const existingQuantity = querySnapshot.docs[0].data().quantity || 0;
        await updateDoc(docRef, { quantity: existingQuantity + Number(quantity) });
        toast.success("Quantité ajoutée au produit existant !");
      } else {
        await addDoc(productsRef, {
          name,
          ref: Number(ref),
          quantity: Number(quantity),
          userId: user.uid,
          image,
        });
        toast.success("Produit ajouté !");
      }

      // reset
      setName("");
      setRef("");
      setQuantity("");
      setImage("none");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      toast.error("Erreur lors de l'ajout du produit");
    }
  };

  const startScan = async () => {
    setScanning(true);
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      const barcode = Number(result.getText());
      setRef(barcode);
      setScanning(false);
      await fetchProductFromAPI(barcode);
    } catch (err) {
      console.error("Erreur scan :", err);
      toast.error("Erreur lors du scan");
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
              placeholder="Réf / Code-barres"
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
