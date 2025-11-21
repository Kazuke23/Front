import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map, forkJoin } from 'rxjs';
import { Menu } from '../models/menu.model';
import { Restaurant } from '../models/restaurant.model';
import { RestaurantService } from './restaurant.service';
import { API_CONFIG } from '../config/api.config';

interface ApiMenu {
  id: string;
  restaurant_id?: string;
  restaurantId?: string;
  name: string;
  start_date?: string; // snake_case en respuesta
  end_date?: string; // snake_case en respuesta
  startDate?: string; // camelCase en respuesta
  endDate?: string; // camelCase en respuesta
}

interface CreateMenuRequest {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface MenuItem {
  id?: string;
  menuId?: string;
  recipeId: string; // camelCase según API
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menusSubject = new BehaviorSubject<Menu[]>([]);
  public menus$: Observable<Menu[]> = this.menusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService
  ) {
    this.loadAllMenus();
  }

  /**
   * Cargar todos los menús de todos los restaurantes
   */
  private loadAllMenus(): void {
    // Cargar restaurantes primero
    this.restaurantService.getRestaurantsObservable().subscribe({
      next: (restaurants: Restaurant[]) => {
        if (restaurants.length === 0) {
          this.loadFromLocalStorage();
          return;
        }
        
        // Cargar menús de cada restaurante
        const menuObservables = restaurants.map((restaurant: Restaurant) =>
          this.getMenusByRestaurant(restaurant.id).pipe(
            catchError(() => of([]))
          )
        );
        
        // Combinar todos los menús
        forkJoin(menuObservables).subscribe({
          next: (menusArrays: any[][]) => {
            const allMenus = menusArrays.flat();
            this.menusSubject.next(allMenus);
            if (allMenus.length > 0) {
              this.saveToLocalStorage();
            }
          },
          error: () => {
            this.loadFromLocalStorage();
          }
        });
      },
      error: () => {
        this.loadFromLocalStorage();
      }
    });
  }

  /**
   * Convertir ApiMenu a Menu
   */
  private apiToMenu(api: ApiMenu): Menu {
    return {
      id: api.id,
      restauranteId: api.restaurant_id || api.restaurantId || '',
      nombre: api.name,
      fechaInicio: api.start_date || api.startDate || '',
      fechaFin: api.end_date || api.endDate || '',
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
   * GET /restaurants/{restaurantId}/menus - Listar menús de un restaurante
   */
  getMenusByRestaurant(restaurantId: string): Observable<Menu[]> {
    return this.http.get<ApiMenu[]>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menus`).pipe(
      map(apiMenus => apiMenus.map(api => this.apiToMenu(api)))
    );
  }

  /**
   * GET /restaurants/{restaurantId}/menus/{menuId} - Consultar menú específico
   */
  getMenuById(restaurantId: string, menuId: string): Observable<Menu> {
    return this.http.get<ApiMenu>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menus/${menuId}`).pipe(
      map(api => this.apiToMenu(api)),
      catchError(error => {
        console.error('Error al obtener menú:', error);
        const local = this.menusSubject.value.find(m => m.id === menuId && m.restauranteId === restaurantId);
        return local ? of(local) : of(null as any);
      })
    );
  }

  /**
   * Método síncrono para compatibilidad
   */
  getMenuByIdSync(id: string): Menu | undefined {
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
   * POST /restaurants/{restaurantId}/menus - Crear menú
   */
  addMenu(menu: Menu): void {
    const createRequest: CreateMenuRequest = {
      name: menu.nombre,
      startDate: menu.fechaInicio, // Formato YYYY-MM-DD
      endDate: menu.fechaFin // Formato YYYY-MM-DD
    };

    this.http.post<ApiMenu>(`${API_CONFIG.baseUrl}/restaurants/${menu.restauranteId}/menus`, createRequest).pipe(
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
   * PUT /restaurants/{restaurantId}/menus/{menuId} - Editar menú
   */
  updateMenu(id: string, menu: Partial<Menu>): void {
    const existingMenu = this.menusSubject.value.find(m => m.id === id);
    if (!existingMenu) {
      console.error('Menú no encontrado:', id);
      return;
    }

    const updatedMenu = { ...existingMenu, ...menu, updatedAt: new Date() };
    const updateRequest: CreateMenuRequest = {
      name: updatedMenu.nombre,
      startDate: updatedMenu.fechaInicio, // Formato YYYY-MM-DD
      endDate: updatedMenu.fechaFin // Formato YYYY-MM-DD
    };

    this.http.put<ApiMenu>(`${API_CONFIG.baseUrl}/restaurants/${existingMenu.restauranteId}/menus/${id}`, updateRequest).pipe(
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
   * DELETE /restaurants/{restaurantId}/menus/{menuId} - Eliminar menú
   */
  deleteMenu(id: string): void {
    const existingMenu = this.menusSubject.value.find(m => m.id === id);
    if (!existingMenu) {
      console.error('Menú no encontrado:', id);
      return;
    }

    this.http.delete<void>(`${API_CONFIG.baseUrl}/restaurants/${existingMenu.restauranteId}/menus/${id}`).pipe(
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
   * POST /restaurants/{restaurantId}/menus/{menuId}/items - Agregar item al menú
   */
  addMenuItem(restaurantId: string, menuId: string, recipeId: string): Observable<MenuItem> {
    const requestBody = { recipeId }; // API espera recipeId en camelCase
    return this.http.post<MenuItem>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menus/${menuId}/items`, requestBody);
  }

  /**
   * GET /restaurants/{restaurantId}/menus/{menuId}/items - Consultar items del menú
   */
  getMenuItems(restaurantId: string, menuId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menus/${menuId}/items`);
  }

  /**
   * DELETE /restaurants/{restaurantId}/menus/{menuId}/items/{itemId} - Eliminar item del menú
   */
  deleteMenuItem(restaurantId: string, menuId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}/restaurants/${restaurantId}/menus/${menuId}/items/${itemId}`);
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

