import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus } from "lucide-react";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [ref, setRef] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");

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
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-6 justify-center items-center"
    >
      <input
        type="text"
        placeholder="Nom du produit"
        className="input input-bordered"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Réf"
        className="input input-bordered"
        value={ref}
        onChange={(e) => setRef(e.target.value ? Number(e.target.value) : "")}
        required
      />
      <input
        type="number"
        placeholder="Quantité"
        className="input input-bordered"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
        required
      />
      <button type="submit" className="btn btn-primary">
        <Plus className="mr-1 w-4 h-4" /> Ajouter
      </button>
    </form>
  );
}
