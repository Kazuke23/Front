import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PurchaseOrder, PurchaseItem, PURCHASE_SAMPLE, PurchaseStatus } from '../models/purchase.model';
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

  getAll(): PurchaseOrder[] {
    return this.purchaseSubject.value;
  }

  getById(id: string): PurchaseOrder | undefined {
    return this.purchaseSubject.value.find(order => order.id === id);
  }

  getByOrderId(orderId: string): PurchaseOrder | undefined {
    return this.purchaseSubject.value.find(order => order.orderId === orderId);
  }

  create(order: Omit<PurchaseOrder, 'id' | 'orderId' | 'fechaCreacion' | 'fechaActualizacion'>): PurchaseOrder {
    const newOrder: PurchaseOrder = {
      ...order,
      id: this.generateId(),
      orderId: this.generateOrderId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
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
      ...changes,
      fechaActualizacion: new Date(),
      montoTotal: this.calculateTotal(changes.items || orders[index].items)
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
    return items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
  }

  getSummary() {
    const orders = this.purchaseSubject.value;
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.montoTotal, 0);
    const pending = orders.filter(order => order.status === 'Pendiente').length;
    const completed = orders.filter(order => order.status === 'Completado').length;
    const canceled = orders.filter(order => order.status === 'Cancelado').length;
    const inProcess = orders.filter(order => order.status === 'En Proceso').length;
    const restaurants = new Set(orders.map(order => order.restaurantId)).size;
    const suppliers = new Set(orders.map(order => order.supplierId)).size;

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

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'po-' + Math.random().toString(36).substring(2, 11);
  }

  private generateOrderId(): string {
    const year = new Date().getFullYear();
    const count = this.purchaseSubject.value.length + 1;
    return `PO-${year}-${count.toString().padStart(3, '0')}`;
  }

  private persist(): void {
    try {
      const plainOrders = this.purchaseSubject.value.map(order => ({
        ...order,
        fechaPedido: order.fechaPedido instanceof Date ? order.fechaPedido.toISOString() : order.fechaPedido,
        fechaCreacion: order.fechaCreacion instanceof Date ? order.fechaCreacion.toISOString() : order.fechaCreacion,
        fechaActualizacion: order.fechaActualizacion instanceof Date ? order.fechaActualizacion.toISOString() : order.fechaActualizacion,
        fechaEntrega: order.fechaEntrega instanceof Date ? order.fechaEntrega.toISOString() : order.fechaEntrega
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(plainOrders));
    } catch (error) {
      console.error('Error guardando compras', error);
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
      if (!Array.isArray(parsed)) {
        this.purchaseSubject.next([...PURCHASE_SAMPLE]);
        this.persist();
        return;
      }

      const hydrated = parsed.map((order: any) => ({
        ...order,
        fechaPedido: order.fechaPedido ? new Date(order.fechaPedido) : new Date(),
        fechaCreacion: order.fechaCreacion ? new Date(order.fechaCreacion) : new Date(),
        fechaActualizacion: order.fechaActualizacion ? new Date(order.fechaActualizacion) : new Date(),
        fechaEntrega: order.fechaEntrega ? new Date(order.fechaEntrega) : null,
        items: order.items || []
      }));

      this.purchaseSubject.next(hydrated);
    } catch (error) {
      console.error('Error cargando compras', error);
      this.purchaseSubject.next([...PURCHASE_SAMPLE]);
    }
  }
}

