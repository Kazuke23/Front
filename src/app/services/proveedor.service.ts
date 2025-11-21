import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';
import { API_CONFIG } from '../config/api.config';

interface ApiSupplier {
  id: string;
  name: string;
  contact_info: string;
}

interface CreateSupplierRequest {
  name: string;
  contact_info: string;
}

interface SupplierItem {
  id?: string;
  supplierItemId?: string;
  supplierId?: string;
  ingredientId: string;
  pricePerUnit: number;
  unitId: string;
  // Compatibilidad con formato anterior
  supplier_id?: string;
  ingredient_id?: string;
  price_per_unit?: number;
  unit_id?: string;
}

interface CreateSupplierItemRequest {
  supplierItemId?: string;
  supplierId?: string;
  ingredientId: string;
  pricePerUnit: number;
  unitId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/suppliers`;
  private proveedoresSubject = new BehaviorSubject<Proveedor[]>([]);
  public proveedores$: Observable<Proveedor[]> = this.proveedoresSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSuppliers();
  }

  /**
   * Cargar proveedores desde la API
   */
  private loadSuppliers(): void {
    this.http.get<ApiSupplier[]>(this.apiUrl).pipe(
      map(apiSuppliers => apiSuppliers.map(api => this.apiToProveedor(api))),
      catchError(error => {
        console.warn('Error al cargar proveedores desde API:', error);
        return of([]);
      })
    ).subscribe(proveedores => {
      this.proveedoresSubject.next(proveedores);
    });
  }

  /**
   * Convertir ApiSupplier a Proveedor
   */
  private apiToProveedor(api: ApiSupplier): Proveedor {
    // Parsear contact_info que puede contener múltiples datos
    const contactParts = api.contact_info.split('|');
    return {
      id: api.id,
      nombre: api.name,
      contacto: contactParts[0] || api.contact_info,
      telefono: contactParts[1] || '',
      email: contactParts[2] || '',
      direccion: contactParts[3] || '',
      tipoProducto: 'Otros',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Convertir Proveedor a ApiSupplier
   */
  private proveedorToApi(proveedor: Proveedor): ApiSupplier {
    const contactInfo = `${proveedor.contacto}|${proveedor.telefono}|${proveedor.email}|${proveedor.direccion}`;
    return {
      id: proveedor.id,
      name: proveedor.nombre,
      contact_info: contactInfo
    };
  }

  /**
   * GET /suppliers - Listar proveedores
   */
  getProveedores(): Proveedor[] {
    return this.proveedoresSubject.value;
  }

  /**
   * GET /suppliers - Listar proveedores (Observable)
   */
  getProveedoresObservable(): Observable<Proveedor[]> {
    return this.http.get<ApiSupplier[]>(this.apiUrl).pipe(
      map(apiSuppliers => apiSuppliers.map(api => this.apiToProveedor(api))),
      tap(proveedores => {
        this.proveedoresSubject.next(proveedores);
      }),
      catchError(error => {
        console.error('Error al obtener proveedores:', error);
        return of(this.proveedoresSubject.value);
      })
    );
  }

  /**
   * GET /suppliers/{id} - Obtener proveedor por ID
   */
  getProveedorById(id: string): Proveedor | undefined {
    return this.proveedoresSubject.value.find(p => p.id === id);
  }

  /**
   * GET /suppliers/{id} - Obtener proveedor por ID (Observable)
   */
  getProveedorByIdObservable(id: string): Observable<Proveedor> {
    return this.http.get<ApiSupplier>(`${this.apiUrl}/${id}`).pipe(
      map(api => this.apiToProveedor(api)),
      catchError(error => {
        console.error('Error al obtener proveedor:', error);
        const local = this.proveedoresSubject.value.find(p => p.id === id);
        return local ? of(local) : of(null as any);
      })
    );
  }

  /**
   * POST /suppliers - Registrar proveedor
   */
  addProveedor(proveedor: Proveedor): void {
    const createRequest: CreateSupplierRequest = {
      name: proveedor.nombre,
      contact_info: `${proveedor.contacto}|${proveedor.telefono}|${proveedor.email}|${proveedor.direccion}`
    };

    this.http.post<ApiSupplier>(this.apiUrl, createRequest).pipe(
      map(api => this.apiToProveedor(api)),
      tap(newProveedor => {
        const proveedores = [newProveedor, ...this.proveedoresSubject.value];
        this.proveedoresSubject.next(proveedores);
      }),
      catchError(error => {
        console.error('Error al crear proveedor en API, guardando localmente:', error);
        // Fallback: guardar localmente
        const proveedores = [proveedor, ...this.proveedoresSubject.value];
        this.proveedoresSubject.next(proveedores);
        return of(proveedor);
      })
    ).subscribe();
  }

  /**
   * PUT /suppliers/{id} - Actualizar proveedor
   */
  updateProveedor(id: string, proveedor: Partial<Proveedor>): void {
    const existingProveedor = this.proveedoresSubject.value.find(p => p.id === id);
    if (!existingProveedor) {
      console.error('Proveedor no encontrado:', id);
      return;
    }

    const updatedProveedor = { ...existingProveedor, ...proveedor, updatedAt: new Date() };
    const updateRequest: CreateSupplierRequest = {
      name: updatedProveedor.nombre,
      contact_info: `${updatedProveedor.contacto}|${updatedProveedor.telefono}|${updatedProveedor.email}|${updatedProveedor.direccion}`
    };

    this.http.put<ApiSupplier>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map(api => this.apiToProveedor(api)),
      tap(updated => {
        const proveedores = this.proveedoresSubject.value.map(p => p.id === id ? updated : p);
        this.proveedoresSubject.next(proveedores);
      }),
      catchError(error => {
        console.error('Error al actualizar proveedor en API, actualizando localmente:', error);
        // Fallback: actualizar localmente
        const proveedores = this.proveedoresSubject.value.map(p => 
          p.id === id ? updatedProveedor : p
        );
        this.proveedoresSubject.next(proveedores);
        return of(updatedProveedor);
      })
    ).subscribe();
  }

  /**
   * DELETE /suppliers/{id} - Eliminar proveedor
   */
  deleteProveedor(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const proveedores = this.proveedoresSubject.value.filter(p => p.id !== id);
        this.proveedoresSubject.next(proveedores);
      }),
      catchError(error => {
        console.error('Error al eliminar proveedor:', error);
        // Fallback: eliminar localmente
        const proveedores = this.proveedoresSubject.value.filter(p => p.id !== id);
        this.proveedoresSubject.next(proveedores);
        return of(void 0);
      })
    ).subscribe();
  }

  /**
   * POST /suppliers/{id}/items - Registrar producto ofrecido por proveedor
   */
  addSupplierItem(supplierId: string, ingredientId: string, pricePerUnit: number, unitId: string): Observable<SupplierItem> {
    const requestBody: CreateSupplierItemRequest = {
      supplierId: supplierId,
      ingredientId: ingredientId,
      pricePerUnit: pricePerUnit,
      unitId: unitId
    };
    return this.http.post<SupplierItem>(`${this.apiUrl}/${supplierId}/items`, requestBody);
  }

  /**
   * GET /suppliers/{id}/item-list - Listar productos del proveedor
   */
  getSupplierItems(supplierId: string): Observable<SupplierItem[]> {
    return this.http.get<SupplierItem[]>(`${this.apiUrl}/${supplierId}/item-list`);
  }
}


