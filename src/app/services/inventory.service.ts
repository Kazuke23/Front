import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InventoryItem, INVENTORY_SAMPLE, InventoryStatus } from '../models/inventory.model';

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

  getAll(): InventoryItem[] {
    return this.inventorySubject.value;
  }

  getById(id: string): InventoryItem | undefined {
    return this.inventorySubject.value.find(item => item.id === id);
  }

  create(item: Omit<InventoryItem, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: this.generateId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    const updated = [newItem, ...this.inventorySubject.value];
    this.inventorySubject.next(updated);
    this.persist();
    return newItem;
  }

  update(id: string, changes: Partial<InventoryItem>): void {
    const items = this.inventorySubject.value;
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item no encontrado');
    }

    const updatedItem: InventoryItem = {
      ...items[index],
      ...changes,
      fechaActualizacion: new Date()
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
    const categories = new Set(this.inventorySubject.value.map(item => item.categoria));
    return Array.from(categories).sort();
  }

  getSummary() {
    const items = this.inventorySubject.value;
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.cantidad, 0);
    const critical = items.filter(item => item.estado === 'Crítico' || item.cantidad <= item.nivelReorden).length;
    const agotados = items.filter(item => item.estado === 'Agotado' || item.cantidad === 0).length;
    const categories = new Set(items.map(item => item.categoria)).size;

    return { totalItems, totalUnits, critical, agotados, categories };
  }

  inferStatus(cantidad: number, nivelReorden: number): InventoryStatus {
    if (cantidad <= 0) return 'Agotado';
    if (cantidad <= nivelReorden) return 'Crítico';
    return 'Disponible';
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'inv-' + Math.random().toString(36).substring(2, 11);
  }

  private persist(): void {
    try {
      const plainItems = this.inventorySubject.value.map(item => ({
        ...item,
        fechaCreacion: item.fechaCreacion instanceof Date ? item.fechaCreacion.toISOString() : item.fechaCreacion,
        fechaActualizacion: item.fechaActualizacion instanceof Date ? item.fechaActualizacion.toISOString() : item.fechaActualizacion,
        fechaExpiracion: item.fechaExpiracion instanceof Date ? item.fechaExpiracion.toISOString() : item.fechaExpiracion
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(plainItems));
    } catch (error) {
      console.error('Error guardando inventario', error);
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
      if (!Array.isArray(parsed)) {
        this.inventorySubject.next([...INVENTORY_SAMPLE]);
        this.persist();
        return;
      }

      const hydrated = parsed.map((item: any) => ({
        ...item,
        fechaCreacion: item.fechaCreacion ? new Date(item.fechaCreacion) : new Date(),
        fechaActualizacion: item.fechaActualizacion ? new Date(item.fechaActualizacion) : new Date(),
        fechaExpiracion: item.fechaExpiracion ? new Date(item.fechaExpiracion) : null
      }));

      this.inventorySubject.next(hydrated);
    } catch (error) {
      console.error('Error cargando inventario', error);
      this.inventorySubject.next([...INVENTORY_SAMPLE]);
    }
  }
}

