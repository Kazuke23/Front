import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Restaurant, SAMPLE_RESTAURANTS } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurantsSubject = new BehaviorSubject<Restaurant[]>([...SAMPLE_RESTAURANTS]);
  public restaurants$: Observable<Restaurant[]> = this.restaurantsSubject.asObservable();

  constructor() {
    // Cargar restaurantes desde localStorage si existen
    this.loadFromLocalStorage();
  }

  getRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value;
  }

  getActiveRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value.filter(r => r.isActive);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurantsSubject.value.find(r => r.id === id);
  }

  addRestaurant(restaurant: Restaurant): void {
    const restaurants = this.restaurantsSubject.value;
    restaurants.unshift(restaurant);
    this.restaurantsSubject.next([...restaurants]);
    this.saveToLocalStorage();
  }

  updateRestaurant(id: string, restaurant: Partial<Restaurant>): void {
    const restaurants = this.restaurantsSubject.value;
    const index = restaurants.findIndex(r => r.id === id);
    if (index !== -1) {
      restaurants[index] = { ...restaurants[index], ...restaurant, updatedAt: new Date() };
      this.restaurantsSubject.next([...restaurants]);
      this.saveToLocalStorage();
    }
  }

  deleteRestaurant(id: string): void {
    const restaurants = this.restaurantsSubject.value.filter(r => r.id !== id);
    this.restaurantsSubject.next([...restaurants]);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const restaurants = this.restaurantsSubject.value;
      localStorage.setItem('restaurants', JSON.stringify(restaurants));
    } catch (error) {
      console.error('Error saving restaurants to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('restaurants');
      if (stored) {
        const restaurants = JSON.parse(stored);
        // Si hay restaurantes guardados y no están vacíos, usarlos
        if (restaurants && restaurants.length > 0) {
          // Convertir fechas de string a Date
          restaurants.forEach((r: any) => {
            r.createdAt = new Date(r.createdAt);
            r.updatedAt = new Date(r.updatedAt);
          });
          this.restaurantsSubject.next(restaurants);
          return;
        }
      }
      // Si no hay restaurantes guardados o están vacíos, usar los de muestra
      console.log('No hay restaurantes en localStorage, usando restaurantes de muestra');
      this.restaurantsSubject.next([...SAMPLE_RESTAURANTS]);
    } catch (error) {
      console.error('Error loading restaurants from localStorage:', error);
      // En caso de error, usar los de muestra
      this.restaurantsSubject.next([...SAMPLE_RESTAURANTS]);
    }
  }
}

