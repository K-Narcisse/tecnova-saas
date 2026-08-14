"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Receipt, 
  DollarSign, Calculator, BarChart3, Settings, ShieldCheck, Smartphone,
  Wifi, WifiOff, Bell, Home, LogOut, Search, ChevronDown, FileDown, 
  Smartphone as MoMoIcon, CreditCard, Wallet, Crown, History, Lock, FolderTree
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // --- ÉTAT DES DONNÉES ---
  const [reportData, setReportData] = useState<any>({
    summary: { cash: 0, momo: 0, credit: 0, total: 0 },
    topProducts: []
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState("Mois");
  const [isLoading, setIsLoading] = useState(true);

  // URL dynamique
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // --- SÉCURITÉ : SEUL L'ADMIN ACCÈDE AUX RAPPORTS ---
      if (parsedUser.role !== "ADMIN") {
        if (parsedUser.role === "MANAGER") router.push("/products");
        else router.push("/pos");
      }
    } else {
      router.push("/login");
    }
    
    setIsOnline(navigator.onLine);
    fetchReportData();
  }, [selectedPeriod, router]);

  const fetchReportData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/reports/sales-summary?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Erreur rapports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.topProducts.length === 0) return;
    const headers = ["Classement", "Produit", "Quantite", "CA (FCFA)"];
    const rows = reportData.topProducts.map((p: any, idx: number) => [`#${idx + 1}`, p.name, p.qty, p.revenue]);
    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rapport_${selectedPeriod}.csv`);
    link.click();
  };

  const maxRevenue = useMemo(() => {
    if (!reportData.topProducts || reportData.topProducts.length === 0) return 1;
    return reportData.topProducts[0].revenue;
  }, [reportData.topProducts]);

  if (!isMounted || !user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left selection:bg-indigo-500">
      
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
          <Link href="/dashboard"><NavItem icon={<LayoutDashboard size={18}/>} label="Tableau de Bord" /></Link>
          <Link href="/pos"><NavItem icon={<ShoppingCart size={18}/>} label="Caisse / POS" badge="Vente" /></Link>
          <Link href="/products"><NavItem icon={<Package size={18}/>} label="Produits et stocks" /></Link>
          <Link href="/categories"><NavItem icon={<FolderTree size={18}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={18}/>} label="Clients et Dettes" /></Link>
          <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
          <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
          <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
          
          <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1">
             <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
             <NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" active />
          </div>

          <div className="my-2 border-t border-slate-800/40 pt-2">
             <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
          </div>
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button onClick={() => router.push("/pos")} className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
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
            <div className="bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs text-slate-200">
              <Home size={14} className="text-slate-400" /> {user?.companyName}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-indigo-600/20">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-64px)]">
          
          {/* BANDEAU TITRE - RECTANGLE (rounded-none) */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
             <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-none flex items-center justify-center border-2 border-indigo-500/30 shadow-lg">
                   <BarChart3 size={24} />
                </div>
                <div className="text-left font-bold">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Rapports & Stats Ventes</h2>
                   <p className="text-xs text-slate-500 mt-2 font-medium italic">Analyse des performances : <span className="text-indigo-400 font-bold">{selectedPeriod}</span></p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="bg-[#070C18] p-1 rounded-xl border-2 border-slate-800 flex">
                   {["Jour", "Semaine", "Mois", "Année"].map((p) => (
                     <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${selectedPeriod === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{p}</button>
                   ))}
                </div>
                <button onClick={handleExportCSV} className="bg-[#10b981] hover:bg-emerald-600 text-white px-6 py-4 rounded-none font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2">
                   <FileDown size={18} /> Exporter CSV
                </button>
             </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatCard label="Recettes Espèces" value={`${reportData.summary.cash.toLocaleString()} F`} icon={<DollarSign size={20}/>} color="emerald" />
             <StatCard label="Paiements Mobile" value={`${reportData.summary.momo.toLocaleString()} F`} icon={<MoMoIcon size={20}/>} color="amber" />
             <StatCard label="Ventes à Crédit" value={`${reportData.summary.credit.toLocaleString()} F`} icon={<Wallet size={20}/>} color="rose" />
          </div>

          {/* TOP PRODUITS - LIGNES TRÈS VISIBLES */}
          <div className="bg-[#0D1629] rounded-[2.5rem] border-2 border-slate-700 p-10 shadow-2xl text-left">
             <div className="flex items-center gap-3 mb-10 border-b border-slate-800 pb-6">
                <Crown size={22} className="text-amber-500" />
                <h3 className="font-black text-white uppercase tracking-wider text-sm">Top 5 Produits ({selectedPeriod})</h3>
             </div>

             <div className="space-y-10">
                {reportData.topProducts.map((prod: any, idx: number) => {
                  const percentage = (prod.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx} className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="font-black text-slate-100 text-sm"><span className="text-indigo-500 mr-2">#{idx + 1}</span> {prod.name}</p>
                          <p className="text-right font-black text-slate-200 text-base">{prod.revenue.toLocaleString()} F <span className="text-[10px] text-slate-500 ml-2 font-bold uppercase">({prod.qty} unités)</span></p>
                       </div>
                       <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800">
                          <div className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000 rounded-full" style={{ width: `${percentage}%` }} />
                       </div>
                    </div>
                  );
                })}
                {reportData.topProducts.length === 0 && (
                  <div className="py-20 text-center opacity-20 font-black uppercase text-xs tracking-widest">Aucune donnée pour cette période</div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
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

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    rose: "text-rose-400 border-rose-500/30 bg-rose-500/5"
  };
  return (
    <div className={`p-8 border-2 rounded-[2rem] shadow-xl text-left ${colors[color]}`}>
       <div className="flex justify-between items-start mb-4">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-70">{label}</p>
          {icon}
       </div>
       <p className="text-3xl font-black">{value}</p>
    </div>
  );
}