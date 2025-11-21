import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Unit {
  id: string;
  code: string;
  description: string;
}

export interface Ingredient {
  id: string;
  code?: string;
  name: string;
  description?: string;
  caloriesPerUnit?: number;
  defaultUnit?: {
    id: string;
    code: string;
    description: string;
  };
  // Compatibilidad con formato anterior
  default_unit_id?: string;
  calories_per_unit?: number;
}

export interface CreateIngredientRequest {
  code: string;
  name: string;
  description?: string;
  caloriesPerUnit?: number;
  defaultUnit: {
    id: string;
    code: string;
    description: string;
  };
}

export interface UpdateIngredientRequest {
  code?: string;
  name?: string;
  description?: string;
  caloriesPerUnit?: number;
  defaultUnit?: {
    id: string;
    code: string;
    description: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/ingredients`;
  private readonly unitsUrl = `${API_CONFIG.baseUrl}/units`;

  constructor(private http: HttpClient) {}

  /**
   * POST /ingredients - Crear ingrediente
   */
  createIngredient(data: CreateIngredientRequest): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.apiUrl, data);
  }

  /**
   * GET /ingredients - Listar ingredientes
   */
  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.apiUrl);
  }

  /**
   * GET /ingredients/{id} - Ver detalle de ingrediente
   */
  getIngredientById(id: string): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.apiUrl}/${id}`);
  }

  /**
   * PUT /ingredients/{id} - Actualizar ingrediente
   */
  updateIngredient(id: string, data: UpdateIngredientRequest): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * DELETE /ingredients/{id} - Eliminar ingrediente
   */
  deleteIngredient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /units - Listar unidades disponibles
   */
  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.unitsUrl);
  }

  /**
   * POST /units - Crear unidad
   */
  createUnit(data: { id: string; code: string; description: string }): Observable<Unit> {
    return this.http.post<Unit>(this.unitsUrl, data);
  }
}
