"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Receipt, 
  DollarSign, Calculator, BarChart3, Settings, ShieldCheck, Smartphone,
  Wifi, WifiOff, Bell, Home, LogOut, Search, ArrowUpRight, ArrowDownLeft, BookOpen,
  Lock, History, FolderTree
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ---
import { db } from "../../lib/db";

export default function AccountingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // --- ÉTATS POUR LES DONNÉES ---
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCOGS: 0,
    grossMargin: 0,
    netProfit: 0
  });
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // URL dynamique pour l'API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // --- SÉCURITÉ : SEUL L'ADMIN ACCÈDE À LA COMPTABILITÉ ---
      if (parsedUser.role !== "ADMIN") {
        if (parsedUser.role === "MANAGER") router.push("/products");
        else router.push("/pos");
      }
    } else {
      router.push("/login");
    }

    setIsOnline(navigator.onLine);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [summaryRes, journalRes] = await Promise.all([
        axios.get(`${apiUrl}/accounting/summary`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${apiUrl}/accounting/journal`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      
      setStats(summaryRes.data);
      setJournal(journalRes.data);
    } catch (err) {
      console.error("Erreur de récupération des données comptables");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left selection:bg-indigo-500">
      
      {/* 1. SIDEBAR GAUCHE (CONFORME À L'IMAGE) */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3 text-left">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <ShoppingCart size={22} strokeWidth={2.5}/>
             </div>
             <h1 className="font-black text-white text-base tracking-tight">SaaS Commerce</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" badge="Vente" /></Link>
          <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits et stocks" /></Link>
          <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
          <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
          <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
          
          <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1">
             <NavItem icon={<Calculator size={18}/>} label="Comptabilité" active />
             <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>
          </div>

          <div className="my-2 border-t border-slate-800/40 pt-2">
             <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
          </div>
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button onClick={() => router.push("/pos")} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold text-left">
              <Lock size={18} /> Verrouiller
           </button>
           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-left text-left">
              <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070C18]">
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs text-slate-200">
              <Home size={14} className="inline mr-2 text-slate-400" /> {user?.companyName}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-64px)]">
          
          {/* HEADER SECTION - RECTANGLE (rounded-none) */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
             <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-none flex items-center justify-center border-2 border-indigo-500/30">
                   <Calculator size={24} />
                </div>
                <div className="text-left font-bold">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Comptabilité Simplifiée</h2>
                   <p className="text-xs text-slate-500 mt-2 font-medium italic">Grand livre des écritures et suivi des flux de trésorerie.</p>
                </div>
             </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-[#0D1629] border-2 border-slate-800 p-8 rounded-none shadow-lg text-left">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recettes (Ventes)</p>
                   <ArrowUpRight className="text-emerald-500" size={20} />
                </div>
                <p className="text-3xl font-black text-emerald-400">{stats.totalRevenue.toLocaleString()} F</p>
                <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase">COGS (Achats): {stats.totalCOGS.toLocaleString()} F</p>
             </div>

             <div className="bg-[#0D1629] border-2 border-slate-800 p-8 rounded-none shadow-lg text-left">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dépenses & Charges</p>
                   <ArrowDownLeft className="text-rose-500" size={20} />
                </div>
                <p className="text-3xl font-black text-rose-400">{stats.totalExpenses.toLocaleString()} F</p>
                <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase">Toutes charges décaissées</p>
             </div>

             <div className="bg-[#0D1629] border-2 border-slate-800 p-8 rounded-none shadow-lg text-left">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bénéfice Net</p>
                   <DollarSign className="text-indigo-500" size={20} />
                </div>
                <p className="text-3xl font-black text-indigo-400">{stats.netProfit.toLocaleString()} F</p>
                <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase">Marge Brute: {stats.grossMargin.toLocaleString()} F</p>
             </div>
          </div>

          {/* JOURNAL GÉNÉRAL - LIGNES VERTICALES ET BORDURES RENFORCÉES */}
          <div className="bg-[#0B1224] rounded-none border-2 border-slate-700 overflow-hidden shadow-2xl">
             <div className="p-6 border-b-2 border-slate-700 bg-slate-900/40 flex items-center gap-3">
                <BookOpen size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">Journal Général des Écritures</h3>
             </div>
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-900/60 border-b-2 border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 border-r border-slate-700/50">DATE</th>
                      <th className="px-8 py-5 border-r border-slate-700/50">TYPE</th>
                      <th className="px-8 py-5 border-r border-slate-700/50">CATÉGORIE</th>
                      <th className="px-8 py-5 border-r border-slate-700/50">LIBELLÉ / DESCRIPTION</th>
                      <th className="px-8 py-5 text-right text-emerald-500 border-r border-slate-700/50">DÉBIT (+)</th>
                      <th className="px-8 py-5 text-right text-rose-500">CRÉDIT (-)</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-800">
                   {journal.length > 0 ? journal.map((entry, idx) => (
                     <tr key={idx} className="hover:bg-white/[0.04] transition-all odd:bg-white/[0.01]">
                        <td className="px-8 py-6 text-slate-300 text-xs font-mono border-r border-slate-800/40">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-8 py-6 border-r border-slate-800/40">
                           <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border-2 uppercase tracking-tighter ${entry.type === 'RECETTE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                              {entry.type}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-slate-200 font-black uppercase text-[10px] tracking-tight border-r border-slate-800/40">{entry.category}</td>
                        <td className="px-8 py-6 text-slate-500 text-xs italic border-r border-slate-800/40 truncate max-w-xs">{entry.description}</td>
                        <td className="px-8 py-6 text-right font-black text-emerald-400 text-base border-r border-slate-800/40">
                           {entry.credit > 0 ? `${entry.credit.toLocaleString()} F` : '-'}
                        </td>
                        <td className="px-8 py-6 text-right font-black text-rose-400 text-base">
                           {entry.debit > 0 ? `${entry.debit.toLocaleString()} F` : '-'}
                        </td>
                     </tr>
                   )) : (
                     <tr>
                        <td colSpan={6} className="py-24 text-center text-slate-600 font-bold uppercase tracking-widest opacity-20 text-xs italic">Aucune transaction enregistrée</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "" }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
      <div className="flex items-center gap-4 text-left">
        <span className={active ? "text-white" : "text-indigo-400"}>{icon}</span>
        <span className="text-[13px] font-black tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-400/30">{badge}</span>}
    </div>
  );
}