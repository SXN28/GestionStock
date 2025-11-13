import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { user } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-6">
      <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <span className="text-sm">{user.displayName || user.email}</span>
        </div>

      <div className="flex-none gap-3">

        <button onClick={handleLogout} className="btn btn-error btn-sm flex items-center">
          <LogOut className="w-4 h-4 mr-1" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
