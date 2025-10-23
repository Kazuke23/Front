import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'Administrador' | 'Chef' | 'Usuario';
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Solo verificar datos guardados en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.checkStoredAuth();
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let user: User | null = null;

        // Simular autenticación con usuarios predefinidos
        if (email === 'admin@recetario.com' && password === '123456') {
          user = {
            id: '1',
            email: 'admin@recetario.com',
            nombre: 'Administrador',
            rol: 'Administrador'
          };
        } else if (email === 'chef@recetario.com' && password === 'chef123') {
          user = {
            id: '2',
            email: 'chef@recetario.com',
            nombre: 'Chef Juan',
            rol: 'Chef'
          };
        } else if (email === 'usuario@recetario.com' && password === 'user123') {
          user = {
            id: '3',
            email: 'usuario@recetario.com',
            nombre: 'Usuario Normal',
            rol: 'Usuario'
          };
        }

        if (user) {
          this.setAuthState(true, user);
          this.saveAuthToStorage(user);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.setAuthState(false, null);
    this.clearAuthFromStorage();
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
    return user ? roles.includes(user.rol) : false;
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
    this.authState.next({ isAuthenticated, user });
  }

  /**
   * Guardar datos de autenticación en localStorage
   */
  private saveAuthToStorage(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  /**
   * Limpiar datos de autenticación del localStorage
   */
  private clearAuthFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Verificar datos de autenticación guardados
   */
  private checkStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.setAuthState(true, user);
      } catch (error) {
        console.error('Error al parsear datos de usuario guardados:', error);
        this.clearAuthFromStorage();
      }
    }
  }
}
