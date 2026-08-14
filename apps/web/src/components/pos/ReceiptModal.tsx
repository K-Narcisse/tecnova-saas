"use client";

import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from "lucide-react";

// --- AJOUT DES TYPES POUR LE BUILD ---
interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: any;
}

export default function ReceiptModal({ isOpen, onClose, saleData }: ReceiptModalProps) {
  if (!isOpen || !saleData) return null;

  // Sécurité : on récupère le montant soit de 'total' soit de 'totalAmount'
  const finalTotal = saleData.total ?? saleData.totalAmount ?? 0;
  const subTotal = finalTotal + (saleData.discount || 0);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <div className="relative w-full max-w-2xl bg-[#0B1224] border border-slate-800 rounded-[2.5rem] shadow-2xl p-10 flex flex-col animate-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20"><CheckCircle2 size={24}/></div>
                <div className="text-left">
                   <h2 className="text-xl font-black text-white leading-tight">Ticket &<br/>Facture</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Réf: {saleData.invoiceRef}</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 leading-tight">
                   <Printer size={16}/>
                   <span className="text-left">Ticket Thermique<br/><span className="font-medium opacity-80">(80mm)</span></span>
                </button>
                <button className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                   <FileText size={16}/> Facture A4
                </button>
                <button className="bg-[#10b981] text-white px-6 py-2 rounded-xl font-bold text-xs ml-4 flex items-center gap-2" onClick={() => window.print()}>
                   <Printer size={16}/> Imprimer
                </button>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white ml-2"><X size={24}/></button>
             </div>
          </div>

          <div className="bg-white text-black p-8 mx-auto w-[420px] shadow-2xl font-mono text-[11px] leading-tight text-left">
             <div className="text-center mb-6">
                <h3 className="text-[15px] font-black uppercase">ALIMENTATION LE PROGRÈS</h3>
                <p className="text-[13px] font-bold">(OUAGADOUGOU)</p>
                <div className="mt-3 text-[10px] text-gray-700 space-y-0.5 font-medium">
                   <p>Avenue Kwamé N'Krumah, Secteur 4, Ouagadougou</p>
                   <p>Tél: +226 25 30 11 22</p>
                   <p>N° IFU: 32001928371 | RCCM: BF-OUA-2023-B-4120</p>
                </div>
             </div>

             <div className="border-t border-b border-gray-300 py-3 my-4 space-y-1">
                <div className="flex justify-between uppercase"><span>Facture N°:</span><span className="font-black">{saleData.invoiceRef}</span></div>
                <div className="flex justify-between uppercase"><span>Date:</span><span className="font-black">{saleData.date || new Date(saleData.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between uppercase"><span>Caissier:</span><span className="font-black">Super Administrateur SaaS</span></div>
             </div>

             <div className="flex justify-between font-black border-b border-gray-300 pb-2 mb-2 uppercase text-[10px]">
                <span>Article</span>
                <span>Total</span>
             </div>

             <div className="space-y-4 mb-4">
                {(saleData.cart || []).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                     <div>
                        <p className="font-black text-[11px] uppercase">{item.name}</p>
                        <p className="text-[10px] text-gray-700 mt-0.5">{item.qty} x {item.price.toLocaleString()} FCFA</p>
                     </div>
                     <p className="font-black text-[11px]">{(item.qty * item.price).toLocaleString()} FCFA</p>
                  </div>
                ))}
             </div>

             <div className="border-t border-gray-300 pt-3 space-y-1.5 font-bold">
                <div className="flex justify-between"><span>Sous-total:</span><span>{subTotal.toLocaleString()} FCFA</span></div>
                {saleData.discount > 0 && <div className="flex justify-between text-red-600"><span>Remise:</span><span>-{saleData.discount.toLocaleString()} FCFA</span></div>}
                <div className="flex justify-between text-gray-600 font-medium italic"><span>TVA incl. (18%):</span><span>{(finalTotal * 0.18).toLocaleString(undefined, {maximumFractionDigits: 0})} FCFA</span></div>

                <div className="flex justify-between text-[16px] font-black border-t-2 border-black pt-2 mt-2 tracking-tighter uppercase">
                   <span>NET À PAYER:</span>
                   <span>{finalTotal.toLocaleString()} FCFA</span>
                </div>
             </div>

             <div className="mt-4 space-y-1 text-[9px] font-bold uppercase">
                <div className="flex justify-between">
                   <span>Mode de paiement:</span>
                   <span className="font-black underline">{saleData.paymentType}</span>
                </div>
                {saleData.amountReceived != null && (
                  <div className="flex justify-between">
                     <span>Montant Reçu:</span>
                     <span className="font-black">{Number(saleData.amountReceived).toLocaleString()} FCFA</span>
                  </div>
                )}
                {saleData.changeToReturn != null && (
                  <div className="flex justify-between">
                     <span>Rendu Monnaie:</span>
                     <span className="font-black">{Number(saleData.changeToReturn).toLocaleString()} FCFA</span>
                  </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-dashed border-gray-400 text-center">
                <div className="bg-black text-white text-[12px] py-1.5 px-6 mb-4 tracking-[0.4em] font-black inline-block">||||| | |||| ||||| ||||</div>
                <p className="font-black text-[12px] uppercase">Merci de votre visite !</p>
                <p className="text-[8px] text-gray-600 uppercase mt-2 px-4 leading-relaxed">Les marchandises vendues ne sont ni reprises ni échangées.</p>
                <p className="text-[7px] text-gray-400 mt-6 font-medium italic">Propulsé par SaaS Gestion Commerce Multi-Tenant</p>
             </div>
          </div>
       </div>
    </div>
  );
}