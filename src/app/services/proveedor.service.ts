import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Proveedor, SAMPLE_PROVEEDORES } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private proveedoresSubject = new BehaviorSubject<Proveedor[]>([]);
  public proveedores$: Observable<Proveedor[]> = this.proveedoresSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  getProveedores(): Proveedor[] {
    return this.proveedoresSubject.value;
  }

  getProveedorById(id: string): Proveedor | undefined {
    return this.proveedoresSubject.value.find(p => p.id === id);
  }

  addProveedor(proveedor: Proveedor): void {
    const proveedores = [...this.proveedoresSubject.value];
    proveedores.unshift(proveedor);
    this.proveedoresSubject.next(proveedores);
    this.saveToLocalStorage();
  }

  updateProveedor(id: string, proveedor: Partial<Proveedor>): void {
    const proveedores = this.proveedoresSubject.value;
    const index = proveedores.findIndex(p => p.id === id);
    if (index !== -1) {
      proveedores[index] = { ...proveedores[index], ...proveedor, updatedAt: new Date() };
      this.proveedoresSubject.next([...proveedores]);
      this.saveToLocalStorage();
    }
  }

  deleteProveedor(id: string): void {
    const proveedores = this.proveedoresSubject.value.filter(p => p.id !== id);
    this.proveedoresSubject.next([...proveedores]);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const proveedores = this.proveedoresSubject.value;
      const proveedoresToSave = proveedores.map(proveedor => ({
        ...proveedor,
        createdAt: proveedor.createdAt instanceof Date ? proveedor.createdAt.toISOString() : proveedor.createdAt,
        updatedAt: proveedor.updatedAt instanceof Date ? proveedor.updatedAt.toISOString() : proveedor.updatedAt
      }));
      localStorage.setItem('proveedores', JSON.stringify(proveedoresToSave));
    } catch (error) {
      console.error('Error saving proveedores to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('proveedores');
      if (stored) {
        const proveedores = JSON.parse(stored);
        if (Array.isArray(proveedores) && proveedores.length > 0) {
          proveedores.forEach((p: any) => {
            p.createdAt = new Date(p.createdAt);
            p.updatedAt = new Date(p.updatedAt);
          });
          this.proveedoresSubject.next(proveedores);
        } else {
          // Si no hay datos, usar los datos de ejemplo
          this.proveedoresSubject.next([...SAMPLE_PROVEEDORES]);
          this.saveToLocalStorage();
        }
      } else {
        // Si no hay datos en localStorage, usar los datos de ejemplo
        this.proveedoresSubject.next([...SAMPLE_PROVEEDORES]);
        this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading proveedores from localStorage:', error);
      this.proveedoresSubject.next([...SAMPLE_PROVEEDORES]);
    }
  }
}

