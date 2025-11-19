export type InventoryStatus = 'Disponible' | 'Crítico' | 'Agotado';

export interface InventoryRestaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface InventoryIngredient {
  id: string;
  name: string;
  defaultUnitId: string;
  caloriesPerUnit: number;
  metadata?: string;
}

export interface InventoryUnit {
  id: string;
  code: string;
  description: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contact: string;
  country: string;
}

export interface InventoryItem {
  id: string;
  inventoryId: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  categoria: string;
  proveedor: string;
  supplierId: string;
  restaurantId: string;
  restaurantName: string;
  ingredientId: string;
  ingredientName: string;
  unitId: string;
  unitCode: string;
  nivelReorden: number;
  costoUnitario?: number;
  estado: InventoryStatus;
  fechaActualizacion: Date;
  fechaCreacion: Date;
  fechaExpiracion?: Date | null;
  lote?: string;
  notas?: string;
  imagen?: string;
}

export const INVENTORY_UNITS: InventoryUnit[] = [
  { id: 'unit-kg', code: 'kg', description: 'Kilogramos' },
  { id: 'unit-lt', code: 'litros', description: 'Litros' },
  { id: 'unit-und', code: 'unidades', description: 'Unidades' }
];

export const INVENTORY_RESTAURANTS: InventoryRestaurant[] = [
  { id: 'rest-bog-aurora', name: 'Bistró Aurora', city: 'Bogotá', country: 'Colombia', timezone: 'America/Bogota' },
  { id: 'rest-med-luna', name: 'Casa Luna', city: 'Medellín', country: 'Colombia', timezone: 'America/Bogota' },
  { id: 'rest-mx-origen', name: 'Origen CDMX', city: 'Ciudad de México', country: 'México', timezone: 'America/Mexico_City' }
];

export const INVENTORY_INGREDIENTS: InventoryIngredient[] = [
  { id: 'ing-tom-roma', name: 'Tomate Roma fresco', defaultUnitId: 'unit-kg', caloriesPerUnit: 18, metadata: 'Vegetal temporada' },
  { id: 'ing-pech-pollo', name: 'Pechuga de pollo deshuesada', defaultUnitId: 'unit-kg', caloriesPerUnit: 120, metadata: 'Proteína premium' },
  { id: 'ing-harina-000', name: 'Harina 000 artesanal', defaultUnitId: 'unit-kg', caloriesPerUnit: 364 },
  { id: 'ing-aceite-oliva', name: 'Aceite de oliva virgen extra', defaultUnitId: 'unit-lt', caloriesPerUnit: 884 },
  { id: 'ing-sal-marina', name: 'Sal marina gourmet', defaultUnitId: 'unit-kg', caloriesPerUnit: 0 }
];

export const INVENTORY_SUPPLIERS: InventorySupplier[] = [
  { id: 'sup-finca-verde', name: 'Finca Verde', contact: 'logistica@fincaverde.com', country: 'Colombia' },
  { id: 'sup-avicola-granja', name: 'Avícola La Granja', contact: 'ventas@avilagranja.com', country: 'Colombia' },
  { id: 'sup-molino-valle', name: 'Molino del Valle', contact: 'comercial@molino-valle.com', country: 'Colombia' },
  { id: 'sup-olivares-sol', name: 'Olivares del Sol', contact: 'export@olivaresdelsol.es', country: 'España' },
  { id: 'sup-salinas-mar', name: 'Salinas del Mar', contact: 'ventas@salinasmar.com', country: 'México' }
];

export const INVENTORY_SAMPLE: InventoryItem[] = [
  {
    id: 'inv-2025-001',
    inventoryId: 'inv-2025-001',
    nombre: 'Tomates Roma frescos',
    descripcion: 'Lotes premium para salsas y ensaladas de temporada',
    cantidad: 48,
    unidad: 'kg',
    unitId: 'unit-kg',
    unitCode: 'kg',
    categoria: 'Vegetales',
    proveedor: 'Finca Verde',
    supplierId: 'sup-finca-verde',
    restaurantId: 'rest-bog-aurora',
    restaurantName: 'Bistró Aurora',
    ingredientId: 'ing-tom-roma',
    ingredientName: 'Tomate Roma fresco',
    nivelReorden: 18,
    costoUnitario: 1.45,
    estado: 'Disponible',
    fechaCreacion: new Date('2025-01-12'),
    fechaActualizacion: new Date('2025-03-04'),
    fechaExpiracion: new Date('2025-03-18'),
    lote: 'FV-2501-TR',
    notas: 'Mantener entre 8 y 10 °C',
    imagen: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'inv-2025-002',
    inventoryId: 'inv-2025-002',
    nombre: 'Pechugas de pollo premium',
    descripcion: 'Pechuga sin piel para marinados especiales del chef',
    cantidad: 14,
    unidad: 'kg',
    unitId: 'unit-kg',
    unitCode: 'kg',
    categoria: 'Carnes',
    proveedor: 'Avícola La Granja',
    supplierId: 'sup-avicola-granja',
    restaurantId: 'rest-med-luna',
    restaurantName: 'Casa Luna',
    ingredientId: 'ing-pech-pollo',
    ingredientName: 'Pechuga de pollo deshuesada',
    nivelReorden: 12,
    costoUnitario: 5.2,
    estado: 'Crítico',
    fechaCreacion: new Date('2025-02-05'),
    fechaActualizacion: new Date('2025-03-03'),
    fechaExpiracion: new Date('2025-03-08'),
    lote: 'AG-2502-PCH',
    notas: 'Consumir antes del fin de semana',
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'inv-2025-003',
    inventoryId: 'inv-2025-003',
    nombre: 'Harina de trigo premium',
    descripcion: 'Harina 000 para pan brioche y masas de pizza napolitana',
    cantidad: 72,
    unidad: 'kg',
    unitId: 'unit-kg',
    unitCode: 'kg',
    categoria: 'Básicos',
    proveedor: 'Molino del Valle',
    supplierId: 'sup-molino-valle',
    restaurantId: 'rest-mx-origen',
    restaurantName: 'Origen CDMX',
    ingredientId: 'ing-harina-000',
    ingredientName: 'Harina 000 artesanal',
    nivelReorden: 30,
    costoUnitario: 1.05,
    estado: 'Disponible',
    fechaCreacion: new Date('2025-01-28'),
    fechaActualizacion: new Date('2025-03-01'),
    fechaExpiracion: null,
    lote: 'MV-2501-HT',
    notas: 'Almacenar en contenedores herméticos',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'inv-2025-004',
    inventoryId: 'inv-2025-004',
    nombre: 'Aceite de oliva virgen extra',
    descripcion: 'Blend mediterráneo para cocina fría',
    cantidad: 18,
    unidad: 'litros',
    unitId: 'unit-lt',
    unitCode: 'litros',
    categoria: 'Aceites',
    proveedor: 'Olivares del Sol',
    supplierId: 'sup-olivares-sol',
    restaurantId: 'rest-bog-aurora',
    restaurantName: 'Bistró Aurora',
    ingredientId: 'ing-aceite-oliva',
    ingredientName: 'Aceite de oliva virgen extra',
    nivelReorden: 10,
    costoUnitario: 8.75,
    estado: 'Disponible',
    fechaCreacion: new Date('2025-01-05'),
    fechaActualizacion: new Date('2025-02-26'),
    fechaExpiracion: new Date('2026-01-15'),
    lote: 'OS-2501-AO',
    notas: 'Reservar para platos premium y barra fría',
    imagen: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'inv-2025-005',
    inventoryId: 'inv-2025-005',
    nombre: 'Sal marina gourmet',
    descripcion: 'Cristales medianos para terminación',
    cantidad: 32,
    unidad: 'kg',
    unitId: 'unit-kg',
    unitCode: 'kg',
    categoria: 'Especias',
    proveedor: 'Salinas del Mar',
    supplierId: 'sup-salinas-mar',
    restaurantId: 'rest-mx-origen',
    restaurantName: 'Origen CDMX',
    ingredientId: 'ing-sal-marina',
    ingredientName: 'Sal marina gourmet',
    nivelReorden: 12,
    costoUnitario: 2.35,
    estado: 'Disponible',
    fechaCreacion: new Date('2025-02-12'),
    fechaActualizacion: new Date('2025-03-02'),
    fechaExpiracion: null,
    lote: 'SM-2502-SM',
    notas: 'Usar para curados y estación de parrilla',
    imagen: 'https://images.unsplash.com/photo-1505575972945-321a7f1d73a7?auto=format&fit=crop&w=900&q=80'
  }
];

