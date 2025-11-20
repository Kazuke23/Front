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
  restaurant_id: string;
  menu_id: string;
  planned_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuPlanningService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/menu-planning`;

  constructor(private http: HttpClient) {}

  /**
   * POST /menu-planning - Crear planificación de menú
   */
  createMenuPlanning(data: CreateMenuPlanningRequest): Observable<MenuPlanning> {
    return this.http.post<MenuPlanning>(this.apiUrl, data);
  }

  /**
   * GET /menu-planning - Listar planificaciones (si existe endpoint)
   */
  getMenuPlannings(): Observable<MenuPlanning[]> {
    return this.http.get<MenuPlanning[]>(this.apiUrl);
  }

  /**
   * GET /menu-planning/{id} - Obtener planificación por ID (si existe)
   */
  getMenuPlanningById(id: string): Observable<MenuPlanning> {
    return this.http.get<MenuPlanning>(`${this.apiUrl}/${id}`);
  }
}
