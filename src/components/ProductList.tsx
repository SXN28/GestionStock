import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Pencil, Trash2, Plus, Minus } from "lucide-react";
import AddProductModal from "./AddProductModal";
import { onAuthStateChanged } from "firebase/auth";

interface Product {
  id: string;
  name: string;
  ref: number;
  quantity: number;
  userId: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortQty, setSortQty] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeProducts: (() => void) | undefined;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "products"), where("userId", "==", user.uid));
        unsubscribeProducts = onSnapshot(q, (snapshot) => {
          const prods = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];

          const sorted = [...prods].sort((a, b) =>
            sortQty === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
          );

          setProducts(sorted);
          setLoading(false);
        });
      } else {
        setProducts([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [sortQty]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setProductToDelete(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditedProduct(product);
  };

  const handleSave = async (id: string) => {
    await updateDoc(doc(db, "products", id), {
      name: editedProduct.name,
      ref: editedProduct.ref,
      quantity: editedProduct.quantity,
    });
    setEditingId(null);
  };

  const changeQuantity = async (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newQty = product.quantity + delta;

    if (newQty <= 0) {
      await deleteDoc(doc(db, "products", id));
    } else {
      await updateDoc(doc(db, "products", id), { quantity: newQty });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toString().includes(search)
  );

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-base-200 rounded-lg shadow-inner"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Barre de filtres et bouton d’ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou référence..."
            className="input input-bordered flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered w-44"
            value={sortQty}
            onChange={(e) => setSortQty(e.target.value as "asc" | "desc")}
          >
            <option value="desc">Quantité : plus → moins</option>
            <option value="asc">Quantité : moins → plus</option>
          </select>
        </div>
        <button
          className="btn btn-primary mt-2 sm:mt-0"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </button>
      </div>

      {/* Liste des produits */}
      <ul className="space-y-2">
        {filteredProducts.map((product) => (
          <li
            key={product.id}
            className="flex flex-col sm:flex-row justify-between items-center p-3 bg-base-100 shadow rounded-lg"
          >
            {editingId === product.id ? (
              <>
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
                  <input
                    type="text"
                    className="input input-sm input-bordered flex-1"
                    value={editedProduct.name}
                    onChange={(e) =>
                      setEditedProduct({ ...editedProduct, name: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="input input-sm input-bordered w-24"
                    value={editedProduct.ref}
                    onChange={(e) =>
                      setEditedProduct({
                        ...editedProduct,
                        ref: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    type="number"
                    className="input input-sm input-bordered w-24"
                    value={editedProduct.quantity}
                    onChange={(e) =>
                      setEditedProduct({
                        ...editedProduct,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <button
                  onClick={() => handleSave(product.id)}
                  className="btn btn-success btn-sm mt-2 sm:mt-0"
                >
                  Sauver
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center flex-1 w-full">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-gray-500">Réf : {product.ref}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => changeQuantity(product.id, -1)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium">{product.quantity}</span>
                    <button
                      onClick={() => changeQuantity(product.id, 1)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2 ml-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-ghost btn-sm text-blue-500"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="btn btn-ghost btn-sm text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-4">Aucun produit trouvé.</p>
        )}
      </ul>

      {/* Modal d’ajout */}
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Confirmation de suppression */}
      {productToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Supprimer {productToDelete.name} ?
            </h3>
            <p className="py-4">
              Cette action est irréversible. Veux-tu continuer ?
            </p>
            <div className="modal-action">
              <button
                onClick={() => setProductToDelete(null)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(productToDelete.id)}
                className="btn btn-error"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
