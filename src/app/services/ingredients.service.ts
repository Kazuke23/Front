import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';

const STORAGE_KEY = 'app_ingredients_v1';

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {

  private ingredients: Ingredient[] = [
    { id: '1', name: 'Arroz', default_unit_id: 'u1', calories_per_unit: 150, description: 'Grano blanco' },
    { id: '2', name: 'Azúcar', default_unit_id: 'u2', calories_per_unit: 400, description: '' }
  ];

  private units = [
    { id: 'u1', name: 'Gramos' },
    { id: 'u2', name: 'Kilogramos' },
    { id: 'u3', name: 'Litros' }
  ];

  constructor() {
    this.loadFromStorage();
  }

  // ---------- Storage helpers ----------
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ingredients));
    } catch (e) {
      console.warn('No se pudo guardar ingredients en localStorage', e);
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Ingredient[];
        // validar forma básica
        if (Array.isArray(parsed)) {
          this.ingredients = parsed;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer ingredients desde localStorage, usando valores por defecto', e);
    }
  }

  // ---------- API methods (dev/mock) ----------

  // Devuelve una copia del array para evitar mutaciones externas
  getIngredients(): Observable<Ingredient[]> {
    return of([...this.ingredients]);
  }

  getIngredient(id: string): Observable<Ingredient | undefined> {
    const ing = this.ingredients.find(i => i.id === id);
    return of(ing ? { ...ing } : undefined);
  }

  getUnits(): Observable<{id:string,name:string}[]> {
    return of([...this.units]);
  }

  createIngredient(ingredient: Omit<Ingredient,'id'>): Observable<Ingredient> {
    const newIng: Ingredient = { ...ingredient, id: Date.now().toString() };
    this.ingredients.push(newIng);
    this.saveToStorage();
    return of({ ...newIng });
  }

  updateIngredient(id: string, ingredient: Partial<Ingredient>): Observable<Ingredient | undefined> {
    const index = this.ingredients.findIndex(i => i.id === id);
    if (index > -1) {
      this.ingredients[index] = { ...this.ingredients[index], ...ingredient };
      this.saveToStorage();
      return of({ ...this.ingredients[index] });
    }
    return of(undefined);
  }

  deleteIngredient(id: string): Observable<void> {
    const before = this.ingredients.length;
    this.ingredients = this.ingredients.filter(i => i.id !== id);
    const after = this.ingredients.length;
    if (after !== before) {
      this.saveToStorage();
    }
    return of(void 0);
  }

  // Utilidad para resetear a valores por defecto (útil en desarrollo)
  resetToDefaults() {
    this.ingredients = [
      { id: '1', name: 'Arroz', default_unit_id: 'u1', calories_per_unit: 150, description: 'Grano blanco' },
      { id: '2', name: 'Azúcar', default_unit_id: 'u2', calories_per_unit: 400, description: '' }
    ];
    this.saveToStorage();
  }
}
