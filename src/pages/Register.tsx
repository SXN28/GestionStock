import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { UserPlus, Chrome, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setToast({ message: "Les mots de passe ne correspondent pas.", type: "error" });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setToast({ message: "Compte créé avec succès !", type: "success" });
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setToast({ message: "Erreur lors de la création du compte.", type: "error" });
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setToast({ message: "Inscription réussie avec Google ✅", type: "success" });
      setTimeout(() => navigate("/"), 1200);
    } catch (error: any) {
      setToast({ message: "Erreur lors de l’inscription avec Google.", type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            <UserPlus className="mr-2" /> Inscription
          </h2>

          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="input input-bordered w-full mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="input input-bordered w-full mb-3"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-full">
              <Mail className="mr-2" size={18} /> Créer un compte
            </button>
          </form>

          <div className="divider">OU</div>

          <button onClick={handleGoogleRegister} className="btn btn-outline w-full">
            <Chrome className="mr-2" size={18} /> S’inscrire avec Google
          </button>

          <p className="text-sm text-center mt-3">
            Déjà un compte ?{" "}
            <Link to="/login" className="link link-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
