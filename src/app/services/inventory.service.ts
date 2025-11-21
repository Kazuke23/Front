import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import {
  InventoryItem,
  InventoryItemDisplay,
  INVENTORY_SAMPLE,
  INVENTORY_RESTAURANTS,
  INVENTORY_INGREDIENTS,
  INVENTORY_UNITS,
  INVENTORY_SUPPLIERS,
  INVENTORY_CATEGORIES,
  InventoryRestaurant,
  InventoryIngredient,
  InventoryUnit,
  InventorySupplier
} from '../models/inventory.model';

import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly storageKey = 'inventory_items';
  private readonly inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  inventory$ = this.inventorySubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar desde localStorage como fallback mientras se conecta al backend
    this.loadFromStorage();
    // Intentar cargar desde el backend
    this.loadFromAPI();
  }

  // GET /inventory
  getAll(): Observable<InventoryItemDisplay[]> {
    return this.http.get<InventoryItem[]>(`${API_BASE_URL}/inventory`).pipe(
      tap(items => {
        this.inventorySubject.next(items);
        this.persist(); // Guardar en localStorage como cache
      }),
      map(items => items.map(item => this.enrichItem(item))),
      catchError(error => {
        console.warn('Error al obtener inventario del backend, usando datos locales:', error);
        // Retornar datos locales en caso de error
        return of(this.inventorySubject.value.map(item => this.enrichItem(item)));
      })
    );
  }

  // GET /inventory/{id}
  getById(id: string): Observable<InventoryItemDisplay> {
    return this.http.get<InventoryItem>(`${API_BASE_URL}/inventory/${id}`).pipe(
      map(item => this.enrichItem(item)),
      catchError(error => {
        console.warn('Error al obtener item del backend:', error);
        // Retornar item local si existe
        const localItem = this.inventorySubject.value.find(i => i.id === id);
        return localItem ? of(this.enrichItem(localItem)) : of(null as any);
      })
    );
  }

  // POST /inventory
  create(item: Omit<InventoryItem, 'id'>): Observable<InventoryItem> {
    // Crear inmediatamente en el estado local con ID temporal
    const tempId = this.generateId();
    const tempItem: InventoryItem = {
      ...item,
      id: tempId,
      updatedAt: item.updatedAt || new Date()
    };
    const updated = [tempItem, ...this.inventorySubject.value];
    this.inventorySubject.next(updated);
    this.persist();

    // Luego intentar crear en el backend
    return this.http.post<InventoryItem>(`${API_BASE_URL}/inventory`, item).pipe(
      tap(newItem => {
        // Reemplazar el item temporal con el del backend
        const items = this.inventorySubject.value;
        const index = items.findIndex(i => i.id === tempId);
        if (index !== -1) {
          const finalUpdated = [...items];
          finalUpdated[index] = newItem;
          this.inventorySubject.next(finalUpdated);
          this.persist();
        } else {
          // Si no se encuentra el temporal, agregar el nuevo
          const finalUpdated = [newItem, ...this.inventorySubject.value.filter(i => i.id !== tempId)];
          this.inventorySubject.next(finalUpdated);
          this.persist();
        }
      }),
      catchError(error => {
        console.error('Error al crear item en el backend:', error);
        // Ya se creó localmente, así que está bien
        return of(tempItem);
      })
    );
  }

  // PUT /inventory/{id} - Solo se puede actualizar la cantidad
  updateQuantity(id: string, quantity: number): Observable<InventoryItem> {
    // Actualizar inmediatamente en el estado local
    const items = this.inventorySubject.value;
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedItem: InventoryItem = { ...items[index], quantity, updatedAt: new Date() };
      const updated = [...items];
      updated[index] = updatedItem;
      this.inventorySubject.next(updated);
      this.persist();
    }

    // Luego intentar actualizar en el backend
    return this.http.put<InventoryItem>(`${API_BASE_URL}/inventory/${id}`, { quantity }).pipe(
      tap(backendItem => {
        // Actualizar con la respuesta del backend
        const items = this.inventorySubject.value;
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          const updated = [...items];
          updated[index] = backendItem;
          this.inventorySubject.next(updated);
          this.persist();
        }
      }),
      catchError(error => {
        console.error('Error al actualizar item del backend:', error);
        // Ya se actualizó localmente, así que está bien
        const items = this.inventorySubject.value;
        const item = items.find(i => i.id === id);
        return item ? of(item) : of(null as any);
      })
    );
  }

  // DELETE /inventory/{id}
  delete(id: string): Observable<void> {
    // Crear nuevo array para forzar detección de cambios
    const currentItems = [...this.inventorySubject.value];
    const updated = currentItems.filter(item => item.id !== id);
    
    // Actualizar BehaviorSubject inmediatamente con nuevo array
    this.inventorySubject.next([...updated]);
    this.persist();

    // Luego intentar eliminar en el backend
    return this.http.delete<void>(`${API_BASE_URL}/inventory/${id}`).pipe(
      tap(() => {
        // Ya se eliminó localmente, solo confirmar
        console.log('Item eliminado del backend');
      }),
      catchError(error => {
        console.error('Error al eliminar item del backend:', error);
        // Ya se eliminó localmente, así que está bien
        return of(void 0);
      })
    );
  }

  // Métodos sincronos para compatibilidad (usan el BehaviorSubject)
  getAllSync(): InventoryItemDisplay[] {
    return this.inventorySubject.value.map(item => this.enrichItem(item));
  }

  getByIdSync(id: string): InventoryItemDisplay | undefined {
    const item = this.inventorySubject.value.find(i => i.id === id);
    return item ? this.enrichItem(item) : undefined;
  }

  private loadFromAPI(): void {
    this.getAll().subscribe({
      next: (items) => {
        // Los items ya se actualizaron en el BehaviorSubject
      },
      error: (error) => {
        console.warn('No se pudo conectar al backend, usando datos locales:', error);
        // Si falla, usar datos de localStorage (ya cargados en constructor)
      }
    });
  }

  getCategories(): string[] {
    return [...INVENTORY_CATEGORIES];
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
    const supplier = item.supplier_id ? INVENTORY_SUPPLIERS.find(s => s.id === item.supplier_id) : null;

    // Asignar categoría basada en el nombre del ingrediente si no existe
    let category = item.category;
    if (!category && ingredient?.name) {
      const nameLower = ingredient.name.toLowerCase();
      if (nameLower.includes('tomate') || nameLower.includes('cebolla') || nameLower.includes('pimiento')) {
        category = 'Vegetales';
      } else if (nameLower.includes('pollo') || nameLower.includes('carne') || nameLower.includes('pescado')) {
        category = 'Carnes';
      } else if (nameLower.includes('harina') || nameLower.includes('arroz') || nameLower.includes('pasta')) {
        category = 'Básicos';
      } else if (nameLower.includes('leche') || nameLower.includes('queso') || nameLower.includes('yogur')) {
        category = 'Lácteos';
      } else if (nameLower.includes('aceite')) {
        category = 'Aceites';
      } else if (nameLower.includes('sal') || nameLower.includes('pimienta') || nameLower.includes('especia')) {
        category = 'Especias';
      } else {
        category = 'Otros';
      }
    }

    let status: 'available' | 'low' | 'out' = 'available';
    const reorderLevel = item.reorder_level || 10;
    if (item.quantity === 0) {
      status = 'out';
    } else if (item.quantity < reorderLevel) {
      status = 'low';
    }

    return {
      ...item,
      restaurantName: restaurant?.name,
      ingredientName: ingredient?.name,
      unitCode: unit?.code,
      supplierName: supplier?.name,
      category: category || 'Otros',
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
