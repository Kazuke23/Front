import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Unit {
  id: string;
  name?: string;
  code?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  default_unit_id: string;
  calories_per_unit?: number;
  description?: string;
}

export interface CreateIngredientRequest {
  name: string;
  default_unit_id: string;
  calories_per_unit?: number;
}

export interface UpdateIngredientRequest {
  description?: string;
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
}
