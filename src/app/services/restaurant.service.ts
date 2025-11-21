import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Restaurant, SAMPLE_RESTAURANTS } from '../models/restaurant.model';

interface ApiRestaurant {
  id: string;
  name: string;
  nit?: string;
  city?: string;
  country?: string;
  address?: string;
}

interface CreateRestaurantRequest {
  name: string;
  nit: string;
  city: string;
  country: string;
}

interface UpdateRestaurantRequest {
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurantsSubject = new BehaviorSubject<Restaurant[]>([...SAMPLE_RESTAURANTS]);
  public restaurants$: Observable<Restaurant[]> = this.restaurantsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromLocalStorage();
    this.loadFromAPI();
  }

  getAll(): Observable<Restaurant[]> {
    return this.http.get<ApiRestaurant[]>(`${API_CONFIG.baseUrl}/restaurants`).pipe(
      map(apiRestaurants => apiRestaurants.map(api => this.apiToRestaurant(api))),
      tap(restaurants => {
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
      }),
      catchError(error => {
        console.error('Error loading restaurants from API:', error);
        const local = this.restaurantsSubject.value;
        return of(local);
      })
    );
  }

  getById(id: string): Observable<Restaurant | null> {
    return this.http.get<ApiRestaurant>(`${API_CONFIG.baseUrl}/restaurants/${id}`).pipe(
      map(api => this.apiToRestaurant(api)),
      catchError(error => {
        console.error('Error loading restaurant from API:', error);
        const local = this.restaurantsSubject.value.find(r => r.id === id);
        return of(local || null);
      })
    );
  }

  addRestaurant(data: CreateRestaurantRequest, additionalData?: Partial<Restaurant>): Observable<ApiRestaurant> {
    return this.http.post<ApiRestaurant>(`${API_CONFIG.baseUrl}/restaurants`, data).pipe(
      tap(apiRestaurant => {
        const restaurant = this.apiToRestaurant(apiRestaurant);
        // Agregar datos adicionales del formulario
        if (additionalData) {
          Object.assign(restaurant, additionalData);
        }
        const restaurants = [...this.restaurantsSubject.value, restaurant];
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
      }),
      catchError(error => {
        console.error('Error creating restaurant:', error);
        // Crear localmente como fallback
        const newRestaurant: Restaurant = {
          id: Date.now().toString(),
          name: data.name,
          address: additionalData?.address || `${data.city}, ${data.country}`,
          phone: additionalData?.phone || '',
          email: additionalData?.email || '',
          cuisine: additionalData?.cuisine || '',
          rating: additionalData?.rating || 0,
          capacity: additionalData?.capacity || 0,
          isActive: additionalData?.isActive ?? true,
          description: additionalData?.description || '',
          openingHours: additionalData?.openingHours || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          nit: data.nit,
          city: data.city,
          country: data.country
        };
        const restaurants = [...this.restaurantsSubject.value, newRestaurant];
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
        return of({ id: newRestaurant.id, name: newRestaurant.name } as ApiRestaurant);
      })
    );
  }

  updateRestaurant(id: string, data: UpdateRestaurantRequest, additionalData?: Partial<Restaurant>): Observable<ApiRestaurant> {
    return this.http.put<ApiRestaurant>(`${API_CONFIG.baseUrl}/restaurants/${id}`, data).pipe(
      tap(apiRestaurant => {
        const updated = this.apiToRestaurant(apiRestaurant);
        const restaurants = this.restaurantsSubject.value.map(r => {
          if (r.id === id) {
            const updatedRestaurant = { ...r, address: data.address, updatedAt: new Date() };
            // Agregar datos adicionales del formulario
            if (additionalData) {
              Object.assign(updatedRestaurant, additionalData);
            }
            return updatedRestaurant;
          }
          return r;
        });
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
      }),
      catchError(error => {
        console.error('Error updating restaurant:', error);
        // Actualizar localmente como fallback
        const restaurants = this.restaurantsSubject.value.map(r => {
          if (r.id === id) {
            const updatedRestaurant = { ...r, address: data.address, updatedAt: new Date() };
            // Agregar datos adicionales del formulario
            if (additionalData) {
              Object.assign(updatedRestaurant, additionalData);
            }
            return updatedRestaurant;
          }
          return r;
        });
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
        const restaurant = restaurants.find(r => r.id === id);
        return of({ id: id, name: restaurant?.name || '', address: data.address } as ApiRestaurant);
      })
    );
  }

  deleteRestaurant(id: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}/restaurants/${id}`).pipe(
      tap(() => {
        const restaurants = this.restaurantsSubject.value.filter(r => r.id !== id);
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
      }),
      catchError(error => {
        console.error('Error deleting restaurant:', error);
        // Eliminar localmente como fallback
        const restaurants = this.restaurantsSubject.value.filter(r => r.id !== id);
        this.restaurantsSubject.next(restaurants);
        this.saveToLocalStorage(restaurants);
        return of(undefined);
      })
    );
  }

  getRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value;
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurantsSubject.value.find(r => r.id === id);
  }

  getActiveRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value.filter(r => r.isActive);
  }

  private apiToRestaurant(api: ApiRestaurant): Restaurant {
    const existing = this.restaurantsSubject.value.find(r => r.id === api.id);
    return {
      id: api.id,
      name: api.name,
      address: api.address || existing?.address || `${api.city || ''}, ${api.country || ''}`,
      phone: existing?.phone || '',
      email: existing?.email || '',
      cuisine: existing?.cuisine || '',
      rating: existing?.rating || 0,
      capacity: existing?.capacity || 0,
      isActive: existing?.isActive ?? true,
      description: existing?.description || '',
      openingHours: existing?.openingHours || '',
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date()
    };
  }

  private loadFromAPI(): void {
    this.getAll().subscribe();
  }

  private saveToLocalStorage(restaurants?: Restaurant[]): void {
    try {
      const data = restaurants || this.restaurantsSubject.value;
      localStorage.setItem('restaurants', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving restaurants to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('restaurants');
      if (stored) {
        const restaurants = JSON.parse(stored);
        if (restaurants && restaurants.length > 0) {
          restaurants.forEach((r: any) => {
            r.createdAt = new Date(r.createdAt);
            r.updatedAt = new Date(r.updatedAt);
          });
          this.restaurantsSubject.next(restaurants);
          return;
        }
      }
      this.restaurantsSubject.next([...SAMPLE_RESTAURANTS]);
    } catch (error) {
      console.error('Error loading restaurants from localStorage:', error);
      this.restaurantsSubject.next([...SAMPLE_RESTAURANTS]);
    }
  }
}
