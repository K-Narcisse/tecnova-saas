"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck, Receipt, 
  DollarSign, Calculator, BarChart3, Settings, LogOut, Home, Wifi, WifiOff,
  UserPlus, Key, Save, Download, Pencil, Trash2, X, Store, FolderTree, History, Lock, ShieldCheck
} from "lucide-react";

// --- IMPORT DU COMPOSANT MODAL ---
import AddUserModal from "./components/AddUserModal";

export default function SettingsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- CONFIGURATION URL API ---
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // --- ÉTATS ---
  const [companyData, setCompanyData] = useState({
    name: "", phone: "", address: "", ifu: "", rccm: ""
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // --- SÉCURITÉ : SEUL L'ADMIN GÈRE LES PARAMÈTRES ---
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
      const [compRes, empRes] = await Promise.all([
        axios.get(`${apiUrl}/companies/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/auth/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCompanyData(compRes.data);
      setEmployees(empRes.data);
    } catch (err) { 
      console.error("Erreur chargement données"); 
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${apiUrl}/companies/mine`, companyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Boutique mise à jour !");
    } catch (err) { 
      alert("Erreur lors de la sauvegarde"); 
    } finally { setIsLoading(false); }
  };

  const handleSaveUser = async (userData: any) => {
    setIsSavingUser(true);
    const token = localStorage.getItem("token");
    try {
      if (editingEmployee) {
        await axios.patch(`${apiUrl}/auth/employees/${editingEmployee.id}`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${apiUrl}/auth/employees`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowAddUserModal(false);
      setEditingEmployee(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally { setIsSavingUser(false); }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet employé ?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${apiUrl}/auth/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (!isMounted || !user || user.role !== "ADMIN") return null;

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
              <Link href="/expenses"><NavItem icon={<DollarSign size={18}/>} label="Gestion Dépenses" /></Link>
              <div className="my-2 border-t border-slate-800/40 pt-2 space-y-1 text-left">
                <Link href="/accounting"><NavItem icon={<Calculator size={18}/>} label="Comptabilité" /></Link>
                <Link href="/reports"><NavItem icon={<BarChart3 size={18}/>} label="Rapports et statistiques" /></Link>
              </div>
              <div className="my-2 border-t border-slate-800/40 pt-2 text-left">
                <NavItem icon={<Settings size={18}/>} label="Paramètres" active />
              </div>
            </>
          )}
        </nav>

        <div className="p-3 mt-auto space-y-1 text-left">
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
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#070C18]/80 backdrop-blur-md sticky top-0 z-50 text-left">
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

        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800 text-left">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* HEADER PAGE - RECTANGLE (rounded-none) */}
            <div className="p-8 border-2 border-slate-700 bg-[#0D1629] rounded-none flex items-center justify-between shadow-2xl">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-none flex items-center justify-center border-2 border-indigo-500/30">
                     <Settings size={24} />
                  </div>
                  <div className="text-left font-bold">
                     <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Paramètres & Utilisateurs</h2>
                     <p className="text-xs text-slate-500 mt-2">Gestion globale de la boutique et du personnel.</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start text-left">
               
               {/* INFOS BOUTIQUE - BORDURES RENFORCÉES */}
               <div className="bg-[#0D1629] rounded-none border-2 border-slate-700 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-800 pb-4">
                     <Store size={18} className="text-indigo-500" />
                     <h3 className="font-black text-white uppercase text-xs tracking-widest">Coordonnées Boutique</h3>
                  </div>
                  <form onSubmit={handleSaveSettings} className="space-y-5">
                     <div className="space-y-1.5 text-left font-bold">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom Commercial</label>
                        <input type="text" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none focus:border-indigo-500 text-xs" value={companyData.name || ""} onChange={(e) => setCompanyData({...companyData, name: e.target.value})} />
                     </div>
                     <div className="space-y-1.5 text-left font-bold">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tél. de contact</label>
                        <input type="text" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none focus:border-indigo-500 text-xs" value={companyData.phone || ""} onChange={(e) => setCompanyData({...companyData, phone: e.target.value})} />
                     </div>
                     <div className="space-y-1.5 text-left font-bold">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Adresse Géo.</label>
                        <input type="text" className="w-full bg-[#020617] border-2 border-slate-800 rounded-none p-4 text-white outline-none focus:border-indigo-500 text-xs" value={companyData.address || ""} onChange={(e) => setCompanyData({...companyData, address: e.target.value})} />
                     </div>
                     <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">
                        {isLoading ? "MISE À JOUR..." : "ÉCONOMISER LES MODIFS"}
                     </button>
                  </form>
               </div>

               {/* LISTE DES EMPLOYÉS - BORDURES RENFORCÉES */}
               <div className="bg-[#0D1629] rounded-none border-2 border-slate-700 p-8 shadow-2xl h-[560px] flex flex-col">
                  <div className="flex items-center justify-between mb-8 border-b-2 border-slate-800 pb-4">
                     <div className="flex items-center gap-3">
                        <Users size={18} className="text-indigo-500" />
                        <h3 className="font-black text-white uppercase text-xs tracking-widest">Personnel</h3>
                     </div>
                     <button onClick={() => { setEditingEmployee(null); setShowAddUserModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-none font-black text-[9px] uppercase transition-all shadow-lg">+ NOUVEAU</button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-600/30">
                     <div className="space-y-3">
                        {employees.map((emp) => (
                          <div key={emp.id} className="bg-[#070C18] border-2 border-slate-800 rounded-none p-5 flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-sm">
                             <div className="text-left leading-tight">
                                <p className="font-black text-slate-100 text-xs uppercase tracking-tight">{emp.name || "Sans nom"}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">{emp.email}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                <button onClick={() => { setEditingEmployee(emp); setShowAddUserModal(true); }} className="p-2.5 bg-slate-800/50 text-slate-400 rounded-lg hover:text-indigo-400 hover:bg-indigo-400/10 transition-all"><Pencil size={14}/></button>
                                <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2.5 bg-slate-800/50 text-slate-400 rounded-lg hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={14}/></button>
                                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20 ml-2">
                                   <Key size={10} /><span className="text-[10px] font-black font-mono">{emp.pinCode || "****"}</span>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </main>

      {/* MODAL UTILISATEUR */}
      <AddUserModal 
        isOpen={showAddUserModal} 
        onClose={() => { setShowAddUserModal(false); setEditingEmployee(null); }} 
        onSave={handleSaveUser}
        isLoading={isSavingUser}
        initialData={editingEmployee}
      />
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