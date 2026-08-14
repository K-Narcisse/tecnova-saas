"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Receipt, 
  DollarSign, Calculator, BarChart3, Settings, ShieldCheck, Smartphone,
  Plus, Search, Wifi, WifiOff, Bell, Home, LogOut, Trash2, X, Tag, 
  FolderTree, History, Lock // <-- Toutes les icônes sont importées
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ---
import { db } from "../../lib/db"; 

export default function ExpensesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", amount: "", category: "DIVERS" });
  const [isLoading, setIsLoading] = useState(false);

  // URL dynamique
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // SÉCURITÉ : Le caissier n'a pas accès aux dépenses
      if (parsedUser.role === "CASHIER") {
        router.push("/pos");
      }
    } else {
      router.push("/login");
    }

    setIsOnline(navigator.onLine);
    fetchExpenses();
  }, [router]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (err) { 
      console.error("Erreur récup dépenses"); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${apiUrl}/expenses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ title: "", amount: "", category: "DIVERS" });
      fetchExpenses();
    } catch (err) { 
      alert("Erreur lors de l'enregistrement"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (!isMounted || !user) return null;

  const totalAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const filteredExpenses = expenses.filter(e => 
    (e.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left">
      
      {/* 1. SIDEBAR GAUCHE (COMPLÈTE POUR ADMIN) */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
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
          
          {isAdmin && (
            <>
              <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
              <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
              <NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" active />
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
           <button onClick={() => router.push("/pos")} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold text-left">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-left">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs text-slate-200 text-left">
              <Home size={14} className="text-slate-400" /> {user?.companyName}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* HEADER SECTION - RECTANGLE (rounded-none) */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
             <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-none flex items-center justify-center border-2 border-rose-500/30 shadow-lg shadow-rose-900/10">
                   <DollarSign size={24} />
                </div>
                <div className="text-left font-bold">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Gestion des Dépenses</h2>
                   <p className="text-xs text-slate-500 mt-2 font-medium italic">Suivi des charges de fonctionnement et de logistique.</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="bg-[#0B1224] border-2 border-slate-800 px-6 py-4 rounded-none text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Cumulé</p>
                   <p className="text-xl font-black text-rose-400 mt-1">{totalAmount.toLocaleString()} F</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-none font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-900/20 transition-all flex items-center gap-2">
                   <Plus size={18} /> Saisir Dépense
                </button>
             </div>
          </div>

          {/* RECHERCHE */}
          <div className="relative text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" value={searchTerm || ""} onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Chercher par motif ou catégorie..." 
              className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-rose-500 font-bold text-slate-200 shadow-xl"
            />
          </div>

          {/* TABLEAU - LIGNES VERTICALES ET BORDURES RENFORCÉES */}
          <div className="bg-[#0B1224] border-2 border-slate-700 rounded-none overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b-2 border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 border-r border-slate-700/50">Catégorie</th>
                  <th className="px-8 py-5 border-r border-slate-700/50">Motif / Description</th>
                  <th className="px-8 py-5 border-r border-slate-700/50 text-center">Date & Heure</th>
                  <th className="px-8 py-5 border-r border-slate-700/50 text-right">Montant</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.04] transition-all odd:bg-white/[0.01]">
                    <td className="px-8 py-6 border-r border-slate-800/40">
                       <div className="flex items-center gap-3">
                          <Tag size={14} className="text-rose-500" />
                          <span className="font-black text-slate-100 uppercase text-[11px] tracking-tighter">{exp.category}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-200 text-sm border-r border-slate-800/40">{exp.title}</td>
                    <td className="px-8 py-6 text-center text-slate-500 text-xs font-mono border-r border-slate-800/40">
                       {new Date(exp.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-rose-400 text-base border-r border-slate-800/40">{exp.amount.toLocaleString()} F</td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-3 text-slate-500">
                          <button className="p-2 hover:bg-red-500/10 rounded-lg hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length === 0 && (
              <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest opacity-20 italic">Aucune dépense enregistrée</div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL AJOUT - RECTANGLE POUR LE BOUTON */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
          <div className="w-full max-w-md bg-[#0B1224] border-2 border-slate-800 rounded-none p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Saisie Dépense</h2>
               <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Catégorie</label>
                <select className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="TRANSPORT">TRANSPORT</option>
                  <option value="ELECTRICITE">ELECTRICITÉ</option>
                  <option value="EAU">EAU</option>
                  <option value="SALAIRE">SALAIRE</option>
                  <option value="LOYER">LOYER</option>
                  <option value="DIVERS">DIVERS</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Motif / Description</label>
                <input type="text" required className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none font-bold" value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})}/>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Montant (FCFA)</label>
                <input type="number" required className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none font-black text-lg" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: e.target.value})}/>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-900 text-slate-400 py-4 rounded-none font-bold uppercase text-[10px]">Annuler</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-rose-600 text-white py-4 rounded-none font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-900/20">
                  {isLoading ? '...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
    }`}>
      <div className="flex items-center gap-4 text-left leading-tight">
        <span className={active ? "text-white" : "text-indigo-400"}>{icon}</span>
        <span className="text-[13px] font-black tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{badge}</span>}
    </div>
  );
}