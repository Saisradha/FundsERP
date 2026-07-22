import { create } from 'zustand';

export interface Product3D {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
}

interface WarehouseState {
  activeTab: 'mission_control' | 'warehouse_3d' | 'customers_3d' | 'products' | 'challans' | 'logs';
  selectedProduct: Product3D | null;
  commandPaletteOpen: boolean;
  aiAssistantOpen: boolean;
  selectedCustomerNode: any | null;
  dispatchCart: Array<{ product: Product3D; quantity: number }>;
  
  setActiveTab: (tab: WarehouseState['activeTab']) => void;
  setSelectedProduct: (product: Product3D | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAiAssistantOpen: (open: boolean) => void;
  setSelectedCustomerNode: (node: any | null) => void;
  addToDispatchCart: (product: Product3D, quantity: number) => void;
  removeFromDispatchCart: (productId: string) => void;
  clearDispatchCart: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  activeTab: 'mission_control',
  selectedProduct: null,
  commandPaletteOpen: false,
  aiAssistantOpen: false,
  selectedCustomerNode: null,
  dispatchCart: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAiAssistantOpen: (open) => set({ aiAssistantOpen: open }),
  setSelectedCustomerNode: (node) => set({ selectedCustomerNode: node }),

  addToDispatchCart: (product, quantity) =>
    set((state) => {
      const existing = state.dispatchCart.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          dispatchCart: state.dispatchCart.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { dispatchCart: [...state.dispatchCart, { product, quantity }] };
    }),

  removeFromDispatchCart: (productId) =>
    set((state) => ({
      dispatchCart: state.dispatchCart.filter((i) => i.product.id !== productId),
    })),

  clearDispatchCart: () => set({ dispatchCart: [] }),
}));
