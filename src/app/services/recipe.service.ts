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
  title: string;
  description: string;
  servings: number;
  authorId: string;
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
  constructor(private http: HttpClient) {}

  /**
   * POST /restaurants/{restaurantId}/recipes - Crear receta
   */
  createRecipe(restaurantId: string, data: CreateRecipeRequest): Observable<Recipe> {
    return this.http.post<Recipe>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes`, data);
  }

  /**
   * GET /restaurants/{restaurantId}/recipes - Listar recetas de un restaurante
   */
  getRecipes(restaurantId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes`);
  }

  /**
   * GET /restaurants/{restaurantId}/recipes/{recipeId} - Consultar receta específica
   */
  getRecipeById(restaurantId: string, recipeId: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes/${recipeId}`);
  }

  /**
   * PUT /restaurants/{restaurantId}/recipes/{recipeId} - Editar receta
   */
  updateRecipe(restaurantId: string, recipeId: string, data: UpdateRecipeRequest): Observable<Recipe> {
    return this.http.put<Recipe>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes/${recipeId}`, data);
  }

  /**
   * DELETE /restaurants/{restaurantId}/recipes/{recipeId} - Eliminar receta
   */
  deleteRecipe(restaurantId: string, recipeId: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/recipes/${recipeId}`);
  }
}
