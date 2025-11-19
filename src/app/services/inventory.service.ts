import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  InventoryItem,
  InventoryItemDisplay,
  INVENTORY_SAMPLE,
  INVENTORY_RESTAURANTS,
  INVENTORY_INGREDIENTS,
  INVENTORY_UNITS,
  INVENTORY_SUPPLIERS,
  InventoryRestaurant,
  InventoryIngredient,
  InventoryUnit,
  InventorySupplier
} from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly storageKey = 'inventory_items';
  private readonly inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  inventory$ = this.inventorySubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  getAll(): InventoryItemDisplay[] {
    return this.inventorySubject.value.map(item => this.enrichItem(item));
  }

  getById(id: string): InventoryItemDisplay | undefined {
    const item = this.inventorySubject.value.find(i => i.id === id);
    return item ? this.enrichItem(item) : undefined;
  }

  create(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: this.generateId()
    };

    const updated = [newItem, ...this.inventorySubject.value];
    this.inventorySubject.next(updated);
    this.persist();
    return newItem;
  }

  // Solo se puede actualizar la cantidad según el endpoint PUT /inventory/{id}
  updateQuantity(id: string, quantity: number): void {
    const items = this.inventorySubject.value;
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item no encontrado');
    }

    const updatedItem: InventoryItem = {
      ...items[index],
      quantity
    };

    const updated = [...items];
    updated[index] = updatedItem;
    this.inventorySubject.next(updated);
    this.persist();
  }

  delete(id: string): void {
    const updated = this.inventorySubject.value.filter(item => item.id !== id);
    this.inventorySubject.next(updated);
    this.persist();
  }

  getCategories(): string[] {
    // Categorías básicas
    return ['Vegetales', 'Carnes', 'Básicos', 'Aceites', 'Lácteos', 'Especias', 'Bebidas'];
  }

  getSummary() {
    const items = this.inventorySubject.value;
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const critical = items.filter(item => {
      // Asumir que crítico es menos de 10 unidades
      return item.quantity < 10;
    }).length;
    const agotados = items.filter(item => item.quantity === 0).length;
    const categories = new Set(this.getCategories()).size;
    const restaurants = new Set(items.map(item => item.restaurant_id)).size;

    return {
      totalItems,
      totalUnits,
      critical,
      agotados,
      categories,
      restaurants
    };
  }

  getRestaurants(): InventoryRestaurant[] {
    return [...INVENTORY_RESTAURANTS];
  }

  getIngredients(): InventoryIngredient[] {
    return [...INVENTORY_INGREDIENTS];
  }

  getUnits(): InventoryUnit[] {
    return [...INVENTORY_UNITS];
  }

  getSuppliers(): InventorySupplier[] {
    return [...INVENTORY_SUPPLIERS];
  }

  // Método para reinicializar datos (útil para limpiar datos corruptos)
  resetData(): void {
    localStorage.removeItem(this.storageKey);
    this.inventorySubject.next([...INVENTORY_SAMPLE]);
    this.persist();
  }

  private enrichItem(item: InventoryItem): InventoryItemDisplay {
    const restaurant = INVENTORY_RESTAURANTS.find(r => r.id === item.restaurant_id);
    const ingredient = INVENTORY_INGREDIENTS.find(i => i.id === item.ingredient_id);
    const unit = INVENTORY_UNITS.find(u => u.id === item.unit_id);

    let status: 'available' | 'low' | 'out' = 'available';
    if (item.quantity === 0) {
      status = 'out';
    } else if (item.quantity < 10) {
      status = 'low';
    }

    return {
      ...item,
      restaurantName: restaurant?.name,
      ingredientName: ingredient?.name,
      unitCode: unit?.code,
      status
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'inv-' + Math.random().toString(36).substring(2, 11);
  }

  private persist(): void {
    try {
      const plainItems = this.inventorySubject.value.map(item => ({ ...item }));
      localStorage.setItem(this.storageKey, JSON.stringify(plainItems));
    } catch (error) {
      console.error('Error saving inventory', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        this.inventorySubject.next([...INVENTORY_SAMPLE]);
        this.persist();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.inventorySubject.next([...INVENTORY_SAMPLE]);
        this.persist();
        return;
      }

      // Validar y corregir IDs si es necesario
      const validItems = parsed
        .filter(item => 
          item && 
          item.id && 
          item.restaurant_id && 
          item.ingredient_id && 
          item.unit_id && 
          typeof item.quantity === 'number'
        )
        .map(item => {
          // Verificar que los IDs existan en los catálogos
          const restaurantExists = INVENTORY_RESTAURANTS.some(r => r.id === item.restaurant_id);
          const ingredientExists = INVENTORY_INGREDIENTS.some(i => i.id === item.ingredient_id);
          const unitExists = INVENTORY_UNITS.some(u => u.id === item.unit_id);
          
          // Si los IDs no existen, usar los primeros del catálogo
          if (!restaurantExists && INVENTORY_RESTAURANTS.length > 0) {
            item.restaurant_id = INVENTORY_RESTAURANTS[0].id;
          }
          if (!ingredientExists && INVENTORY_INGREDIENTS.length > 0) {
            item.ingredient_id = INVENTORY_INGREDIENTS[0].id;
          }
          if (!unitExists && INVENTORY_UNITS.length > 0) {
            item.unit_id = INVENTORY_UNITS[0].id;
          }
          
          return item;
        });

      if (validItems.length === 0) {
        this.inventorySubject.next([...INVENTORY_SAMPLE]);
        this.persist();
        return;
      }

      this.inventorySubject.next(validItems);
      this.persist(); // Guardar datos corregidos
    } catch (error) {
      console.error('Error loading inventory', error);
      this.inventorySubject.next([...INVENTORY_SAMPLE]);
      this.persist();
    }
  }
}
