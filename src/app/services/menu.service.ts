import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Menu } from '../models/menu.model';
import { RestaurantService } from './restaurant.service';
import { API_CONFIG } from '../config/api.config';

interface ApiMenu {
  id: string;
  restaurant_id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface CreateMenuRequest {
  restaurant_id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface AddRecipeToMenuRequest {
  recipe_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/menus`;
  private menusSubject = new BehaviorSubject<Menu[]>([]);
  public menus$: Observable<Menu[]> = this.menusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService
  ) {
    this.loadMenus();
  }

  /**
   * Cargar menús desde la API
   */
  private loadMenus(): void {
    this.http.get<ApiMenu[]>(this.apiUrl).pipe(
      map(apiMenus => apiMenus.map(api => this.apiToMenu(api))),
      catchError(error => {
        console.warn('Error al cargar menús desde API, usando localStorage:', error);
        this.loadFromLocalStorage();
        return of([]);
      })
    ).subscribe(menus => {
      this.menusSubject.next(menus);
      if (menus.length > 0) {
        this.saveToLocalStorage();
      }
    });
  }

  /**
   * Convertir ApiMenu a Menu
   */
  private apiToMenu(api: ApiMenu): Menu {
    return {
      id: api.id,
      restauranteId: api.restaurant_id,
      nombre: api.name,
      fechaInicio: api.start_date,
      fechaFin: api.end_date,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Convertir Menu a ApiMenu
   */
  private menuToApi(menu: Menu): ApiMenu {
    return {
      id: menu.id,
      restaurant_id: menu.restauranteId,
      name: menu.nombre,
      start_date: menu.fechaInicio,
      end_date: menu.fechaFin
    };
  }

  /**
   * GET /menus - Listar menús
   */
  getMenus(): Menu[] {
    try {
      if (!this.restaurantService) {
        console.warn('RestaurantService no está disponible');
        return this.menusSubject.value.map(menu => ({
          ...menu,
          restauranteNombre: 'Restaurante no encontrado'
        }));
      }
      
      return this.menusSubject.value.map(menu => {
        try {
          const restaurant = this.restaurantService.getRestaurantByIdSync(menu.restauranteId);
          return {
            ...menu,
            restauranteNombre: restaurant?.name || 'Restaurante no encontrado'
          };
        } catch (error) {
          console.error('Error al obtener restaurante para menú:', menu.id, error);
          return {
            ...menu,
            restauranteNombre: 'Restaurante no encontrado'
          };
        }
      });
    } catch (error) {
      console.error('Error en getMenus:', error);
      return this.menusSubject.value;
    }
  }

  /**
   * GET /menus - Listar menús (Observable)
   */
  getMenusObservable(): Observable<Menu[]> {
    return this.http.get<ApiMenu[]>(this.apiUrl).pipe(
      map(apiMenus => apiMenus.map(api => this.apiToMenu(api))),
      tap(menus => {
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Error al obtener menús:', error);
        return of(this.menusSubject.value);
      })
    );
  }

  /**
   * GET /menus/{id} - Consultar menú
   */
  getMenuById(id: string): Menu | undefined {
    try {
      const menu = this.menusSubject.value.find(m => m.id === id);
      if (menu) {
        if (!this.restaurantService) {
          return {
            ...menu,
            restauranteNombre: 'Restaurante no encontrado'
          };
        }
        const restaurant = this.restaurantService.getRestaurantByIdSync(menu.restauranteId);
        return {
          ...menu,
          restauranteNombre: restaurant?.name || 'Restaurante no encontrado'
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error en getMenuById:', error);
      return this.menusSubject.value.find(m => m.id === id);
    }
  }

  /**
   * GET /menus/{id} - Consultar menú (Observable)
   */
  getMenuByIdObservable(id: string): Observable<Menu> {
    return this.http.get<ApiMenu>(`${this.apiUrl}/${id}`).pipe(
      map(api => this.apiToMenu(api)),
      catchError(error => {
        console.error('Error al obtener menú:', error);
        const local = this.menusSubject.value.find(m => m.id === id);
        return local ? of(local) : of(null as any);
      })
    );
  }

  /**
   * POST /menus - Crear menú
   */
  addMenu(menu: Menu): void {
    const createRequest: CreateMenuRequest = {
      restaurant_id: menu.restauranteId,
      name: menu.nombre,
      start_date: menu.fechaInicio,
      end_date: menu.fechaFin
    };

    this.http.post<ApiMenu>(this.apiUrl, createRequest).pipe(
      map(api => this.apiToMenu(api)),
      tap(newMenu => {
        const menus = [newMenu, ...this.menusSubject.value];
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Error al crear menú en API, guardando localmente:', error);
        // Fallback: guardar localmente
        const menus = [menu, ...this.menusSubject.value];
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
        return of(menu);
      })
    ).subscribe();
  }

  /**
   * PUT /menus/{id} - Editar menú
   */
  updateMenu(id: string, menu: Partial<Menu>): void {
    const existingMenu = this.menusSubject.value.find(m => m.id === id);
    if (!existingMenu) {
      console.error('Menú no encontrado:', id);
      return;
    }

    const updatedMenu = { ...existingMenu, ...menu, updatedAt: new Date() };
    const updateRequest: CreateMenuRequest = {
      restaurant_id: updatedMenu.restauranteId,
      name: updatedMenu.nombre,
      start_date: updatedMenu.fechaInicio,
      end_date: updatedMenu.fechaFin
    };

    this.http.put<ApiMenu>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map(api => this.apiToMenu(api)),
      tap(updated => {
        const menus = this.menusSubject.value.map(m => m.id === id ? updated : m);
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Error al actualizar menú en API, actualizando localmente:', error);
        // Fallback: actualizar localmente
        const menus = this.menusSubject.value.map(m => m.id === id ? updatedMenu : m);
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
        return of(updatedMenu);
      })
    ).subscribe();
  }

  /**
   * DELETE /menus/{id} - Eliminar menú
   */
  deleteMenu(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const menus = this.menusSubject.value.filter(m => m.id !== id);
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
      }),
      catchError(error => {
        console.error('Error al eliminar menú en API, eliminando localmente:', error);
        // Fallback: eliminar localmente
        const menus = this.menusSubject.value.filter(m => m.id !== id);
        this.menusSubject.next(menus);
        this.saveToLocalStorage();
        return of(void 0);
      })
    ).subscribe();
  }

  /**
   * POST /menus/{id}/recipes - Agregar receta al menú
   */
  addRecipeToMenu(menuId: string, recipeId: string): Observable<any> {
    const request: AddRecipeToMenuRequest = { recipe_id: recipeId };
    return this.http.post(`${this.apiUrl}/${menuId}/recipes`, request);
  }

  /**
   * GET /menus/{id}/recipes - Consultar recetas del menú
   */
  getMenuRecipes(menuId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${menuId}/recipes`);
  }

  private saveToLocalStorage(): void {
    try {
      const menus = this.menusSubject.value;
      console.log('Guardando menús en localStorage. Cantidad:', menus.length);
      console.log('Menús a guardar:', menus);
      
      // Serializar correctamente las fechas
      const menusToSave = menus.map(menu => ({
        ...menu,
        createdAt: menu.createdAt instanceof Date ? menu.createdAt.toISOString() : menu.createdAt,
        updatedAt: menu.updatedAt instanceof Date ? menu.updatedAt.toISOString() : menu.updatedAt
      }));
      
      const jsonString = JSON.stringify(menusToSave);
      console.log('JSON a guardar:', jsonString);
      localStorage.setItem('menus', jsonString);
      
      // Verificar que se guardó
      const stored = localStorage.getItem('menus');
      console.log('Verificación - datos guardados:', stored);
      console.log('Menús guardados exitosamente');
    } catch (error) {
      console.error('Error saving menus to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('menus');
      if (stored) {
        const menus = JSON.parse(stored);
        if (Array.isArray(menus) && menus.length > 0) {
          menus.forEach((m: any) => {
            m.createdAt = new Date(m.createdAt);
            m.updatedAt = new Date(m.updatedAt);
          });
          this.menusSubject.next(menus);
          console.log('Menús cargados desde localStorage:', menus);
        } else {
          console.log('No hay menús guardados en localStorage');
          this.menusSubject.next([]);
        }
      } else {
        console.log('No hay datos de menús en localStorage');
        this.menusSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading menus from localStorage:', error);
      this.menusSubject.next([]);
    }
  }
}

