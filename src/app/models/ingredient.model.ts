export interface Ingredient {
  id: string;
  name: string;
  default_unit_id: string;
  calories_per_unit: number;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
}

