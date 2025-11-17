import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos - usar Server rendering
  {
    path: 'menu/edit/:id',
    renderMode: RenderMode.Server
  },
  // Todas las demás rutas - prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
