// ✅ src/app/models/ingredient.model.ts

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  cost: number;
  stock: number;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientFormData {
  name: string;
  unit: string;
  cost: number;
  stock: number;
  category: string;
  description: string;
}

export const INGREDIENT_CATEGORIES = [
  'Todos',
  'Verduras',
  'Frutas',
  'Proteínas',
  'Granos',
  'Especias',
  'Lácteos',
  'Salsas',
  'Otros'
];

export const SAMPLE_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Tomate',
    unit: 'kg',
    cost: 4000,
    stock: 12,
    category: 'Verduras',
    description: 'Tomates rojos frescos usados en ensaladas, salsas y muchas recetas.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Aceite de Oliva',
    unit: 'litro',
    cost: 20000,
    stock: 5,
    category: 'Salsas',
    description: 'Aceite de oliva extra virgen, ideal para aderezos y cocina saludable.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Pechuga de Pollo',
    unit: 'kg',
    cost: 16000,
    stock: 8,
    category: 'Proteínas',
    description: 'Pechuga de pollo sin hueso, magra y versátil para distintos platos.',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
