"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Truck, Receipt,
  DollarSign, Calculator, BarChart3, Settings, Wifi, WifiOff, Bell,
  ChevronDown, Plus, X, Search, Phone, Wallet, LogOut, MapPin, Home,
  History, ShieldCheck, Lock // <-- Toutes les icônes sont importées
} from "lucide-react";

// --- IMPORT DE LA BASE LOCALE ---
import { db } from "../../lib/db";

export default function CustomersPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);

  // URL de l'API dynamique
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // --- ÉTATS POUR LES MODALS ---
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [selectedClientForPayment, setSelectedClientForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string | number>("");

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
    } else {
        router.push("/login");
    }

    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); fetchCustomersFromServer(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    initData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const initData = async () => {
    try {
      const localClients = await db.customers.toArray();
      if (localClients.length > 0) setClients(localClients);

      const localProducts = await db.products.toArray();
      setLowStockCount(localProducts.filter((p: any) => p.stock < 5).length);
    } catch (e) {
      console.error("Erreur base locale:", e);
    }

    if (navigator.onLine) {
      await fetchCustomersFromServer();
    }
  };

  const fetchCustomersFromServer = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await db.customers.bulkPut(res.data).catch(() => {});
      setClients(res.data);
    } catch (err) {
      console.error("Mode local activé");
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${apiUrl}/customers`,
        { name: newClientName, phone: newClientPhone, address: newClientAddress, debt: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCustomersFromServer();
      setShowNewClientModal(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewClientAddress("");
    } catch (err) {
      alert("Erreur lors de la création.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedClientForPayment || !paymentAmount || Number(paymentAmount) <= 0) return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${apiUrl}/customers/${selectedClientForPayment.id}/debt`,
        { amount: -Number(paymentAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCustomersFromServer();
      setSelectedClientForPayment(null);
      setPaymentAmount("");
    } catch (err) {
      alert("Erreur lors du règlement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || !user) return null;

  const filteredClients = clients.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm)
  );

  const totalDebt = clients.reduce((acc, c) => acc + (c.debt || 0), 0);
  const isAdmin = user.role === "ADMIN";
  const isCashier = user.role === "CASHIER";

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans text-sm overflow-hidden text-left">
      
      {/* 1. SIDEBAR GAUCHE (COMPLÈTE POUR ADMIN) */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 shrink-0 text-left">
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
          <NavItem icon={<Users size={18}/>} label="Clients et Dettes" active />
          
          {isAdmin && (
            <>
              <Link href="/suppliers"><NavItem icon={<Truck size={18}/>} label="Fournisseurs" /></Link>
              <Link href="/sales-history"><NavItem icon={<History size={18}/>} label="Ventes historiques" /></Link>
              <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
              <div className="my-2 border-t border-slate-800/60 pt-2 space-y-1">
                <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
                <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>
              </div>
              <div className="my-2 border-t border-slate-800/60 pt-2">
                <Link href="/settings"><NavItem icon={<Settings size={18}/>} label="Paramètres" /></Link>
              </div>
            </>
          )}
        </nav>

        <div className="p-3 mt-auto space-y-1">
           <button className="w-full flex items-center gap-3 px-4 py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all font-bold">
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
            <div className="flex items-center gap-2 bg-[#0D1629] px-3 py-1.5 rounded-lg border-2 border-slate-800 font-bold text-xs">
              <Home size={15} className="text-slate-400" />
              <span className="text-slate-200 font-bold">{user?.companyName}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border-2 ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>} <span>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white uppercase">{user?.email?.charAt(0)}</div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* BANDEAU RECTANGLE (rounded-none) */}
          <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl mb-8">
            <div className="text-left font-bold">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Comptes Clients & Dettes</h2>
                <p className="text-xs text-slate-500 mt-2 font-medium">Suivi des créances et remboursements.</p>
            </div>
            <div className="flex items-center gap-4 text-left">
               <div className="bg-[#0B1224] border-2 border-amber-500/30 rounded-none px-6 py-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dettes Totales</p>
                  <p className="text-amber-400 font-black text-xl">{totalDebt.toLocaleString()} F</p>
               </div>
               <button onClick={() => setShowNewClientModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-none font-black uppercase text-xs shadow-xl flex items-center gap-2 transition-all">
                  <Plus size={18} /> Nouveau Client
               </button>
            </div>
          </div>

          <div className="relative mb-8 text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher un client..." className="w-full bg-[#0D1629] border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 font-bold text-slate-200" />
          </div>

          {/* TABLEAU : LIGNES ET BORDURES TRÈS VISIBLES */}
          <div className="bg-[#0B1224] border-2 border-slate-700 rounded-none overflow-hidden shadow-2xl">
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.2fr_1.2fr] gap-4 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-700 bg-slate-900/60">
              <span className="border-r border-slate-700/50">Nom du Client</span>
              <span className="border-r border-slate-700/50">Téléphone</span>
              <span className="border-r border-slate-700/50">Adresse</span>
              <span className="text-center border-r border-slate-700/50">Encours Crédit</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y-2 divide-slate-800">
              {filteredClients.map((c) => (
                <div key={c.id} className="grid grid-cols-[1.5fr_1fr_1.5fr_1.2fr_1.2fr] gap-4 px-8 py-6 items-center hover:bg-white/[0.04] transition-all odd:bg-white/[0.01]">
                  <p className="font-black text-slate-100 text-sm border-r border-slate-800/40 h-full flex items-center">{c.name}</p>
                  <p className="text-slate-400 text-xs font-mono border-r border-slate-800/40 h-full flex items-center gap-2"><Phone size={12} className="text-indigo-500" /> {c.phone || "---"}</p>
                  <p className="text-slate-500 text-xs truncate border-r border-slate-800/40 h-full flex items-center gap-2 italic"><MapPin size={12} className="text-indigo-500" /> {c.address || "---"}</p>
                  <div className="text-center border-r border-slate-800/40 h-full flex items-center justify-center">
                    <span className={`text-[13px] font-black px-4 py-1.5 rounded-lg border-2 ${c.debt > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800/50 text-slate-500 border-slate-700'}`}>
                      {c.debt.toLocaleString()} F
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    {c.debt > 0 && (
                      <button onClick={() => { setSelectedClientForPayment(c); setPaymentAmount(""); }} className="bg-[#10b981] hover:bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-none flex items-center gap-2 transition-all shadow-lg">
                        <Wallet size={14} /> Régler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest opacity-30 italic">Aucun client trouvé</div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL NOUVEAU CLIENT */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md text-left">
          <div className="bg-[#0B1120] border-2 border-slate-800 rounded-none w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowNewClientModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
            <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-8">Nouveau Client</h3>
            <div className="space-y-5 mb-10 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block text-left">Nom Complet *</label>
                <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block text-left">Téléphone</label>
                <input type="text" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block text-left">Adresse</label>
                <input type="text" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="w-full bg-[#020617] border-2 border-slate-800 rounded-none px-4 py-4 text-white outline-none focus:border-indigo-500 font-bold" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowNewClientModal(false)} className="flex-1 bg-slate-900 py-4 rounded-none font-bold text-slate-400 uppercase text-[10px]">Annuler</button>
              <button onClick={handleCreateClient} disabled={isSaving} className="flex-1 bg-[#5850EC] py-4 rounded-none font-black uppercase text-xs tracking-widest shadow-xl">{isSaving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RÈGLEMENT */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md text-center">
          <div className="bg-[#0B1120] border-2 border-slate-800 rounded-none w-full max-w-sm p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <h3 className="font-black text-white text-xl uppercase mb-2 tracking-tighter">Règlement de Dette</h3>
            <p className="text-slate-500 text-xs mb-8">Client: <span className="text-white font-bold">{selectedClientForPayment.name}</span></p>
            <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-6 text-3xl text-emerald-400 font-black outline-none mb-8 text-center" placeholder="0" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setSelectedClientForPayment(null)} className="flex-1 bg-slate-900 py-4 rounded-none font-bold text-slate-400 uppercase text-[10px]">Annuler</button>
              <button onClick={handleRecordPayment} disabled={isSaving} className="flex-1 bg-emerald-600 py-4 rounded-none font-black uppercase text-xs tracking-widest shadow-xl">{isSaving ? "..." : "Valider"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge = "", highlight = false }: any) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
      active
        ? "bg-indigo-600 text-white shadow-lg font-bold"
        : highlight
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
    }`}>
      <div className="flex items-center gap-3 text-left"><span>{icon}</span><span className="text-[13px] font-bold text-left">{label}</span></div>
      {badge && <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{badge}</span>}
    </div>
  );
}