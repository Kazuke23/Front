import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomeComponent } from './pages/home/home';
import { UsersComponent } from './pages/users/users';


export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
   { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent) } // ✅ ruta correcta// ✅ nueva ruta
]; 