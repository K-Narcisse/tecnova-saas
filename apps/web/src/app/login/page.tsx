"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, ShoppingCart, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ADRESSE RÉELLE DE TON SERVEUR API SUR O2SWITCH AVEC SLASH FINAL "/"
      const apiUrl = "https://tec-api.nuju9944.odns.fr/api";
      
      const response = await axios.post(`${apiUrl}/auth/login/`, {
        email: email.trim(), 
        password: password,
      });

      const user = response.data.user;
      const token = response.data.access_token;

      // 1. Stockage sécurisé des informations de session
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 2. REDIRECTION INTELLIGENTE SELON LE RÔLE
      if (user.role === "ADMIN") {
        router.push("/dashboard");
      } 
      else if (user.role === "MANAGER") {
        router.push("/products"); 
      } 
      else if (user.role === "CASHIER") {
        router.push("/pos"); 
      } 
      else {
        router.push("/");
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-sm">
      <div className="w-full max-w-md bg-[#0B1120] border border-slate-800/80 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden text-slate-300 text-left">
        
        {/* Effet décoratif de lumière */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
        
        <div className="text-center mb-10 text-left">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20 text-white font-bold">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-left">Connexion</h1>
          <p className="text-slate-500 font-medium mt-2 text-base font-bold text-left">Heureux de vous revoir.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* CHAMP EMAIL */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
              Votre adresse e-mail <span className="text-red-500 text-lg">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email" required
                placeholder="Ex: nom@gmail.com"
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-600"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* CHAMP MOT DE PASSE */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center px-2">
               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1">
                 Mot de passe <span className="text-red-500 text-lg">*</span>
               </label>
               <Link href="/forgot-password" 
                     className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-black tracking-widest">
                 Oublié ?
               </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"} required
                placeholder="••••••••"
                className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-indigo-500 transition-all text-white font-bold placeholder:text-slate-600"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Vérification en cours..." : <>Se connecter <LogIn size={20}/></>}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-bold">
          Pas encore de compte ? <Link href="/register" className="text-indigo-400 hover:underline transition-all">Créer une boutique</Link>
        </p>
      </div>
    </div>
  );
}