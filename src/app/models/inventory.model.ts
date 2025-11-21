// Modelos simplificados según los endpoints de la API

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  ingredient_id: string;
  unit_id: string;
  quantity: number;
  category?: string;
  supplier_id?: string;
  reorder_level?: number;
  updatedAt?: Date | string;
}

// Para mostrar en la UI (datos calculados/derivados)
export interface InventoryItemDisplay extends InventoryItem {
  restaurantName?: string;
  ingredientName?: string;
  unitCode?: string;
  supplierName?: string;
  status?: 'available' | 'low' | 'out';
}

export interface InventoryRestaurant {
  id: string;
  name: string;
}

export interface InventoryIngredient {
  id: string;
  name: string;
  defaultUnitId: string;
}

export interface InventoryUnit {
  id: string;
  code: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contact_info: string;
}

export const INVENTORY_UNITS: InventoryUnit[] = [
  { id: 'unit-kg', code: 'kg' },
  { id: 'unit-lt', code: 'litros' },
  { id: 'unit-und', code: 'unidades' }
];

export const INVENTORY_RESTAURANTS: InventoryRestaurant[] = [
  { id: 'rest-001', name: 'Restaurante Central' },
  { id: 'rest-002', name: 'Sucursal Norte' },
  { id: 'rest-003', name: 'Sucursal Sur' }
];

export const INVENTORY_INGREDIENTS: InventoryIngredient[] = [
  { id: 'ing-001', name: 'Tomates Roma', defaultUnitId: 'unit-kg' },
  { id: 'ing-002', name: 'Cebollas', defaultUnitId: 'unit-kg' },
  { id: 'ing-003', name: 'Harina de trigo', defaultUnitId: 'unit-kg' },
  { id: 'ing-004', name: 'Aceite de oliva', defaultUnitId: 'unit-lt' },
  { id: 'ing-005', name: 'Queso mozzarella', defaultUnitId: 'unit-kg' }
];

export const INVENTORY_CATEGORIES = [
  'Vegetales',
  'Carnes',
  'Básicos',
  'Lácteos',
  'Aceites',
  'Especias',
  'Frutas',
  'Granos',
  'Otros'
];

export const INVENTORY_SUPPLIERS: InventorySupplier[] = [
  { id: 'supp-001', name: 'Finca Verde', contact_info: '3005551234' },
  { id: 'supp-002', name: 'Avícola La Granja', contact_info: '3005555678' },
  { id: 'supp-003', name: 'Molino del Valle', contact_info: '3005559012' },
  { id: 'supp-004', name: 'Lácteos Puros', contact_info: '3005559013' },
  { id: 'supp-005', name: 'Olivares del Sol', contact_info: '3005559014' },
  { id: 'supp-006', name: 'Salinas del Mar', contact_info: '3005559015' }
];

export const INVENTORY_SAMPLE: InventoryItem[] = [
  {
    id: 'inv-001',
    restaurant_id: 'rest-001',
    ingredient_id: 'ing-001',
    unit_id: 'unit-kg',
    quantity: 48
  },
  {
    id: 'inv-002',
    restaurant_id: 'rest-001',
    ingredient_id: 'ing-002',
    unit_id: 'unit-kg',
    quantity: 14
  },
  {
    id: 'inv-003',
    restaurant_id: 'rest-002',
    ingredient_id: 'ing-003',
    unit_id: 'unit-kg',
    quantity: 72
  }
];
