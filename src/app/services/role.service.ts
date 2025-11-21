import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * POST /roles - Crear rol
   */
  createRole(data: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, data);
  }

  /**
   * GET /roles - Listar roles
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * GET /roles/{id} - Obtener rol por ID
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }
}

