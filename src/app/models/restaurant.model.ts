export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  capacity: number;
  isActive: boolean;
  description: string;
  openingHours: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  capacity: number;
  isActive: boolean;
  description: string;
  openingHours: string;
}

export const CUISINE_TYPES = [
  'Colombiana',
  'Italiana',
  'Mexicana',
  'Asiática',
  'Mediterránea',
  'Americana',
  'Francesa',
  'Japonesa',
  'China',
  'India',
  'Árabe',
  'Vegetariana',
  'Vegana',
  'Mariscos',
  'Carnes',
  'Parrilla',
  'Fast Food',
  'Fusión'
];

export const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'El Fogón de la Abuela',
    address: 'Calle 85 #12-34, Bogotá',
    phone: '+57 1 234-5678',
    email: 'info@elfogonabuela.com',
    cuisine: 'Colombiana',
    rating: 4.5,
    capacity: 80,
    isActive: true,
    description: 'Restaurante tradicional colombiano con más de 30 años de experiencia, especializado en platos típicos de la región.',
    openingHours: 'Lun-Dom: 11:00 AM - 10:00 PM',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    name: 'Bella Vista Italiana',
    address: 'Carrera 15 #93-47, Bogotá',
    phone: '+57 1 345-6789',
    email: 'reservas@bellavista.com',
    cuisine: 'Italiana',
    rating: 4.8,
    capacity: 60,
    isActive: true,
    description: 'Auténtica cocina italiana con ingredientes importados directamente de Italia. Ambiente romántico y elegante.',
    openingHours: 'Mar-Dom: 12:00 PM - 11:00 PM',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    name: 'Sakura Sushi Bar',
    address: 'Calle 116 #15-20, Bogotá',
    phone: '+57 1 456-7890',
    email: 'contacto@sakura.com',
    cuisine: 'Japonesa',
    rating: 4.7,
    capacity: 45,
    isActive: true,
    description: 'Sushi fresco preparado por chefs japoneses certificados. Ambiente minimalista y zen.',
    openingHours: 'Lun-Sáb: 6:00 PM - 11:00 PM',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'La Parrilla del Chef',
    address: 'Carrera 7 #32-16, Bogotá',
    phone: '+57 1 567-8901',
    email: 'chef@parrilla.com',
    cuisine: 'Parrilla',
    rating: 4.3,
    capacity: 100,
    isActive: true,
    description: 'Especialistas en carnes a la parrilla con cortes premium importados de Argentina y Brasil.',
    openingHours: 'Mié-Lun: 12:00 PM - 12:00 AM',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    name: 'Green Garden',
    address: 'Calle 70 #11-90, Bogotá',
    phone: '+57 1 678-9012',
    email: 'info@greengarden.com',
    cuisine: 'Vegetariana',
    rating: 4.2,
    capacity: 50,
    isActive: true,
    description: 'Cocina vegetariana y vegana con ingredientes orgánicos locales. Opciones saludables y deliciosas.',
    openingHours: 'Lun-Dom: 8:00 AM - 9:00 PM',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '6',
    name: 'Café Parisien',
    address: 'Carrera 11 #93-40, Bogotá',
    phone: '+57 1 789-0123',
    email: 'bonjour@cafeparisien.com',
    cuisine: 'Francesa',
    rating: 4.6,
    capacity: 35,
    isActive: false,
    description: 'Café francés auténtico con pastelería artesanal y ambiente bohemio parisino.',
    openingHours: 'Mar-Dom: 7:00 AM - 8:00 PM',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  }
];
