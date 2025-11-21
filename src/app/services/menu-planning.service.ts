import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface MenuPlanning {
  id: string;
  restaurant_id: string;
  menu_id: string;
  planned_date: string;
}

export interface CreateMenuPlanningRequest {
  menuId: string; // camelCase según API
  plannedDate: string; // camelCase según API (YYYY-MM-DD)
}

export interface PlanningItem {
  id?: string;
  planningId?: string;
  recipeId: string; // camelCase según API
  servings: number; // API usa servings, no quantity
}

@Injectable({
  providedIn: 'root'
})
export class MenuPlanningService {
  constructor(private http: HttpClient) {}

  /**
   * POST /restaurants/{restaurantId}/menu-planning - Crear planificación de menú
   */
  createMenuPlanning(restaurantId: string, data: CreateMenuPlanningRequest): Observable<MenuPlanning> {
    return this.http.post<MenuPlanning>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menu-planning`, data);
  }

  /**
   * GET /restaurants/{restaurantId}/menu-planning - Listar planificaciones
   */
  getMenuPlannings(restaurantId: string): Observable<MenuPlanning[]> {
    return this.http.get<MenuPlanning[]>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menu-planning`);
  }

  /**
   * DELETE /restaurants/{restaurantId}/menu-planning/{planningId} - Eliminar planificación
   */
  deleteMenuPlanning(restaurantId: string, planningId: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menu-planning/${planningId}`);
  }

  /**
   * POST /restaurants/{restaurantId}/menu-planning/{planningId}/items - Agregar item a planificación
   */
  addPlanningItem(restaurantId: string, planningId: string, recipeId: string, servings: number): Observable<PlanningItem> {
    const requestBody = { recipeId, servings }; // API espera recipeId y servings en camelCase
    return this.http.post<PlanningItem>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menu-planning/${planningId}/items`, requestBody);
  }

  /**
   * GET /restaurants/{restaurantId}/menu-planning/{planningId}/items - Consultar items de planificación
   */
  getPlanningItems(restaurantId: string, planningId: string): Observable<PlanningItem[]> {
    return this.http.get<PlanningItem[]>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menu-planning/${planningId}/items`);
  }
}

