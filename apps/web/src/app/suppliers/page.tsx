"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Plus, Search, 
  Mail, Phone, MapPin, X, Trash2, Home, Wifi, WifiOff, LogOut, Receipt, DollarSign, 
  Calculator, BarChart3, Settings, ShieldCheck, Smartphone, History, FolderTree, Lock
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ---
import { db } from "../../lib/db"; 

export default function SuppliersPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });
  const [isLoading, setIsLoading] = useState(false);

  // URL dynamique
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // SÉCURITÉ : Seuls l'ADMIN et le MANAGER accèdent aux Fournisseurs
      if (parsedUser.role === "CASHIER") {
        router.push("/pos");
      }
    } else {
      router.push("/login");
    }
    
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); fetchSuppliers(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    initData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const initData = async () => {
    try {
      const localSupps = await db.suppliers.toArray();
      if (localSupps.length > 0) setSuppliers(localSupps);
    } catch (e) { console.error(e); }

    if (navigator.onLine) {
      await fetchSuppliers();
    }
  };

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await db.suppliers.bulkPut(res.data).catch(e => console.warn(e));
      setSuppliers(res.data);
    } catch (err) {
      console.error("Erreur API fournisseurs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${apiUrl}/suppliers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ name: "", phone: "", email: "", address: "" });
      fetchSuppliers();
    } catch (err) {
      alert("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || !user) return null;

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user?.role === "ADMIN";
  const isCashier = user?.role === "CASHIER";

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left">
      
      {/* 1. SIDEBAR GAUCHE (COMPLÈTE POUR ADMIN) */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold">
                <ShoppingCart size={22} strokeWidth={2.5}/>
             </div>
             <h1 className="font-black text-white text-base tracking-tight">SaaS Commerce</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {isAdmin && <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>}
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" badge="Vente" /></Link>
          <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits et stocks" /></Link>
          <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          <NavItem icon={<Truck size={18}/>} label="Fournisseurs" active />
          
          {isAdmin && (
            <>
              <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
              <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
              <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1">
                <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
                <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>
              </div>
              <div className="my-2 border-t border-slate-800/40 pt-2">
                <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
              </div>
            </>
          )}
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button onClick={() => router.push("/pos")} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs text-slate-200">
              <Home size={14} className="text-slate-400" /> {user?.companyName}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 space-y-6">
          {/* BANDEAU RECTANGLE */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
             <div className="text-left font-bold">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Fournisseurs & Achats</h2>
                <p className="text-xs text-slate-500 mt-2 font-medium">Gestion des partenaires commerciaux.</p>
             </div>
             <button onClick={() => setShowAddModal(true)} className="bg-[#5850EC] hover:bg-[#453ECE] text-white px-6 py-4 rounded-none font-black uppercase text-xs shadow-xl transition-all flex items-center gap-2 tracking-widest">
                <Plus size={18} /> Nouveau Fournisseur
             </button>
          </div>

          <div className="relative text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" value={searchTerm || ""} onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Rechercher un fournisseur..." 
              className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 font-bold text-slate-200"
            />
          </div>

          {/* GRILLE DES FOURNISSEURS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.map((s) => (
              <div key={s.id} className="bg-[#0D1629] border-2 border-slate-700 rounded-[2.5rem] p-8 hover:border-indigo-500 transition-all group relative text-left shadow-xl">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">{s.name}</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-slate-400 border-b border-slate-800/40 pb-2">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><Phone size={14} className="text-indigo-400" /></div>
                      <span className="font-bold text-xs">{s.phone || "---"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-400 border-b border-slate-800/40 pb-2">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><Mail size={14} className="text-indigo-400" /></div>
                      <span className="font-medium text-xs">{s.email || "---"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><MapPin size={14} className="text-indigo-400" /></div>
                      <span className="font-medium text-xs italic">{s.address || "---"}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL AJOUT */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
          <div className="w-full max-w-md bg-[#0B1224] border-2 border-slate-800 rounded-none p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ajouter</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nom / Raison Sociale</label>
                <input type="text" required className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none font-bold" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Téléphone</label>
                <input type="text" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none font-bold" value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email</label>
                <input type="email" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none font-bold" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Adresse</label>
                <input type="text" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none font-bold" value={formData.address || ""} onChange={(e) => setFormData({...formData, address: e.target.value})}/>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-4 mt-4 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl">
                {isLoading ? "Traitement..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
      active
        ? "bg-indigo-600 text-white shadow-lg font-bold"
        : highlight
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
    }`}>
      <div className="flex items-center gap-3 text-left"><span>{icon}</span><span className="text-[13px] font-bold text-left leading-tight">{label}</span></div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{badge}</span>}
    </div>
  );
}