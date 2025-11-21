import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RestaurantService } from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmService } from '../../../services/confirm.service';
import { Restaurant } from '../../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css']
})
export class RestaurantListComponent implements OnInit, OnDestroy {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  searchTerm = '';
  private subscription?: Subscription;

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private notificationService: NotificationService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
    this.subscription = this.restaurantService.restaurants$.subscribe(restaurants => {
      this.restaurants = restaurants;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadRestaurants(): void {
    this.restaurants = this.restaurantService.getRestaurants();
    this.applyFilters();
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.restaurants];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(search) ||
        (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(search)) ||
        (restaurant.address && restaurant.address.toLowerCase().includes(search)) ||
        (restaurant.phone && restaurant.phone.toLowerCase().includes(search))
      );
    }

    this.filteredRestaurants = filtered;
    this.cdr.detectChanges();
  }

  getStatusLabel(restaurant: Restaurant): string {
    if (restaurant.isActive === false) return 'Cerrado';
    if (restaurant.isActive === true) return 'Activo';
    return 'Pendiente';
  }

  getStatusClass(restaurant: Restaurant): string {
    if (restaurant.isActive === false) return 'status-closed';
    if (restaurant.isActive === true) return 'status-active';
    return 'status-pending';
  }

  viewRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    // TODO: Implementar vista de detalles
    this.notificationService.info(`Ver detalles de ${restaurant.name}`);
  }

  editRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/restaurantes/edit', restaurant.id]);
  }

  deleteRestaurant(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    this.confirmService.confirm({
      title: '¿Estás seguro?',
      message: `¿Deseas eliminar el restaurante "${restaurant.name}"? Esta acción no se puede deshacer.`,
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.restaurantService.deleteRestaurant(restaurant.id);
        this.notificationService.success(`Restaurante "${restaurant.name}" eliminado exitosamente`);
        this.loadRestaurants();
      }
    });
  }

  getLocation(restaurant: Restaurant): string {
    return restaurant.address || 'N/A';
  }

  trackById(index: number, restaurant: Restaurant): string {
    return restaurant.id;
  }
}

