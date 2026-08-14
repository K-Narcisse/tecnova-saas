import Dexie, { type Table } from 'dexie';

// --- 1. INTERFACES (Mises à jour pour correspondre à Prisma) ---

export interface LocalProduct {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  purchasePrice: number;
  stock: number;
  unit: string;
  categoryId: string | null; // On utilise l'ID pour la liaison
  categoryName: string;      // On garde le nom pour l'affichage rapide offline
  version: number;           // Pour savoir si le serveur a une version plus récente
}

export interface LocalCustomer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;    // Ajouté pour correspondre à Prisma
  debt: number;
}

export interface LocalCategory {
  id: string;
  name: string;
}

export interface LocalSupplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;      // Ajouté pour correspondre à Prisma
}

export interface LocalUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  companyName: string;
  pinCode: string;           // Pour le verrouillage d'écran offline
}

export interface PendingSale {
  id?: number; 
  saleData: {
    cart: any[];
    total: number;
    discount: number;
    paymentType: string;
    invoiceRef: string;
    customerId: string | null;
    date: string;
  };
  synced: number; // 0 = non envoyé, 1 = envoyé
  createdAt: string;
}

// --- 2. LA BASE DE DONNÉES ---

export class MyDatabase extends Dexie {
  products!: Table<LocalProduct>;
  customers!: Table<LocalCustomer>;
  categories!: Table<LocalCategory>;
  suppliers!: Table<LocalSupplier>;
  auth!: Table<LocalUser>;
  pendingSales!: Table<PendingSale>;

  constructor() {
    super('CommerceDB');

    // Définition des index (indispensable pour les recherches .where())
    this.version(2).stores({
      products: 'id, name, categoryId, barcode', 
      customers: 'id, name, phone',   
      categories: 'id, name',
      suppliers: 'id, name',
      auth: 'id, role',
      pendingSales: '++id, synced'    
    });
  }
}

export const db = new MyDatabase();