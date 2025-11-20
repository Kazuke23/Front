import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { User } from './auth.service';

export interface UserUpdateRequest {
  full_name?: string;
}

export interface AssignRoleRequest {
  role_id: string;
  restaurant_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * GET /users - Listar usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * GET /users/{id} - Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * PUT /users/{id} - Actualizar usuario
   */
  updateUser(id: string, data: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * POST /users/{id}/assign-role - Asignar rol y restaurante
   */
  assignRole(id: string, data: AssignRoleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/assign-role`, data);
  }
}
