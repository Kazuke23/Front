import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PurchaseOrder, PurchaseItem, PURCHASE_SAMPLE, PurchaseStatus, PurchaseOrderDisplay } from '../models/purchase.model';
import { INVENTORY_RESTAURANTS, INVENTORY_SUPPLIERS, INVENTORY_INGREDIENTS, INVENTORY_UNITS } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly storageKey = 'purchase_orders';
  private readonly purchaseSubject = new BehaviorSubject<PurchaseOrder[]>([]);
  purchase$ = this.purchaseSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  getAll(): PurchaseOrderDisplay[] {
    return this.purchaseSubject.value.map(order => this.enrichOrder(order));
  }

  getById(id: string): PurchaseOrderDisplay | undefined {
    const order = this.purchaseSubject.value.find(o => o.id === id);
    return order ? this.enrichOrder(order) : undefined;
  }

  create(order: Omit<PurchaseOrder, 'id'>): PurchaseOrder {
    const newOrder: PurchaseOrder = {
      ...order,
      id: this.generateId()
    };

    const updated = [newOrder, ...this.purchaseSubject.value];
    this.purchaseSubject.next(updated);
    this.persist();
    return newOrder;
  }

  update(id: string, changes: Partial<PurchaseOrder>): void {
    const orders = this.purchaseSubject.value;
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error('Orden no encontrada');
    }

    const updatedOrder: PurchaseOrder = {
      ...orders[index],
      ...changes
    };

    const updated = [...orders];
    updated[index] = updatedOrder;
    this.purchaseSubject.next(updated);
    this.persist();
  }

  delete(id: string): void {
    const updated = this.purchaseSubject.value.filter(order => order.id !== id);
    this.purchaseSubject.next(updated);
    this.persist();
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

  getRestaurants() {
    return [...INVENTORY_RESTAURANTS];
  }

  getSuppliers() {
    return [...INVENTORY_SUPPLIERS];
  }

  getIngredients() {
    return [...INVENTORY_INGREDIENTS];
  }

  getUnits() {
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
