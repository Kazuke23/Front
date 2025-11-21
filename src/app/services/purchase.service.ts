import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, forkJoin } from 'rxjs';
import { PurchaseOrder, PurchaseItem, PURCHASE_SAMPLE, PurchaseStatus, PurchaseOrderDisplay } from '../models/purchase.model';
import { INVENTORY_RESTAURANTS, INVENTORY_SUPPLIERS, INVENTORY_INGREDIENTS, INVENTORY_UNITS } from '../models/inventory.model';

import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly storageKey = 'purchase_orders';
  private readonly purchaseSubject = new BehaviorSubject<PurchaseOrder[]>([]);
  purchase$ = this.purchaseSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar desde localStorage como fallback mientras se conecta al backend
    this.loadFromStorage();
    // Intentar cargar desde el backend
    this.loadFromAPI();
  }

  // GET /purchase-orders
  getAll(): Observable<PurchaseOrderDisplay[]> {
    return this.http.get<PurchaseOrder[]>(`${API_BASE_URL}/purchase-orders`).pipe(
      tap(orders => {
        this.purchaseSubject.next(orders);
        this.persist(); // Guardar en localStorage como cache
      }),
      map(orders => orders.map(order => this.enrichOrder(order))),
      catchError(error => {
        console.warn('Error al obtener compras del backend, usando datos locales:', error);
        // Retornar datos locales en caso de error
        return of(this.purchaseSubject.value.map(order => this.enrichOrder(order)));
      })
    );
  }

  // GET /purchase-orders/{id}
  getById(id: string): Observable<PurchaseOrderDisplay> {
    return this.http.get<PurchaseOrder>(`${API_BASE_URL}/purchase-orders/${id}`).pipe(
      map(order => this.enrichOrder(order)),
      catchError(error => {
        console.warn('Error al obtener orden del backend:', error);
        // Retornar orden local si existe
        const localOrder = this.purchaseSubject.value.find(o => o.id === id);
        return localOrder ? of(this.enrichOrder(localOrder)) : of(null as any);
      })
    );
  }

  // POST /purchase-orders
  create(order: Omit<PurchaseOrder, 'id'>): Observable<PurchaseOrder> {
    // Crear orden sin items primero (según la API)
    const createRequest = {
      restaurant_id: order.restaurant_id,
      supplier_id: order.supplier_id,
      status: order.status || 'pending'
    };

    // Crear inmediatamente en el estado local con ID temporal
    const tempId = this.generateId();
    const tempOrder: PurchaseOrder = {
      ...order,
      id: tempId
    };
    const updated = [tempOrder, ...this.purchaseSubject.value];
    this.purchaseSubject.next(updated);
    this.persist();

    // Crear orden en el backend
    return this.http.post<PurchaseOrder>(`${API_BASE_URL}/purchase-orders`, createRequest).pipe(
      tap(newOrder => {
        // Agregar items a la orden creada si existen
        if (order.items && order.items.length > 0) {
          const itemObservables = order.items.map(item =>
            this.addItemToOrder(newOrder.id, item).pipe(catchError(() => of(item)))
          );
          
          forkJoin(itemObservables).subscribe({
            next: () => {
              // Recargar la orden completa después de agregar todos los items
              this.getById(newOrder.id).subscribe(completeOrder => {
                const orders = this.purchaseSubject.value;
                const index = orders.findIndex(o => o.id === tempId || o.id === newOrder.id);
                if (index !== -1) {
                  const finalUpdated = [...orders];
                  finalUpdated[index] = completeOrder as any;
                  this.purchaseSubject.next(finalUpdated);
                  this.persist();
                } else {
                  // Si no existe, agregarla
                  this.purchaseSubject.next([completeOrder as any, ...this.purchaseSubject.value]);
                  this.persist();
                }
              });
            },
            error: (err) => {
              console.error('Error al agregar items:', err);
              // Aún así actualizar con la orden básica
              const orders = this.purchaseSubject.value;
              const index = orders.findIndex(o => o.id === tempId);
              if (index !== -1) {
                const finalUpdated = [...orders];
                finalUpdated[index] = newOrder;
                this.purchaseSubject.next(finalUpdated);
                this.persist();
              }
            }
          });
        } else {
          // Si no hay items, solo actualizar la orden
          const orders = this.purchaseSubject.value;
          const index = orders.findIndex(o => o.id === tempId);
          if (index !== -1) {
            const finalUpdated = [...orders];
            finalUpdated[index] = newOrder;
            this.purchaseSubject.next(finalUpdated);
            this.persist();
          }
        }
      }),
      catchError(error => {
        console.error('Error al crear orden en el backend:', error);
        // Ya se creó localmente, así que está bien
        return of(tempOrder);
      })
    );
  }

  // PUT /purchase-orders/{id}
  update(id: string, changes: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    // Actualizar inmediatamente en el estado local
    const orders = this.purchaseSubject.value;
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      const updatedOrder: PurchaseOrder = { ...orders[index], ...changes };
      const updated = [...orders];
      updated[index] = updatedOrder;
      this.purchaseSubject.next(updated);
      this.persist();
    }

    // Luego intentar actualizar en el backend
    return this.http.put<PurchaseOrder>(`${API_BASE_URL}/purchase-orders/${id}`, changes).pipe(
      tap(backendOrder => {
        // Actualizar con la respuesta del backend
        const orders = this.purchaseSubject.value;
        const index = orders.findIndex(order => order.id === id);
        if (index !== -1) {
          const updated = [...orders];
          updated[index] = backendOrder;
          this.purchaseSubject.next(updated);
          this.persist();
        }
      }),
      catchError(error => {
        console.error('Error al actualizar orden del backend:', error);
        // Ya se actualizó localmente, así que está bien
        const orders = this.purchaseSubject.value;
        const order = orders.find(o => o.id === id);
        return order ? of(order) : of(null as any);
      })
    );
  }

  // DELETE /purchase-orders/{id}
  delete(id: string): Observable<void> {
    // Primero eliminar del estado local para respuesta inmediata
    const updated = this.purchaseSubject.value.filter(order => order.id !== id);
    this.purchaseSubject.next(updated);
    this.persist();

    // Luego intentar eliminar en el backend
    return this.http.delete<void>(`${API_BASE_URL}/purchase-orders/${id}`).pipe(
      tap(() => {
        // Ya se eliminó localmente, solo confirmar
        console.log('Orden eliminada del backend');
      }),
      catchError(error => {
        console.error('Error al eliminar orden del backend:', error);
        // Ya se eliminó localmente, así que está bien
        return of(void 0);
      })
    );
  }

  // Métodos sincronos para compatibilidad (usan el BehaviorSubject)
  getAllSync(): PurchaseOrderDisplay[] {
    return this.purchaseSubject.value.map(order => this.enrichOrder(order));
  }

  getByIdSync(id: string): PurchaseOrderDisplay | undefined {
    const order = this.purchaseSubject.value.find(o => o.id === id);
    return order ? this.enrichOrder(order) : undefined;
  }

  private loadFromAPI(): void {
    this.getAll().subscribe({
      next: (orders) => {
        // Las órdenes ya se actualizaron en el BehaviorSubject
      },
      error: (error) => {
        console.warn('No se pudo conectar al backend, usando datos locales:', error);
        // Si falla, usar datos de localStorage (ya cargados en constructor)
      }
    });
  }

  calculateTotal(items: PurchaseItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getSummary() {
    const orders = this.purchaseSubject.value;
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => {
      return sum + this.calculateTotal(order.items);
    }, 0);
    const pending = orders.filter(order => order.status === 'pending').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const canceled = orders.filter(order => order.status === 'cancelled').length;
    const inProcess = orders.filter(order => order.status === 'in_process').length;
    const restaurants = new Set(orders.map(order => order.restaurant_id)).size;
    const suppliers = new Set(orders.map(order => order.supplier_id)).size;

    return {
      totalOrders,
      totalAmount,
      pending,
      completed,
      canceled,
      inProcess,
      restaurants,
      suppliers
    };
  }

  /**
   * POST /purchase-orders/{id}/items - Agregar ítem a orden
   */
  addItemToOrder(orderId: string, item: PurchaseItem): Observable<PurchaseItem> {
    return this.http.post<PurchaseItem>(`${API_BASE_URL}/purchase-orders/${orderId}/items`, item).pipe(
      tap(newItem => {
        const orders = this.purchaseSubject.value;
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          const updatedOrder = {
            ...orders[orderIndex],
            items: [...(orders[orderIndex].items || []), newItem]
          };
          const updated = [...orders];
          updated[orderIndex] = updatedOrder;
          this.purchaseSubject.next(updated);
          this.persist();
        }
      })
    );
  }

  /**
   * Obtener restaurantes (usar RestaurantService si está disponible)
   */
  getRestaurants() {
    // Intentar obtener de la API si hay un servicio disponible
    // Por ahora retornar datos estáticos como fallback
    return [...INVENTORY_RESTAURANTS];
  }

  /**
   * Obtener proveedores (usar ProveedorService si está disponible)
   */
  getSuppliers() {
    // Intentar obtener de la API si hay un servicio disponible
    // Por ahora retornar datos estáticos como fallback
    return [...INVENTORY_SUPPLIERS];
  }

  /**
   * Obtener ingredientes (usar IngredientService si está disponible)
   */
  getIngredients() {
    // Intentar obtener de la API si hay un servicio disponible
    // Por ahora retornar datos estáticos como fallback
    return [...INVENTORY_INGREDIENTS];
  }

  /**
   * Obtener unidades (usar IngredientService si está disponible)
   */
  getUnits() {
    // Intentar obtener de la API si hay un servicio disponible
    // Por ahora retornar datos estáticos como fallback
    return [...INVENTORY_UNITS];
  }

  // Método para reinicializar datos (útil para limpiar datos corruptos)
  resetData(): void {
    localStorage.removeItem(this.storageKey);
    this.purchaseSubject.next([...PURCHASE_SAMPLE]);
    this.persist();
  }

  private enrichOrder(order: PurchaseOrder): PurchaseOrderDisplay {
    const restaurant = INVENTORY_RESTAURANTS.find(r => r.id === order.restaurant_id);
    const supplier = INVENTORY_SUPPLIERS.find(s => s.id === order.supplier_id);
    const ingredientNames: { [key: string]: string } = {};
    const unitCodes: { [key: string]: string } = {};

    order.items.forEach(item => {
      const ingredient = INVENTORY_INGREDIENTS.find(i => i.id === item.ingredient_id);
      const unit = INVENTORY_UNITS.find(u => u.id === item.unit_id);
      if (ingredient) ingredientNames[item.ingredient_id] = ingredient.name;
      if (unit) unitCodes[item.unit_id] = unit.code;
    });

    return {
      ...order,
      restaurantName: restaurant?.name,
      supplierName: supplier?.name,
      totalAmount: this.calculateTotal(order.items),
      ingredientNames,
      unitCodes
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'po-' + Math.random().toString(36).substring(2, 11);
  }

  private persist(): void {
    try {
      const plainOrders = this.purchaseSubject.value.map(order => ({
        ...order,
        items: order.items.map(item => ({ ...item }))
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(plainOrders));
    } catch (error) {
      console.error('Error saving purchase orders', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        this.purchaseSubject.next([...PURCHASE_SAMPLE]);
        this.persist();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.purchaseSubject.next([...PURCHASE_SAMPLE]);
        this.persist();
        return;
      }

      // Validar y corregir IDs si es necesario
      const validOrders = parsed
        .filter(order => 
          order && 
          order.id && 
          order.restaurant_id && 
          order.supplier_id && 
          order.status && 
          Array.isArray(order.items)
        )
        .map(order => {
          // Verificar que los IDs existan en los catálogos
          const restaurantExists = INVENTORY_RESTAURANTS.some(r => r.id === order.restaurant_id);
          const supplierExists = INVENTORY_SUPPLIERS.some(s => s.id === order.supplier_id);
          
          // Si los IDs no existen, usar los primeros del catálogo
          if (!restaurantExists && INVENTORY_RESTAURANTS.length > 0) {
            order.restaurant_id = INVENTORY_RESTAURANTS[0].id;
          }
          if (!supplierExists && INVENTORY_SUPPLIERS.length > 0) {
            order.supplier_id = INVENTORY_SUPPLIERS[0].id;
          }

          // Corregir IDs de items
          order.items = order.items.map((item: any) => {
            const ingredientExists = INVENTORY_INGREDIENTS.some(i => i.id === item.ingredient_id);
            const unitExists = INVENTORY_UNITS.some(u => u.id === item.unit_id);
            
            if (!ingredientExists && INVENTORY_INGREDIENTS.length > 0) {
              item.ingredient_id = INVENTORY_INGREDIENTS[0].id;
            }
            if (!unitExists && INVENTORY_UNITS.length > 0) {
              item.unit_id = INVENTORY_UNITS[0].id;
            }
            
            return item;
          });

          return order;
        });

      if (validOrders.length === 0) {
        this.purchaseSubject.next([...PURCHASE_SAMPLE]);
        this.persist();
        return;
      }

      this.purchaseSubject.next(validOrders);
      this.persist(); // Guardar datos corregidos
    } catch (error) {
      console.error('Error loading purchase orders', error);
      this.purchaseSubject.next([...PURCHASE_SAMPLE]);
      this.persist();
    }
  }
}
