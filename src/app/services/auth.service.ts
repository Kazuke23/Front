import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id: string;
  email: string;
  nombre?: string;
  full_name?: string;
  rol?: 'Administrador' | 'Chef' | 'Usuario';
  role?: string;
  username?: string;
  restaurant_id?: string;
}

export interface LoginResponse {
  message?: string;
  userId?: string;
  email?: string;
  username?: string;
  token: string;
  roleId?: string;
  roleName?: string;
  token_type?: string;
  user?: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null
  });

  public authState$ = this.authState.asObservable();
  private readonly apiUrl = `${API_CONFIG.baseUrl}/auth`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkStoredAuth();
    }
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token);
          if (response.user) {
            this.normalizeUser(response.user);
            this.setAuthState(true, response.user);
          }
        }
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        throw error;
      })
    );
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  login(email: string, password: string): Observable<LoginResponse> {
    // Credenciales demo para desarrollo
    const demoUsers: { [key: string]: { password: string; user: User } } = {
      'admin@recetario.com': {
        password: '123456',
        user: {
          id: '1',
          email: 'admin@recetario.com',
          nombre: 'Administrador',
          full_name: 'Administrador',
          rol: 'Administrador',
          role: 'Administrador',
          username: 'admin'
        }
      },
      'chef@recetario.com': {
        password: 'chef123',
        user: {
          id: '2',
          email: 'chef@recetario.com',
          nombre: 'Chef',
          full_name: 'Chef',
          rol: 'Chef',
          role: 'Chef',
          username: 'chef'
        }
      }
    };

    // Verificar si son credenciales demo
    if (demoUsers[email] && demoUsers[email].password === password) {
      const demoUser = demoUsers[email].user;
      const mockResponse: LoginResponse = {
        token: 'demo_token_' + Date.now(),
        token_type: 'Bearer',
        user: demoUser
      };
      
      this.saveToken(mockResponse.token);
      this.normalizeUser(demoUser);
      this.setAuthState(true, demoUser);
      
      return of(mockResponse);
    }

    // Intentar login con el backend
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token);
          
          // Construir usuario desde la respuesta
          let user: User | undefined = response.user;
          if (!user && response.userId) {
          
            user = {
              id: response.userId,
              email: response.email || email,
              username: response.username,
              nombre: response.username,
              full_name: response.username,
              role: response.roleName === 'CHEF' ? 'Chef' : 'Administrador' as 'Administrador' | 'Chef' | 'Usuario',
              rol: response.roleName === 'CHEF' ? 'Chef' : 'Administrador' as 'Administrador' | 'Chef' | 'Usuario'
            };
          }
          
          if (user) {
            this.normalizeUser(user);
            this.setAuthState(true, user);
          }
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
         // Si falla el backend y son credenciales demo, usar modo demo
         if (demoUsers[email] && demoUsers[email].password === password) {
           const demoUser = demoUsers[email].user;
           const mockResponse: LoginResponse = {
             token: 'demo_token_' + Date.now(),
             token_type: 'Bearer',
             user: demoUser
           };
           
           this.saveToken(mockResponse.token);
           this.normalizeUser(demoUser);
           this.setAuthState(true, demoUser);
           
           return of(mockResponse);
         }
        throw error;
      })
    );
  }

  /**
   * Normalizar usuario para compatibilidad
   */
  private normalizeUser(user: User): void {
    // Mapear full_name a nombre si no existe
    if (!user.nombre && user.full_name) {
      user.nombre = user.full_name;
    }
    // Mapear role a rol si no existe
    if (!user.rol && user.role) {
      user.rol = user.role as 'Administrador' | 'Chef' | 'Usuario';
    }
    // Mapear nombre a full_name si no existe
    if (!user.full_name && user.nombre) {
      user.full_name = user.nombre;
    }
    // Mapear rol a role si no existe
    if (!user.role && user.rol) {
      user.role = user.rol;
    }
  }

  /**
   * GET /auth/user/{id} - Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`).pipe(
      map(user => {
        this.normalizeUser(user);
        return user;
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.setAuthState(false, null);
    this.clearToken();
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Guardar token JWT
   */
  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Limpiar token JWT
   */
  private clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === role : false;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol || 'sin rol') : false;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('Administrador');
  }

  /**
   * Verificar si el usuario es chef
   */
  isChef(): boolean {
    return this.hasRole('Chef');
  }

  /**
   * Actualizar el estado de autenticación
   */
  private setAuthState(isAuthenticated: boolean, user: User | null): void {
    if (user) {
      this.normalizeUser(user);
    }
    this.authState.next({ isAuthenticated, user });
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    }
  }

  /**
   * Verificar datos de autenticación guardados
   */
  private checkStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.normalizeUser(user);
        this.setAuthState(true, user);
      } catch (error) {
        console.error('Error al parsear datos de usuario guardados:', error);
        this.clearToken();
      }
    }
  }
}
