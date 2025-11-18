export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoProducto: string;
  activo: boolean;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProveedorFormData {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoProducto: string;
  activo: boolean;
  notas?: string;
}

export const TIPOS_PRODUCTO = [
  'Frutas y Verduras',
  'Carnes y Aves',
  'Pescados y Mariscos',
  'Lácteos',
  'Granos y Cereales',
  'Especias y Condimentos',
  'Bebidas',
  'Panadería',
  'Otros'
];

export const SAMPLE_PROVEEDORES: Proveedor[] = [
  {
    id: '1',
    nombre: 'Frutas y Verduras El Campo',
    contacto: 'Juan Pérez',
    telefono: '+57 1 234-5678',
    email: 'ventas@elcampo.com',
    direccion: 'Calle 70 #10-20, Bogotá',
    tipoProducto: 'Frutas y Verduras',
    activo: true,
    notas: 'Proveedor confiable con productos frescos',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    nombre: 'Carnes Premium S.A.',
    contacto: 'María González',
    telefono: '+57 1 345-6789',
    email: 'contacto@carnespremium.com',
    direccion: 'Carrera 15 #93-47, Bogotá',
    tipoProducto: 'Carnes y Aves',
    activo: true,
    notas: 'Especialistas en cortes premium',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    nombre: 'Pescados del Pacífico',
    contacto: 'Carlos Rodríguez',
    telefono: '+57 1 456-7890',
    email: 'info@pescados.com',
    direccion: 'Calle 116 #15-20, Bogotá',
    tipoProducto: 'Pescados y Mariscos',
    activo: true,
    notas: 'Pescados frescos entregados diariamente',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

