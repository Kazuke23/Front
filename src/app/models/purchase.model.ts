// Modelos simplificados según los endpoints de la API

export type PurchaseStatus = 'pending' | 'completed' | 'cancelled' | 'in_process';

export interface PurchaseItem {
  ingredient_id: string;
  quantity: number;
  price: number;
  unit_id: string;
}

export interface PurchaseOrder {
  id: string;
  restaurant_id: string;
  supplier_id: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

// Para mostrar en la UI (datos calculados/derivados)
export interface PurchaseOrderDisplay extends PurchaseOrder {
  restaurantName?: string;
  supplierName?: string;
  totalAmount?: number;
  ingredientNames?: { [key: string]: string };
  unitCodes?: { [key: string]: string };
}

export const PURCHASE_SAMPLE: PurchaseOrder[] = [
  {
    id: 'po-001',
    restaurant_id: 'rest-001',
    supplier_id: 'supp-001',
    status: 'completed',
    items: [
      {
        ingredient_id: 'ing-001',
        quantity: 25,
        unit_id: 'unit-kg',
        price: 1.20
      },
      {
        ingredient_id: 'ing-002',
        quantity: 15,
        unit_id: 'unit-kg',
        price: 0.85
      }
    ]
  },
  {
    id: 'po-002',
    restaurant_id: 'rest-001',
    supplier_id: 'supp-002',
    status: 'pending',
    items: [
      {
        ingredient_id: 'ing-003',
        quantity: 100,
        unit_id: 'unit-kg',
        price: 0.90
      }
    ]
  },
  {
    id: 'po-003',
    restaurant_id: 'rest-002',
    supplier_id: 'supp-003',
    status: 'in_process',
    items: [
      {
        ingredient_id: 'ing-004',
        quantity: 20,
        unit_id: 'unit-lt',
        price: 8.50
      },
      {
        ingredient_id: 'ing-005',
        quantity: 10,
        unit_id: 'unit-kg',
        price: 12.00
      }
    ]
  }
];
