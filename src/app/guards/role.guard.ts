
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Primero verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Obtener roles requeridos de la configuración de la ruta
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // Si no se especifican roles, permitir acceso
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // Si no tiene los roles necesarios, redirigir a página de acceso denegado
    this.router.navigate(['/access-denied']);
    return false;
  }
}
