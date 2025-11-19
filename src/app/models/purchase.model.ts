export type PurchaseStatus = 'Pendiente' | 'Completado' | 'Cancelado' | 'En Proceso';

export interface PurchaseItem {
  id: string;
  purchaseItemId: string;
  orderId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitId: string;
  unitCode: string;
  price: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  supplierId: string;
  supplierName: string;
  fechaPedido: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaEntrega?: Date | null;
  montoTotal: number;
  status: PurchaseStatus;
  items: PurchaseItem[];
  notas?: string;
  createdBy?: string;
}

export const PURCHASE_SAMPLE: PurchaseOrder[] = [
  {
    id: 'po-001',
    orderId: 'PO-2025-001',
    restaurantId: 'rest-001',
    restaurantName: 'Restaurante Central',
    supplierId: 'supp-001',
    supplierName: 'Productos Frescos S.A.',
    fechaPedido: new Date('2025-01-15'),
    fechaCreacion: new Date('2025-01-15T08:00:00'),
    fechaActualizacion: new Date('2025-01-20T14:30:00'),
    fechaEntrega: new Date('2025-01-20'),
    montoTotal: 550.75,
    status: 'Completado',
    items: [
      {
        id: 'pi-001',
        purchaseItemId: 'pi-001',
        orderId: 'PO-2025-001',
        ingredientId: 'ing-001',
        ingredientName: 'Tomates Roma',
        quantity: 25,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 1.20,
        subtotal: 30.00
      },
      {
        id: 'pi-002',
        purchaseItemId: 'pi-002',
        orderId: 'PO-2025-001',
        ingredientId: 'ing-002',
        ingredientName: 'Cebollas',
        quantity: 15,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 0.85,
        subtotal: 12.75
      }
    ],
    notas: 'Entrega programada para lunes',
    createdBy: 'admin-001'
  },
  {
    id: 'po-002',
    orderId: 'PO-2025-002',
    restaurantId: 'rest-001',
    restaurantName: 'Restaurante Central',
    supplierId: 'supp-002',
    supplierName: 'Insumos Culinarios Ltda.',
    fechaPedido: new Date('2025-01-16'),
    fechaCreacion: new Date('2025-01-16T09:15:00'),
    fechaActualizacion: new Date('2025-01-16T09:15:00'),
    fechaEntrega: null,
    montoTotal: 1230.00,
    status: 'Pendiente',
    items: [
      {
        id: 'pi-003',
        purchaseItemId: 'pi-003',
        orderId: 'PO-2025-002',
        ingredientId: 'ing-003',
        ingredientName: 'Harina de trigo',
        quantity: 100,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 0.90,
        subtotal: 90.00
      },
      {
        id: 'pi-004',
        purchaseItemId: 'pi-004',
        orderId: 'PO-2025-002',
        ingredientId: 'ing-004',
        ingredientName: 'Aceite de oliva',
        quantity: 50,
        unitId: 'unit-003',
        unitCode: 'litros',
        price: 8.50,
        subtotal: 425.00
      }
    ],
    notas: 'Urgente - Necesario para fin de semana',
    createdBy: 'admin-001'
  },
  {
    id: 'po-003',
    orderId: 'PO-2025-003',
    restaurantId: 'rest-002',
    restaurantName: 'Sucursal Norte',
    supplierId: 'supp-003',
    supplierName: 'Distribuidora Gourmet',
    fechaPedido: new Date('2025-01-17'),
    fechaCreacion: new Date('2025-01-17T10:30:00'),
    fechaActualizacion: new Date('2025-01-17T10:30:00'),
    fechaEntrega: null,
    montoTotal: 320.50,
    status: 'Pendiente',
    items: [
      {
        id: 'pi-005',
        purchaseItemId: 'pi-005',
        orderId: 'PO-2025-003',
        ingredientId: 'ing-005',
        ingredientName: 'Queso mozzarella',
        quantity: 20,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 12.50,
        subtotal: 250.00
      }
    ],
    createdBy: 'admin-001'
  },
  {
    id: 'po-004',
    orderId: 'PO-2025-004',
    restaurantId: 'rest-001',
    restaurantName: 'Restaurante Central',
    supplierId: 'supp-004',
    supplierName: 'Carnes Premium SRL',
    fechaPedido: new Date('2025-01-18'),
    fechaCreacion: new Date('2025-01-18T11:00:00'),
    fechaActualizacion: new Date('2025-01-19T16:45:00'),
    fechaEntrega: null,
    montoTotal: 890.25,
    status: 'Cancelado',
    items: [
      {
        id: 'pi-006',
        purchaseItemId: 'pi-006',
        orderId: 'PO-2025-004',
        ingredientId: 'ing-006',
        ingredientName: 'Pechuga de pollo',
        quantity: 30,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 4.60,
        subtotal: 138.00
      }
    ],
    notas: 'Cancelado por cambio de proveedor',
    createdBy: 'admin-001'
  },
  {
    id: 'po-005',
    orderId: 'PO-2025-005',
    restaurantId: 'rest-002',
    restaurantName: 'Sucursal Norte',
    supplierId: 'supp-005',
    supplierName: 'Lácteos El Campo',
    fechaPedido: new Date('2025-01-19'),
    fechaCreacion: new Date('2025-01-19T08:30:00'),
    fechaActualizacion: new Date('2025-01-20T12:00:00'),
    fechaEntrega: new Date('2025-01-20'),
    montoTotal: 410.90,
    status: 'Completado',
    items: [
      {
        id: 'pi-007',
        purchaseItemId: 'pi-007',
        orderId: 'PO-2025-005',
        ingredientId: 'ing-007',
        ingredientName: 'Leche entera',
        quantity: 40,
        unitId: 'unit-003',
        unitCode: 'litros',
        price: 1.25,
        subtotal: 50.00
      },
      {
        id: 'pi-008',
        purchaseItemId: 'pi-008',
        orderId: 'PO-2025-005',
        ingredientId: 'ing-008',
        ingredientName: 'Mantequilla',
        quantity: 15,
        unitId: 'unit-001',
        unitCode: 'kg',
        price: 8.00,
        subtotal: 120.00
      }
    ],
    createdBy: 'admin-001'
  }
];

