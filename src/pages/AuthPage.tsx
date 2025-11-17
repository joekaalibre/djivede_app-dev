import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import { fetchApi } from "@/lib/fetcher";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"investor" | "candidate">("investor");
  const navigate = useNavigate();

  const extractName = (email: string) => email?.split("@")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignIn) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // ✅ Resync après connexion (applique le rôle mémorisé, lie Propulse, etc.)
        if (data.user?.id && data.user?.email) {
          try {
            await fetchApi("/resync-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
              }),
            });
          } catch (err) {
            console.error("Erreur resync user :", err);
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user?.id)
          .single();

        if (profileError) throw profileError;

        const userName = profile?.full_name || extractName(email);
        setMessage(`👋 Bienvenue ${userName} ! Redirection en cours...`);

        setTimeout(() => {
          const role = profile?.role;
          if (role === "admin") navigate("/dashboard/admin/overview");
          else if (role === "candidate") navigate("/dashboard/propulse-phase2");
          else navigate("/dashboard/overview");
        }, 1200);
      } else {
        // ✉️ SignUp : pas de session tant que l’email n’est pas confirmé → on n’écrit rien dans les tables ici.
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // 📝 On mémorise l’intention (nom + rôle) côté backend
        try {
          await fetchApi("/auth/register-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, full_name: fullName, role: selectedRole }),
          });
        } catch (e) {
          console.error("register-intent failed:", e);
        }

        setMessage(
          "📩 Inscription reçue. Vérifiez votre e-mail pour confirmer votre compte. Le rôle choisi sera appliqué à votre première connexion."
        );
        setIsSignIn(true);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-center text-black">
          {isSignIn ? "Connexion" : "Créer un compte"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <input
              placeholder="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border rounded px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coaching-primary"
            />
          )}

          {!isSignIn && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Je suis :</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="investor"
                    checked={selectedRole === "investor"}
                    onChange={() => setSelectedRole("investor")}
                  />
                  <span>Investisseur</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    checked={selectedRole === "candidate"}
                    onChange={() => setSelectedRole("candidate")}
                  />
                  <span>Candidat</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Vous recevrez un email de confirmation. Le rôle choisi est enregistré et sera appliqué à votre première connexion.
              </p>
            </div>
          )}

          <input
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coaching-primary"
          />

          <div className="relative">
            <input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded px-4 py-2 pr-10 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coaching-primary"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white rounded transition-colors duration-200 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-coaching-primary hover:bg-coaching-secondary"
            }`}
          >
            {loading ? "Chargement..." : isSignIn ? "Connexion" : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignIn(!isSignIn);
            setError("");
            setMessage("");
          }}
          className="w-full text-sm text-center text-coaching-primary hover:text-coaching-secondary transition duration-200"
        >
          {isSignIn ? "Créer un compte" : "J’ai déjà un compte"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
