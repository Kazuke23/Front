import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  InventoryItem,
  INVENTORY_SAMPLE,
  InventoryStatus,
  INVENTORY_RESTAURANTS,
  INVENTORY_INGREDIENTS,
  INVENTORY_UNITS,
  INVENTORY_SUPPLIERS,
  InventoryRestaurant,
  InventoryIngredient,
  InventoryUnit,
  InventorySupplier
} from '../models/inventory.model';

type InventoryCreateInput = Omit<InventoryItem, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'inventoryId'> & {
  inventoryId?: string;
};

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

  create(item: InventoryCreateInput): InventoryItem {
    const normalized = this.normalizeItem({
      ...item,
      id: this.generateId(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    const updated = [normalized, ...this.inventorySubject.value];
    this.inventorySubject.next(updated);
    this.persist();
    return normalized;
  }

  update(id: string, changes: Partial<InventoryItem>): void {
    const items = this.inventorySubject.value;
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item no encontrado');
    }

    const updatedItem: InventoryItem = this.normalizeItem({
      ...items[index],
      ...changes,
      fechaActualizacion: new Date()
    });

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

  getSummary() {
    const items = this.inventorySubject.value;
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.cantidad, 0);
    const critical = items.filter(item => item.estado === 'Crítico' || item.cantidad <= item.nivelReorden).length;
    const agotados = items.filter(item => item.estado === 'Agotado' || item.cantidad === 0).length;
    const categories = new Set(items.map(item => item.categoria)).size;
    const restaurants = new Set(items.map(item => item.restaurantId)).size;

    return { totalItems, totalUnits, critical, agotados, categories, restaurants };
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

      const hydrated = parsed.map((item: any) => this.normalizeItem({
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

  private normalizeItem(raw: any): InventoryItem {
    const restaurant = this.resolveRestaurant(raw.restaurantId, raw.restaurantName);
    const ingredient = this.resolveIngredient(raw.ingredientId, raw.ingredientName ?? raw.nombre);
    const unit = this.resolveUnit(raw.unitId, raw.unidad ?? raw.unitCode ?? ingredient?.defaultUnitId);
    const supplier = this.resolveSupplier(raw.supplierId, raw.proveedor);
    const baseId = raw.id ?? raw.inventoryId ?? this.generateId();
    const rawInventoryId = typeof raw.inventoryId === 'string' ? raw.inventoryId.trim() : raw.inventoryId;

    const fechaExpiracion =
      raw.fechaExpiracion instanceof Date
        ? raw.fechaExpiracion
        : raw.fechaExpiracion
        ? new Date(raw.fechaExpiracion)
        : null;

    return {
      id: baseId,
      inventoryId: rawInventoryId && rawInventoryId.length ? rawInventoryId : baseId,
      nombre: raw.nombre ?? ingredient?.name ?? 'Ingrediente sin nombre',
      descripcion: raw.descripcion,
      cantidad: Number(raw.cantidad ?? 0),
      unidad: raw.unidad ?? unit.code,
      unitId: unit.id,
      unitCode: unit.code,
      categoria: raw.categoria ?? 'Sin categoría',
      proveedor: raw.proveedor ?? supplier.name,
      supplierId: supplier.id,
      restaurantId: restaurant.id,
      restaurantName: raw.restaurantName ?? restaurant.name,
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      nivelReorden: Number(raw.nivelReorden ?? 0),
      costoUnitario: raw.costoUnitario ? Number(raw.costoUnitario) : undefined,
      estado: raw.estado ?? 'Disponible',
      fechaCreacion: raw.fechaCreacion instanceof Date ? raw.fechaCreacion : new Date(),
      fechaActualizacion: raw.fechaActualizacion instanceof Date ? raw.fechaActualizacion : new Date(),
      fechaExpiracion,
      lote: raw.lote,
      notas: raw.notas,
      imagen: raw.imagen
    };
  }

  private resolveRestaurant(id?: string, name?: string): InventoryRestaurant {
    return (
      INVENTORY_RESTAURANTS.find(r => r.id === id || r.name === name) ??
      INVENTORY_RESTAURANTS[0]
    );
  }

  private resolveIngredient(id?: string, name?: string): InventoryIngredient {
    return (
      INVENTORY_INGREDIENTS.find(i => i.id === id || i.name === name) ??
      INVENTORY_INGREDIENTS[0]
    );
  }

  private resolveUnit(id?: string, code?: string): InventoryUnit {
    return (
      INVENTORY_UNITS.find(u => u.id === id || u.code === code) ??
      INVENTORY_UNITS[0]
    );
  }

  private resolveSupplier(id?: string, name?: string): InventorySupplier {
    return (
      INVENTORY_SUPPLIERS.find(s => s.id === id || s.name === name) ??
      INVENTORY_SUPPLIERS[0]
    );
  }
}

