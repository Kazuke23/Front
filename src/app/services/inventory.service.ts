import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, forkJoin } from 'rxjs';
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

import { API_CONFIG } from '../config/api.config';
import { IngredientService, Ingredient as ApiIngredient, Unit as ApiUnit } from './ingredient.service';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../models/restaurant.model';

const API_BASE_URL = API_CONFIG.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly storageKey = 'inventory_items';
  private readonly inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  inventory$ = this.inventorySubject.asObservable();

  // Cache para ingredientes, unidades y restaurantes
  private ingredientsCache: InventoryIngredient[] = [];
  private unitsCache: InventoryUnit[] = [];
  private restaurantsCache: InventoryRestaurant[] = [];

  constructor(
    private http: HttpClient,
    private ingredientService: IngredientService,
    private restaurantService: RestaurantService
  ) {
    // Cargar desde localStorage como fallback mientras se conecta al backend
    this.loadFromStorage();
    // Intentar cargar desde el backend
    this.loadFromAPI();
    // Cargar catálogos desde los servicios
    this.loadCatalogs();
  }

  /**
   * Cargar catálogos (ingredientes, unidades, restaurantes) desde los servicios
   */
  private loadCatalogs(): void {
    // Cargar ingredientes
    this.ingredientService.getIngredients().pipe(
      catchError(error => {
        console.warn('Error al cargar ingredientes, usando datos locales:', error);
        return of([]);
      })
    ).subscribe((ingredients: ApiIngredient[]) => {
      this.ingredientsCache = ingredients.map((ing: ApiIngredient): InventoryIngredient => ({
        id: ing.id,
        name: ing.name,
        defaultUnitId: ing.defaultUnit?.id || ing.default_unit_id || ''
      }));
    });

    // Cargar unidades
    this.ingredientService.getUnits().pipe(
      catchError(error => {
        console.warn('Error al cargar unidades, usando datos locales:', error);
        return of([]);
      })
    ).subscribe((units: ApiUnit[]) => {
      this.unitsCache = units.map((unit: ApiUnit): InventoryUnit => ({
        id: unit.id,
        code: unit.code || unit.description || ''
      }));
    });

    // Cargar restaurantes
    this.restaurantService.getRestaurantsObservable().pipe(
      catchError(error => {
        console.warn('Error al cargar restaurantes, usando datos locales:', error);
        return of([]);
      })
    ).subscribe((restaurants: Restaurant[]) => {
      this.restaurantsCache = restaurants.map((rest: Restaurant): InventoryRestaurant => ({
        id: rest.id,
        name: rest.name
      }));
    });
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
      id: tempId
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
      const updatedItem: InventoryItem = { ...items[index], quantity };
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
    // Retornar desde cache si está disponible, sino desde datos locales
    if (this.restaurantsCache.length > 0) {
      return [...this.restaurantsCache];
    }
    // Fallback a datos locales
    return [...INVENTORY_RESTAURANTS];
  }

  getIngredients(): InventoryIngredient[] {
    // Retornar desde cache si está disponible, sino desde datos locales
    if (this.ingredientsCache.length > 0) {
      return [...this.ingredientsCache];
    }
    // Fallback a datos locales
    return [...INVENTORY_INGREDIENTS];
  }

  getUnits(): InventoryUnit[] {
    // Retornar desde cache si está disponible, sino desde datos locales
    if (this.unitsCache.length > 0) {
      return [...this.unitsCache];
    }
    // Fallback a datos locales
    return [...INVENTORY_UNITS];
  }

  /**
   * Obtener ingredientes como Observable (para carga asíncrona)
   */
  getIngredientsObservable(): Observable<InventoryIngredient[]> {
    if (this.ingredientsCache.length > 0) {
      return of([...this.ingredientsCache]);
    }
    return this.ingredientService.getIngredients().pipe(
      map((ingredients: ApiIngredient[]) => {
        this.ingredientsCache = ingredients.map((ing: ApiIngredient): InventoryIngredient => ({
          id: ing.id,
          name: ing.name,
          defaultUnitId: ing.defaultUnit?.id || ing.default_unit_id || ''
        }));
        return [...this.ingredientsCache];
      }),
      catchError(error => {
        console.warn('Error al cargar ingredientes, usando datos locales:', error);
        return of([...INVENTORY_INGREDIENTS]);
      })
    );
  }

  /**
   * Obtener unidades como Observable (para carga asíncrona)
   */
  getUnitsObservable(): Observable<InventoryUnit[]> {
    if (this.unitsCache.length > 0) {
      return of([...this.unitsCache]);
    }
    return this.ingredientService.getUnits().pipe(
      map((units: ApiUnit[]) => {
        this.unitsCache = units.map((unit: ApiUnit): InventoryUnit => ({
          id: unit.id,
          code: unit.code || unit.description || ''
        }));
        return [...this.unitsCache];
      }),
      catchError(error => {
        console.warn('Error al cargar unidades, usando datos locales:', error);
        return of([...INVENTORY_UNITS]);
      })
    );
  }

  /**
   * Obtener restaurantes como Observable (para carga asíncrona)
   */
  getRestaurantsObservable(): Observable<InventoryRestaurant[]> {
    if (this.restaurantsCache.length > 0) {
      return of([...this.restaurantsCache]);
    }
    return this.restaurantService.getRestaurantsObservable().pipe(
      map((restaurants: Restaurant[]) => {
        this.restaurantsCache = restaurants.map((rest: Restaurant): InventoryRestaurant => ({
          id: rest.id,
          name: rest.name
        }));
        return [...this.restaurantsCache];
      }),
      catchError(error => {
        console.warn('Error al cargar restaurantes, usando datos locales:', error);
        return of([...INVENTORY_RESTAURANTS]);
      })
    );
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
    // Buscar en cache primero, luego en datos locales como fallback
    const restaurant = this.restaurantsCache.find(r => r.id === item.restaurant_id) 
      || INVENTORY_RESTAURANTS.find(r => r.id === item.restaurant_id);
    const ingredient = this.ingredientsCache.find(i => i.id === item.ingredient_id)
      || INVENTORY_INGREDIENTS.find(i => i.id === item.ingredient_id);
    const unit = this.unitsCache.find(u => u.id === item.unit_id)
      || INVENTORY_UNITS.find(u => u.id === item.unit_id);

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
          // Verificar que los IDs existan en los catálogos (usar cache si está disponible)
          const restaurants = this.restaurantsCache.length > 0 ? this.restaurantsCache : INVENTORY_RESTAURANTS;
          const ingredients = this.ingredientsCache.length > 0 ? this.ingredientsCache : INVENTORY_INGREDIENTS;
          const units = this.unitsCache.length > 0 ? this.unitsCache : INVENTORY_UNITS;
          
          const restaurantExists = restaurants.some(r => r.id === item.restaurant_id);
          const ingredientExists = ingredients.some(i => i.id === item.ingredient_id);
          const unitExists = units.some(u => u.id === item.unit_id);
          
          // Si los IDs no existen, usar los primeros del catálogo
          if (!restaurantExists && restaurants.length > 0) {
            item.restaurant_id = restaurants[0].id;
          }
          if (!ingredientExists && ingredients.length > 0) {
            item.ingredient_id = ingredients[0].id;
          }
          if (!unitExists && units.length > 0) {
            item.unit_id = units[0].id;
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
