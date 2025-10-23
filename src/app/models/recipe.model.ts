export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number; // en pesos colombianos
  calories: number;
  category: string;
  ingredients: string[];
  preparation: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeFormData {
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  calories: number;
  category: string;
  ingredients: string[];
  preparation: string[];
}

export const RECIPE_CATEGORIES = [
  'Todas',
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Postres',
  'Bebidas',
  'Snacks',
  'Ensaladas',
  'Sopas',
  'Platos Principales'
];

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Ensalada de Quinoa y Vegetales',
    description: 'Una ensalada refrescante y nutritiva con quinoa, pepino, tomate, aguacate y aderezo de limón, perfecta para un almuerzo ligero o una cena saludable.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    cost: 18000, // 4.50€ convertido a pesos colombianos
    calories: 350,
    category: 'Ensaladas',
    ingredients: [
      '200g quinoa cocida',
      '1 pepino, picado',
      '2 tomates, picados',
      '1 aguacate, en cubos',
      '1/4 taza perejil fresco, picado',
      'Jugo de 1 limón',
      '2 cucharadas aceite de oliva virgen extra',
      'Sal marina y pimienta negra al gusto'
    ],
    preparation: [
      'En un bol grande combinar la quinoa cocida, pepino, tomates, aguacate y perejil picado.',
      'En un recipiente pequeño, mezclar el jugo de limón, el aceite de oliva, la sal y la pimienta para crear el aderezo.',
      'Verter el aderezo sobre la ensalada y mezclar suavemente hasta que todos los ingredientes estén bien cubiertos.',
      'Refrigerar por al menos 15 minutos antes de servir para que los sabores se mezclen.',
      'Servir fría como plato principal o acompañamiento.'
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Pasta Carbonara Clásica',
    description: 'Una pasta italiana tradicional con huevos, queso parmesano, panceta y pimienta negra, creando una salsa cremosa y deliciosa.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    cost: 31200, // 7.80€ convertido a pesos colombianos
    calories: 620,
    category: 'Platos Principales',
    ingredients: [
      '400g pasta spaghetti',
      '200g panceta o tocino',
      '4 huevos grandes',
      '100g queso parmesano rallado',
      '2 dientes de ajo',
      'Pimienta negra molida',
      'Sal al gusto',
      'Aceite de oliva'
    ],
    preparation: [
      'Cocinar la pasta en agua con sal hasta que esté al dente.',
      'Mientras tanto, cortar la panceta en cubos pequeños y freír hasta que esté crujiente.',
      'En un bowl, batir los huevos con el queso parmesano y pimienta negra.',
      'Escurrir la pasta y mezclar inmediatamente con la panceta caliente.',
      'Retirar del fuego y agregar la mezcla de huevos, mezclando rápidamente.',
      'Servir inmediatamente con más queso parmesano y pimienta.'
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Curry de Verduras con Leche de Coco',
    description: 'Un curry vegetariano aromático con leche de coco, especias tradicionales y una mezcla de verduras frescas.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    cost: 20800, // 5.20€ convertido a pesos colombianos
    calories: 480,
    category: 'Platos Principales',
    ingredients: [
      '400ml leche de coco',
      '2 cebollas medianas',
      '3 dientes de ajo',
      '1 cucharada jengibre rallado',
      '2 cucharadas pasta de curry',
      '1 pimiento rojo',
      '1 pimiento verde',
      '2 zanahorias',
      '200g brócoli',
      'Arroz basmati para acompañar'
    ],
    preparation: [
      'Picar finamente la cebolla, ajo y jengibre.',
      'Calentar aceite en una olla grande y sofreír la cebolla hasta que esté transparente.',
      'Agregar el ajo, jengibre y pasta de curry, cocinar por 2 minutos.',
      'Añadir las verduras cortadas en trozos medianos.',
      'Verter la leche de coco y dejar cocinar a fuego medio por 20 minutos.',
      'Servir sobre arroz basmati cocido.'
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '4',
    name: 'Tacos de Pescado con Pico de Gallo',
    description: 'Tacos frescos con pescado blanco empanizado, col morada, pico de gallo casero y salsa de aguacate.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    cost: 27600, // 6.90€ convertido a pesos colombianos
    calories: 410,
    category: 'Almuerzo',
    ingredients: [
      '500g filetes de pescado blanco',
      '8 tortillas de maíz',
      '2 tomates',
      '1 cebolla morada',
      '1 aguacate',
      '1 limón',
      'Cilantro fresco',
      'Harina para empanizar',
      'Huevo batido',
      'Pan rallado'
    ],
    preparation: [
      'Cortar el pescado en tiras y empanizar con harina, huevo y pan rallado.',
      'Freír el pescado hasta que esté dorado y crujiente.',
      'Preparar el pico de gallo picando tomate, cebolla y cilantro.',
      'Hacer salsa de aguacate mezclando aguacate con jugo de limón.',
      'Calentar las tortillas y rellenar con pescado, col morada y salsas.',
      'Servir inmediatamente con limón extra.'
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    name: 'Sopa de Lentejas Casera',
    description: 'Una sopa reconfortante de lentejas con verduras, especias y un toque de comino, perfecta para días fríos.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    cost: 15200, // 3.80€ convertido a pesos colombianos
    calories: 280,
    category: 'Sopas',
    ingredients: [
      '300g lentejas rojas',
      '1 cebolla grande',
      '2 zanahorias',
      '2 tallos de apio',
      '3 dientes de ajo',
      '1 cucharada comino molido',
      '1 hoja de laurel',
      'Caldo de verduras',
      'Aceite de oliva',
      'Sal y pimienta'
    ],
    preparation: [
      'Remojar las lentejas por 30 minutos y escurrir.',
      'Picar la cebolla, zanahorias y apio en cubos pequeños.',
      'Sofreír las verduras en aceite de oliva hasta que estén tiernas.',
      'Agregar el ajo picado y comino, cocinar por 1 minuto.',
      'Añadir las lentejas, caldo de verduras y hoja de laurel.',
      'Cocinar a fuego medio por 25 minutos hasta que las lentejas estén tiernas.'
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '6',
    name: 'Brochetas de Pollo a la Parrilla',
    description: 'Brochetas jugosas de pollo marinado con verduras frescas, cocinadas a la parrilla con hierbas aromáticas.',
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    cost: 24000, // 6.00€ convertido a pesos colombianos
    calories: 400,
    category: 'Cena',
    ingredients: [
      '600g pechuga de pollo',
      '1 pimiento rojo',
      '1 pimiento amarillo',
      '1 cebolla morada',
      '8 champiñones',
      'Aceite de oliva',
      'Ajo en polvo',
      'Orégano',
      'Sal y pimienta',
      'Palillos de brocheta'
    ],
    preparation: [
      'Cortar el pollo en cubos de 2cm y marinar con aceite, ajo, orégano, sal y pimienta.',
      'Cortar las verduras en trozos del mismo tamaño que el pollo.',
      'Alternar pollo y verduras en los palillos de brocheta.',
      'Precalentar la parrilla a fuego medio-alto.',
      'Cocinar las brochetas por 12-15 minutos, girando ocasionalmente.',
      'Servir caliente con arroz o ensalada.'
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '7',
    name: 'Risotto de Hongos Portobello',
    description: 'Un risotto cremoso y elegante con hongos portobello, vino blanco y queso parmesano, perfecto para una cena especial.',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    cost: 35000,
    calories: 520,
    category: 'Cena',
    ingredients: [
      '300g arroz arborio',
      '200g hongos portobello',
      '1 cebolla mediana',
      '2 dientes de ajo',
      '150ml vino blanco seco',
      '1 litro caldo de vegetales',
      '100g queso parmesano rallado',
      '2 cucharadas mantequilla',
      'Aceite de oliva',
      'Sal y pimienta'
    ],
    preparation: [
      'Cortar los hongos en láminas y sofreír en mantequilla hasta dorar.',
      'Picar la cebolla y ajo finamente.',
      'En una olla grande, sofreír la cebolla hasta transparente.',
      'Agregar el arroz y cocinar por 2 minutos hasta que esté brillante.',
      'Verter el vino blanco y dejar evaporar.',
      'Agregar el caldo caliente poco a poco, removiendo constantemente.',
      'Incorporar los hongos y queso parmesano al final.'
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '8',
    name: 'Ceviche de Camarones',
    description: 'Ceviche fresco de camarones con cebolla morada, cilantro, ají y jugo de limón, acompañado de camote y cancha.',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    cost: 28000,
    calories: 320,
    category: 'Almuerzo',
    ingredients: [
      '500g camarones frescos',
      '1 cebolla morada',
      '1 ají amarillo',
      '1/2 taza cilantro fresco',
      'Jugo de 8 limones',
      'Sal al gusto',
      'Camote cocido',
      'Cancha tostada',
      'Hojas de lechuga'
    ],
    preparation: [
      'Cocinar los camarones en agua con sal hasta que cambien de color.',
      'Pelar y cortar los camarones en trozos medianos.',
      'Picar la cebolla en juliana y remojar en agua fría.',
      'Picar el ají sin semillas y el cilantro.',
      'Mezclar camarones con jugo de limón y sal.',
      'Agregar cebolla, ají y cilantro.',
      'Servir sobre hojas de lechuga con camote y cancha.'
    ],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '9',
    name: 'Pizza Margherita Artesanal',
    description: 'Pizza tradicional italiana con masa casera, tomate fresco, mozzarella de búfala y albahaca, cocinada en horno de leña.',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    cost: 22000,
    calories: 450,
    category: 'Cena',
    ingredients: [
      '250g harina 00',
      '150ml agua tibia',
      '7g levadura fresca',
      '1 cucharadita sal',
      '200g tomates san marzano',
      '200g mozzarella de búfala',
      'Hojas de albahaca fresca',
      'Aceite de oliva virgen extra',
      'Sal marina'
    ],
    preparation: [
      'Preparar la masa mezclando harina, agua, levadura y sal.',
      'Amasar por 10 minutos hasta obtener una masa elástica.',
      'Dejar fermentar por 1 hora en lugar cálido.',
      'Estirar la masa en forma circular.',
      'Agregar tomate triturado, mozzarella y albahaca.',
      'Cocinar en horno precalentado a 250°C por 8-10 minutos.',
      'Terminar con aceite de oliva y sal marina.'
    ],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];
