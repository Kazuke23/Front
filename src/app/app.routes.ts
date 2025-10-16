import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.Users) },
  { path: 'formulario', loadComponent: () => import('./pages/formulario/formulario').then(m => m.FormularioPage) },
  { path: 'tabla', loadComponent: () => import('./pages/tabla/tabla').then(m => m.TablaPage) },
]; 