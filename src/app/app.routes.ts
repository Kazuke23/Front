import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { GuestGuard } from './guards/guest.guard';
import { MenuCreate } from './pages/menu/menu-create/menu-create';
import { MenuListComponent } from './pages/menu/menu-list/menu-list';

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
    path: 'ingredientes',
    loadComponent: () => import('./pages/ingredients/ingredients').then(m => m.IngredientsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  {
    path: 'inventario/admin',
    loadComponent: () => import('./pages/inventory/admin-inventory/admin-inventory').then(m => m.AdminInventoryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { path: 'inventario', redirectTo: 'inventario/admin', pathMatch: 'full' },
  {
    path: 'inventario/admin/create',
    loadComponent: () => import('./pages/inventory/inventory-form/inventory-form').then(m => m.InventoryFormComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'inventario/admin/edit/:id',
    loadComponent: () => import('./pages/inventory/inventory-form/inventory-form').then(m => m.InventoryFormComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'inventario/chef',
    loadComponent: () => import('./pages/inventory/chef-inventory/chef-inventory').then(m => m.ChefInventoryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Chef'] }
  },
  
  { 
    path: 'formulario', 
    loadComponent: () => import('./pages/formulario/formulario').then(m => m.FormularioPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  {
    path: 'tabla',
    redirectTo: 'inventario/admin',
    pathMatch: 'full'
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
  {
    path: 'proveedores',
    children: [
      { path: '', loadComponent: () => import('./pages/proveedores/proveedor-list/proveedor-list').then(m => m.ProveedorListComponent) },
      { path: 'create', loadComponent: () => import('./pages/proveedores/proveedor-create/proveedor-create').then(m => m.ProveedorCreateComponent) },
      { path: 'edit/:id', loadComponent: () => import('./pages/proveedores/proveedor-create/proveedor-create').then(m => m.ProveedorCreateComponent) }
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] } // Solo administradores
  },
  {
    path: 'compras',
    children: [
      { path: '', loadComponent: () => import('./pages/purchases/purchase-list/purchase-list').then(m => m.PurchaseListComponent) },
      { path: 'create', loadComponent: () => import('./pages/purchases/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./pages/purchases/purchase-form/purchase-form').then(m => m.PurchaseFormComponent) }
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] } // Solo administradores
  },
  {
    path: 'menu',
    children: [
      { path: '', component: MenuListComponent },
      { path: 'create', component: MenuCreate },
      { path: 'edit/:id', component: MenuCreate }
    ]
  },
  
  // Página de acceso denegado
  { 
    path: 'access-denied', 
    loadComponent: () => import('./pages/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  },
  
  // Ruta por defecto para rutas no encontradas - redirigir a recetas
  { path: '**', redirectTo: '/recetas' }
]; 