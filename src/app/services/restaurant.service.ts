import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { API_CONFIG } from '../config/api.config';

interface ApiRestaurant {
  id: string;
  name: string;
  nit: string;
  city: string;
  country: string;
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

interface AssignUserRequest {
  user_id: string;
  role_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/restaurants`;
  private restaurantsSubject = new BehaviorSubject<Restaurant[]>([]);
  public restaurants$: Observable<Restaurant[]> = this.restaurantsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRestaurants();
  }

  /**
   * Cargar restaurantes desde la API
   */
  private loadRestaurants(): void {
    this.http.get<ApiRestaurant[]>(this.apiUrl).pipe(
      map(apiRestaurants => apiRestaurants.map(api => this.apiToRestaurant(api))),
      catchError(error => {
        console.warn('Error al cargar restaurantes desde API:', error);
        return of([]);
      })
    ).subscribe(restaurants => {
      this.restaurantsSubject.next(restaurants);
    });
  }

  /**
   * Convertir ApiRestaurant a Restaurant
   */
  private apiToRestaurant(api: ApiRestaurant): Restaurant {
    return {
      id: api.id,
      name: api.name,
      address: api.address || '',
      phone: '',
      email: '',
      cuisine: '',
      rating: 0,
      capacity: 0,
      isActive: true,
      description: '',
      openingHours: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * GET /restaurants - Listar restaurantes
   */
  getRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value;
  }

  /**
   * GET /restaurants - Listar restaurantes (Observable)
   */
  getRestaurantsObservable(): Observable<Restaurant[]> {
    return this.http.get<ApiRestaurant[]>(this.apiUrl).pipe(
      map(apiRestaurants => apiRestaurants.map(api => this.apiToRestaurant(api))),
      tap(restaurants => {
        this.restaurantsSubject.next(restaurants);
      }),
      catchError(error => {
        console.error('Error al obtener restaurantes:', error);
        return of(this.restaurantsSubject.value);
      })
    );
  }

  /**
   * GET /restaurants/{id} - Obtener restaurante por ID
   */
  getRestaurantByIdSync(id: string): Restaurant | undefined {
    return this.restaurantsSubject.value.find(r => r.id === id);
  }

  /**
   * GET /restaurants/{id} - Obtener restaurante por ID (Observable)
   */
  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<ApiRestaurant>(`${this.apiUrl}/${id}`).pipe(
      map(api => this.apiToRestaurant(api)),
      catchError(error => {
        console.error('Error al obtener restaurante:', error);
        const local = this.restaurantsSubject.value.find(r => r.id === id);
        return local ? of(local) : of(null as any);
      })
    );
  }

  /**
   * GET /restaurants - Obtener restaurantes activos
   */
  getActiveRestaurants(): Restaurant[] {
    return this.restaurantsSubject.value.filter(r => r.isActive !== false);
  }

  /**
   * POST /restaurants - Crear restaurante (HU-01)
   */
  addRestaurant(restaurant: Restaurant): void {
    const createRequest: CreateRestaurantRequest = {
      name: restaurant.name,
      nit: '',
      city: '',
      country: ''
    };

    this.http.post<ApiRestaurant>(this.apiUrl, createRequest).pipe(
      map(api => this.apiToRestaurant(api)),
      tap(newRestaurant => {
        const restaurants = [newRestaurant, ...this.restaurantsSubject.value];
        this.restaurantsSubject.next(restaurants);
      }),
      catchError(error => {
        console.error('Error al crear restaurante en API, guardando localmente:', error);
        // Fallback: guardar localmente
        const restaurants = [restaurant, ...this.restaurantsSubject.value];
        this.restaurantsSubject.next(restaurants);
        return of(restaurant);
      })
    ).subscribe();
  }

  /**
   * PUT /restaurants/{id} - Editar restaurante (HU-02)
   */
  updateRestaurant(id: string, restaurant: Partial<Restaurant>): void {
    const updateRequest: UpdateRestaurantRequest = {
      address: restaurant.address || ''
    };

    this.http.put<ApiRestaurant>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map(api => this.apiToRestaurant(api)),
      tap(updated => {
        const restaurants = this.restaurantsSubject.value.map(r => 
          r.id === id ? { ...r, ...updated, ...restaurant } : r
        );
        this.restaurantsSubject.next(restaurants);
      }),
      catchError(error => {
        console.error('Error al actualizar restaurante en API, actualizando localmente:', error);
        // Fallback: actualizar localmente
        const restaurants = this.restaurantsSubject.value.map(r => 
          r.id === id ? { ...r, ...restaurant, updatedAt: new Date() } : r
        );
        this.restaurantsSubject.next(restaurants);
        return of(restaurant as Restaurant);
      })
    ).subscribe();
  }

  /**
   * Eliminar restaurante (no hay endpoint en la API, solo local)
   */
  deleteRestaurant(id: string): void {
    const restaurants = this.restaurantsSubject.value.filter(r => r.id !== id);
    this.restaurantsSubject.next(restaurants);
  }

  /**
   * POST /restaurants/{id}/assign-user - Asignar usuario a restaurante (HU-05)
   */
  assignUser(restaurantId: string, data: AssignUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${restaurantId}/assign-user`, data);
  }

  /**
   * GET /restaurants/{id}/users - Consultar usuarios asignados
   */
  getRestaurantUsers(restaurantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${restaurantId}/users`);
  }
}

