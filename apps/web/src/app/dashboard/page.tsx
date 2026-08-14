"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, 
  Truck, History, Wallet, BarChart3, ShieldCheck, Settings,
  Bell, Wifi, WifiOff, Smartphone, Plus, DollarSign, AlertTriangle, 
  ArrowUpRight, ChevronDown, User, Receipt, LogOut, Store, 
  Calculator, FolderTree
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.role !== "ADMIN") {
        if (parsedUser.role === "MANAGER") {
          router.push("/products");
        } else {
          router.push("/pos");
        }
      }
    } else {
      router.push("/login");
    }
    
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchDashboardData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

    try {
      const [salesRes, productsRes, customersRes, expensesRes] = await Promise.all([
        axios.get(`${apiUrl}/sales`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/expenses`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSales(salesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Erreur de chargement du dashboard");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const salesToday = sales.filter(s => new Date(s.createdAt).toDateString() === today);
    const revenueToday = salesToday.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalDebt = customers.reduce((acc, c) => acc + (c.debt || 0), 0);
    const estimatedProfit = (revenueToday * 0.20) - totalExpenses;
    const lowStockProducts = products.filter(p => p.stock < (p.lowStockThreshold || 5));

    return {
      revenueToday,
      salesCountToday: salesToday.length,
      estimatedProfit,
      totalDebt,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 3), 
      recentSales: sales.slice(0, 5) 
    };
  }, [sales, products, customers, expenses]);

  if (!isMounted || !user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden text-left">
      
      {/* 1. SIDEBAR - Bordure droite plus marquée */}
      <aside className="w-72 bg-[#0B0F1A] border-r border-slate-700/50 flex flex-col h-screen sticky top-0 shrink-0 text-left z-40">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 mb-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/20">
            <ShoppingCart className="text-white" size={24} />
          </div>
          <div className="text-left">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">SaaS Commerce</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">PWA Multi-Tenant</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto text-left scrollbar-hide">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Tableau de Bord" active />
          <Link href="/pos"><NavItem icon={<ShoppingCart size={20}/>} label="Caisse / POS" badge="Vente" /></Link>
          <Link href="/products"><NavItem icon={<Package size={20}/>} label="Produits & Stocks" /></Link>
          <Link href="/categories"><NavItem icon={<FolderTree size={20}/>} label="Catégories" /></Link>
          <Link href="/customers"><NavItem icon={<Users size={20}/>} label="Clients & Dettes" /></Link>
          <Link href="/suppliers"><NavItem icon={<Truck size={20}/>} label="Fournisseurs" /></Link>
          <Link href="/sales-history"><NavItem icon={<History size={20}/>} label="Historique Ventes" /></Link>
          <Link href="/expenses"><NavItem icon={<DollarSign size={20}/>} label="Gestion Dépenses" /></Link>
          <Link href="/accounting"><NavItem icon={<Calculator size={20}/>} label="Comptabilité" /></Link>
          <Link href="/reports"><NavItem icon={<BarChart3 size={20}/>} label="Rapports & Stats" /></Link>
        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-[#080b14]">
          <Link href="/settings"><NavItem icon={<Settings size={20}/>} label="Paramètres" /></Link>
          <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="w-full mt-2 text-left">
            <NavItem icon={<LogOut size={20} className="text-red-500" />} label="Déconnexion" />
          </button>
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        
        {/* HEADER - Bordure basse plus visible */}
        <header className="h-20 border-b border-slate-700/50 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 text-left">
            <div className="flex items-center gap-3 bg-[#111827] px-4 py-2 rounded-xl border border-slate-700 shadow-sm">
              <Store size={16} className="text-indigo-400"/>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">Entreprise</span>
                <span className="text-sm text-slate-100 font-bold mt-1">{user?.companyName}</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-xl border-2 ${isOnline ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-[10px] uppercase ring-1 ring-white/10">{user?.email?.charAt(0)}</div>
                <div className="text-left leading-none ml-1">
                  <p className="text-[10px] font-black text-slate-100 uppercase">{user?.name || "Admin"}</p>
                  <p className="text-[8px] text-indigo-400 font-black uppercase mt-1 tracking-wider">{user?.role}</p>
                </div>
             </div>
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* --- BANNIÈRE D'ACTIONS (DÉLIMITATION PAGE BIEN VISIBLE) --- */}
          <div className="bg-[#0B0F1A] p-8 rounded-[2rem] border-2 border-slate-700/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group">
            {/* Effet visuel d'arrière plan pour structurer le bloc */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10 group-hover:bg-indigo-600/10 transition-colors"></div>
            
            <div className="text-left">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg border border-indigo-500/30 ring-1 ring-indigo-500/10">
                Tableau de bord exécutif
              </span>
              <h2 className="text-4xl font-black mt-4 tracking-tight text-white leading-tight">
                {user?.companyName || "Alimentation Le Progrès"} <span className="text-slate-500 font-medium">(Ouagadougou)</span>
              </h2>
              <p className="text-slate-400 text-sm mt-2 font-medium opacity-80 border-l-2 border-indigo-500/50 pl-4">
                Synthèse en temps réel des ventes, de la caisse et du stock local.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/pos" className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-7 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400/30 active:scale-95">
                <ShoppingCart size={22} />
                <span>Nouvelle Vente (POS)</span>
              </Link>

              <Link href="/products" className="flex items-center gap-2 bg-[#1e293b]/60 hover:bg-[#1e293b] text-slate-100 px-6 py-4 rounded-2xl font-bold border-2 border-slate-700 transition-all shadow-lg active:scale-95">
                <Plus size={22} className="text-indigo-400" />
                <span>Nouveau Produit</span>
              </Link>

              <Link href="/expenses" className="flex items-center gap-2 bg-[#1e293b]/60 hover:bg-[#1e293b] text-slate-100 px-6 py-4 rounded-2xl font-bold border-2 border-slate-700 transition-all shadow-lg active:scale-95">
                <DollarSign size={22} className="text-rose-400" />
                <span>Saisir Dépense</span>
              </Link>
            </div>
          </div>

          {/* STATS CARDS - Structurées en grille avec bordures nettes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Ventes du jour" value={`${stats.revenueToday.toLocaleString()} F`} sub={`${stats.salesCountToday} tickets`} icon={<ArrowUpRight size={22}/>} color="emerald" />
            <StatCard label="Bénéfice estimé" value={`${stats.estimatedProfit.toLocaleString()} F`} sub="Marge brute (20%)" icon={<DollarSign size={22}/>} color="indigo" />
            <StatCard label="Crédits Clients" value={`${stats.totalDebt.toLocaleString()} F`} sub="Total des dettes" link="/customers" icon={<Users size={22}/>} color="amber" />
            <StatCard label="Stock Critique" value={`${stats.lowStockCount} articles`} sub="En rupture de stock" link="/products" icon={<AlertTriangle size={22}/>} color="red" />
          </div>

          {/* SECTION BASSE - Division en deux colonnes bien distinctes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
            
            {/* Colonne Alertes - Bordure rouge discrète */}
            <div className="lg:col-span-4 bg-[#0B0F1A] rounded-[2rem] border border-slate-700/50 p-8 shadow-xl ring-1 ring-red-500/5 text-left">
              <h3 className="font-black text-xs flex items-center gap-3 text-red-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-slate-800/50">
                <AlertTriangle size={18} /> Alertes prioritaires
              </h3>
              <div className="space-y-4">
                {stats.lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-[#020617]/50 rounded-2xl border border-slate-800 ring-1 ring-white/5 hover:border-red-500/30 transition-colors">
                    <p className="font-bold text-sm text-slate-200">{p.name}</p>
                    <span className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-black border border-red-500/20">{p.stock} restant</span>
                  </div>
                ))}
                {stats.lowStockCount === 0 && <p className="text-center py-10 text-slate-600 text-xs font-bold uppercase opacity-30 tracking-widest">Aucune rupture détectée</p>}
              </div>
            </div>

            {/* Colonne Flux de Caisse - Bordure indigo discrète */}
            <div className="lg:col-span-8 bg-[#0B0F1A] rounded-[2rem] border border-slate-700/50 p-8 shadow-xl ring-1 ring-indigo-500/5 text-left">
              <h3 className="font-black text-xs flex items-center gap-3 text-slate-200 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-slate-800/50">
                <Receipt size={18} className="text-indigo-400" /> Flux de caisse récent
              </h3>
              <div className="space-y-3">
                {stats.recentSales.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-[#020617]/50 rounded-2xl border border-slate-800 ring-1 ring-white/5 hover:border-indigo-500/40 transition-all hover:translate-x-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">{s.paymentType}</span>
                      <p className="text-sm font-bold text-slate-100">{s.invoiceRef || "VENTE DIRECTE"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-black text-base">{s.totalAmount.toLocaleString()} F</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Payé</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
  return (
    <div className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group ring-1 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-indigo-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white ring-transparent hover:ring-slate-700'} ${highlight ? 'bg-amber-500/5 border border-amber-500/10 !text-amber-500 ring-amber-500/20' : ''}`}>
      <div className="flex items-center gap-4">
        <span className={`${active ? 'text-white' : highlight ? 'text-amber-500' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`}>{icon}</span>
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">{badge}</span>}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color, link = "#" }: any) {
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 ring-emerald-500/10",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 ring-indigo-500/10",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 ring-amber-500/10",
    red: "text-red-400 bg-red-500/10 border-red-500/20 ring-red-500/10"
  };
  return (
    <div className="p-6 bg-[#0B0F1A] rounded-[2rem] border border-slate-700/60 shadow-xl relative text-left group hover:border-slate-500 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="text-left font-bold">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{label}</p>
          <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border-2 shadow-inner ${colors[color]}`}>{icon}</div>
      </div>
      <Link href={link} className={`text-[10px] font-black block ${colors[color].split(' ')[0]} bg-white/5 w-fit px-3 py-1 rounded-full opacity-80 hover:opacity-100 transition-all uppercase tracking-widest text-left ring-1 ring-white/5`}>
        {sub}
      </Link>
    </div>
  );
}