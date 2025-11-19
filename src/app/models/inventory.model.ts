export type InventoryStatus = 'Disponible' | 'Crítico' | 'Agotado';

export interface InventoryItem {
  id: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  categoria: string;
  proveedor: string;
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

export const INVENTORY_SAMPLE: InventoryItem[] = [
  {
    id: 'inv-001',
    nombre: 'Tomates Roma frescos',
    descripcion: 'Tomate roma para salsas y ensaladas',
    cantidad: 42,
    unidad: 'kg',
    categoria: 'Vegetales',
    proveedor: 'Finca Verde',
    nivelReorden: 15,
    costoUnitario: 1.2,
    estado: 'Disponible',
    fechaCreacion: new Date('2023-10-01'),
    fechaActualizacion: new Date('2023-10-26'),
    fechaExpiracion: new Date('2023-11-05'),
    lote: 'FV-1023-TR',
    notas: 'Mantener refrigerado',
    imagen: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'inv-002',
    nombre: 'Pechugas de pollo premium',
    descripcion: 'Pechuga sin piel, lista para marinar',
    cantidad: 18,
    unidad: 'kg',
    categoria: 'Carnes',
    proveedor: 'Avícola La Granja',
    nivelReorden: 12,
    costoUnitario: 4.6,
    estado: 'Crítico',
    fechaCreacion: new Date('2023-09-20'),
    fechaActualizacion: new Date('2023-10-25'),
    fechaExpiracion: new Date('2023-10-30'),
    lote: 'AG-0923-PCH',
    notas: 'Priorizar consumo esta semana',
    imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'inv-003',
    nombre: 'Harina de trigo premium',
    descripcion: 'Harina 000 para panadería artesanal',
    cantidad: 65,
    unidad: 'kg',
    categoria: 'Básicos',
    proveedor: 'Molino del Valle',
    nivelReorden: 25,
    costoUnitario: 0.9,
    estado: 'Disponible',
    fechaCreacion: new Date('2023-08-15'),
    fechaActualizacion: new Date('2023-10-24'),
    fechaExpiracion: null,
    lote: 'MV-0815-HT',
    notas: 'Almacenar en lugar seco',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'inv-004',
    nombre: 'Aceite de oliva virgen extra',
    descripcion: 'Aceite de primera presión en frío',
    cantidad: 12,
    unidad: 'litros',
    categoria: 'Aceites',
    proveedor: 'Olivares del Sol',
    nivelReorden: 10,
    costoUnitario: 8.5,
    estado: 'Disponible',
    fechaCreacion: new Date('2023-07-02'),
    fechaActualizacion: new Date('2023-10-23'),
    fechaExpiracion: new Date('2024-04-15'),
    lote: 'OS-0702-AO',
    notas: 'Reservar para platos premium',
    imagen: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'inv-005',
    nombre: 'Sal marina gourmet',
    descripcion: 'Sal marina natural granulada',
    cantidad: 25,
    unidad: 'kg',
    categoria: 'Especias',
    proveedor: 'Salinas del Mar',
    nivelReorden: 8,
    costoUnitario: 2.1,
    estado: 'Disponible',
    fechaCreacion: new Date('2023-05-10'),
    fechaActualizacion: new Date('2023-10-20'),
    fechaExpiracion: null,
    lote: 'SM-0510-SM',
    notas: 'Usar para curados y terminaciones',
    imagen: 'https://images.unsplash.com/photo-1505575972945-321a7f1d73a7?auto=format&fit=crop&w=800&q=80'
  }
];

