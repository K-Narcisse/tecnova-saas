const MENU_PERMISSIONS = {
  // L'ADMIN : accès total
  ADMIN: ["dashboard", "pos", "products", "categories", "customers", "suppliers", "sales-history", "expenses", "accounting", "reports", "settings"],
  
  // LE MANAGER : Uniquement ce que tu as demandé (Pas de Dashboard, Pas de POS, Pas de Compta, Pas de Rapports, Pas de Settings)
  MANAGER: ["products", "categories", "customers", "suppliers", "sales-history", "expenses"],
  
  // LE CAISSIER : Uniquement la vente et les clients
  CASHIER: ["pos", "customers"],
};