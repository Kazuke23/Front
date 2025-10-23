import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Rutas públicas (solo para usuarios no autenticados)
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [GuestGuard]
  },
  
  // Rutas protegidas por autenticación
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    canActivate: [AuthGuard]
  },
  
  // Rutas protegidas por roles específicos
  { 
    path: 'users', 
    loadComponent: () => import('./pages/users/users').then(m => m.Users),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] } // Solo administradores
  },
  
  { 
    path: 'recetas', 
    loadComponent: () => import('./pages/recipes/recipes').then(m => m.RecipesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  { 
    path: 'formulario', 
    loadComponent: () => import('./pages/formulario/formulario').then(m => m.FormularioPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  { 
    path: 'tabla', 
    loadComponent: () => import('./pages/tabla/tabla').then(m => m.TablaPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  { 
    path: 'planificacion', 
    loadComponent: () => import('./pages/planificacion/planificacion').then(m => m.PlanificacionComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  { 
    path: 'restaurantes', 
    loadComponent: () => import('./pages/restaurants/restaurants').then(m => m.RestaurantsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] } // Solo administradores
  },
  
  // Página de acceso denegado
  { 
    path: 'access-denied', 
    loadComponent: () => import('./pages/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  },
  
  // Ruta por defecto para rutas no encontradas
  { path: '**', redirectTo: '' }
]; 