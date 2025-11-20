import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  unit_id: string;
}

export interface RecipePreparation {
  step_number: number;
  instructions: string;
}

export interface Recipe {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  servings: number;
  ingredients?: RecipeIngredient[];
  preparations?: RecipePreparation[];
}

export interface CreateRecipeRequest {
  restaurant_id: string;
  title: string;
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  preparations: RecipePreparation[];
}

export interface UpdateRecipeRequest {
  description?: string;
  servings?: number;
  ingredients?: RecipeIngredient[];
  preparations?: RecipePreparation[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/recipes`;

  constructor(private http: HttpClient) {}

  /**
   * POST /recipes - Crear receta (HU-06)
   */
  createRecipe(data: CreateRecipeRequest): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, data);
  }

  /**
   * GET /recipes - Listar todas las recetas
   */
  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  /**
   * GET /recipes/{id} - Consultar receta específica
   */
  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  /**
   * PUT /recipes/{id} - Editar receta (HU-08)
   */
  updateRecipe(id: string, data: UpdateRecipeRequest): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * DELETE /recipes/{id} - Eliminar receta
   */
  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /restaurants/{id}/recipes - Crear receta asociada a restaurante (HU-07)
   */
  createRecipeForRestaurant(restaurantId: string, data: CreateRecipeRequest): Observable<Recipe> {
    return this.http.post<Recipe>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes`, data);
  }
}
