import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Menu } from '../models/menu.model';
import { RestaurantService } from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menusSubject = new BehaviorSubject<Menu[]>([]);
  public menus$: Observable<Menu[]> = this.menusSubject.asObservable();

  constructor(private restaurantService: RestaurantService) {
    this.loadFromLocalStorage();
  }

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
          const restaurant = this.restaurantService.getRestaurantById(menu.restauranteId);
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
        const restaurant = this.restaurantService.getRestaurantById(menu.restauranteId);
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

  addMenu(menu: Menu): void {
    console.log('=== addMenu llamado ===');
    console.log('Menú recibido:', menu);
    console.log('Menús actuales antes de agregar:', this.menusSubject.value.length);
    
    const menus = [...this.menusSubject.value];
    menus.unshift(menu);
    
    console.log('Menús después de agregar:', menus.length);
    console.log('Lista completa de menús:', menus);
    
    this.menusSubject.next(menus);
    console.log('BehaviorSubject actualizado');
    
    this.saveToLocalStorage();
    console.log('Menú agregado y guardado exitosamente');
    
    // Verificar inmediatamente después
    const verifyMenus = this.menusSubject.value;
    console.log('Verificación - menús en subject:', verifyMenus.length);
  }

  updateMenu(id: string, menu: Partial<Menu>): void {
    const menus = this.menusSubject.value;
    const index = menus.findIndex(m => m.id === id);
    if (index !== -1) {
      menus[index] = { ...menus[index], ...menu, updatedAt: new Date() };
      this.menusSubject.next([...menus]);
      this.saveToLocalStorage();
    }
  }

  deleteMenu(id: string): void {
    console.log('Eliminando menú con id:', id);
    const menus = this.menusSubject.value.filter(m => m.id !== id);
    console.log('Menús después de eliminar:', menus);
    this.menusSubject.next([...menus]);
    this.saveToLocalStorage();
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

