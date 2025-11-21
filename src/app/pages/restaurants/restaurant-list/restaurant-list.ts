import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css']
})
export class RestaurantListComponent implements OnInit, OnDestroy {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  searchTerm = '';
  statusFilter: string = 'all';
  cuisineFilter: string = 'all';

  private subscription?: Subscription;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.restaurants = this.restaurantService.getRestaurants();
    this.applyFilters();
    
    // Suscribirse a cambios
    this.subscription = this.restaurantService.restaurants$.subscribe(restaurants => {
      this.restaurants = restaurants;
      this.applyFilters();
      this.cdr.detectChanges();
    });
    
    // Refrescar desde API
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refreshData(): void {
    this.restaurantService.getAll().subscribe({
      next: (restaurants: Restaurant[]) => {
        this.restaurants = restaurants;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading restaurants:', error);
        this.restaurants = this.restaurantService.getRestaurants();
        this.applyFilters();
      }
    });
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.restaurants];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        (r.address && r.address.toLowerCase().includes(search)) ||
        (r.cuisine && r.cuisine.toLowerCase().includes(search)) ||
        (r.phone && r.phone.toLowerCase().includes(search))
      );
    }

    // Filtro de estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (this.statusFilter === 'active') return r.isActive;
        if (this.statusFilter === 'inactive') return !r.isActive;
        return true;
      });
    }

    // Filtro de tipo de cocina
    if (this.cuisineFilter !== 'all') {
      filtered = filtered.filter(r => r.cuisine === this.cuisineFilter);
    }

    this.filteredRestaurants = filtered;
  }

  goToCreate(): void {
    this.router.navigate(['/restaurantes/create']);
  }

  viewRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/restaurantes', restaurant.id]);
  }

  editRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/restaurantes/edit', restaurant.id]);
  }

  deleteRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    if (confirm(`¿Estás seguro de que quieres eliminar el restaurante "${restaurant.name}"?`)) {
      this.restaurantService.deleteRestaurant(restaurant.id).subscribe({
        next: () => {
          this.refreshData();
        },
        error: (error: any) => {
          console.error('Error deleting restaurant:', error);
        }
      });
    }
  }

  getStatusClass(restaurant: Restaurant): string {
    return restaurant.isActive ? 'active' : 'pending';
  }

  getStatusLabel(restaurant: Restaurant): string {
    return restaurant.isActive ? 'Activo' : 'Pendiente';
  }

  getCuisineTypes(): string[] {
    const cuisines = new Set(this.restaurants.map(r => r.cuisine).filter(Boolean));
    return Array.from(cuisines).sort();
  }

  trackById(_: number, restaurant: Restaurant): string {
    return restaurant.id;
  }
}

