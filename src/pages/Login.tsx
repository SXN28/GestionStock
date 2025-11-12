import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { LogIn, Mail, Chrome } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast({ message: "Connexion réussie !", type: "success" });
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setToast({ message: "Email ou mot de passe incorrect.", type: "error" });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setToast({ message: "Connecté avec Google ✅", type: "success" });
      setTimeout(() => navigate("/"), 1200);
    } catch (error: any) {
      setToast({ message: "Erreur lors de la connexion Google.", type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            <LogIn className="mr-2" /> Connexion
          </h2>

          <form onSubmit={handleLogin}>
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
            <button type="submit" className="btn btn-primary w-full">
              <Mail className="mr-2" size={18} /> Se connecter
            </button>
          </form>

          <div className="divider">OU</div>

          <button onClick={handleGoogleLogin} className="btn btn-accent w-full">
            <Chrome className="mr-2" size={18} /> Connexion Google
          </button>


          <p className="text-sm text-center mt-3">
            Pas encore de compte ?{" "}
            <Link to="/register" className="link link-primary">
              S’inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
