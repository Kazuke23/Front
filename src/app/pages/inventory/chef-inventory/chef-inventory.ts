import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { InventoryItem, InventoryRestaurant } from '../../../models/inventory.model';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: number;
}

@Component({
  selector: 'app-chef-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chef-inventory.html',
  styleUrls: ['./chef-inventory.css']
})
export class ChefInventoryComponent implements OnInit, OnDestroy {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  recentItems: InventoryItem[] = [];
  categories: string[] = [];
  restaurants: InventoryRestaurant[] = [];
  stats = {
    totalItems: 0,
    totalUnits: 0,
    critical: 0,
    agotados: 0,
    categories: 0,
    restaurants: 0
  };

  searchTerm = '';
  categoryFilter: string = 'all';
  statusFilter: string = 'all';
  restaurantFilter: string = 'all';
  selectedItem: InventoryItem | null = null;
  defaultImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
  statCards: StatCard[] = [];

  private subscription?: Subscription;

  constructor(
    private inventoryService: InventoryService
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
  }

  ngOnInit(): void {
    this.subscription = this.inventoryService.inventory$.subscribe(items => {
      this.items = [...items].sort(
        (a, b) => b.fechaActualizacion.getTime() - a.fechaActualizacion.getTime()
      );
      if (!this.selectedItem && this.items.length) {
        this.selectedItem = this.items[0];
      }
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refreshData(): void {
    this.stats = this.inventoryService.getSummary();
    this.categories = this.inventoryService.getCategories();
    this.recentItems = this.items.slice(0, 4);
    this.statCards = [
      {
        label: 'Artículos disponibles',
        value: this.stats.totalItems.toString(),
        icon: '📦',
        trend: 4
      },
      {
        label: 'Unidades totales',
        value: this.stats.totalUnits.toLocaleString('es-ES'),
        icon: '📊',
        trend: 7
      },
      {
        label: 'Alertas críticas',
        value: this.stats.critical.toString(),
        icon: '🚨',
        trend: -3
      },
      {
        label: 'Categorías disponibles',
        value: this.stats.categories.toString(),
        icon: '🏷️',
        trend: 2
      },
      {
        label: 'Sedes activas',
        value: this.stats.restaurants.toString(),
        icon: '🏢',
        trend: 1
      }
    ];
    this.applyFilters();
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredItems = this.items.filter(item => {
      const matchesSearch =
        !search ||
        item.nombre.toLowerCase().includes(search) ||
        item.proveedor.toLowerCase().includes(search) ||
        item.categoria.toLowerCase().includes(search) ||
        item.restaurantName.toLowerCase().includes(search) ||
        item.ingredientName.toLowerCase().includes(search);
      const matchesCategory =
        this.categoryFilter === 'all' || item.categoria === this.categoryFilter;
      const matchesStatus =
        this.statusFilter === 'all' || item.estado === this.statusFilter;
      const matchesRestaurant =
        this.restaurantFilter === 'all' || item.restaurantId === this.restaurantFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesRestaurant;
    });
  }

  selectItem(item: InventoryItem): void {
    this.selectedItem = item;
  }

  formatDate(date?: Date | null): string {
    if (!date) return '--/--/--';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getStockProgress(item: InventoryItem): number {
    if (!item.nivelReorden) return 100;
    const ratio = (item.cantidad / item.nivelReorden) * 100;
    return Math.max(5, Math.min(ratio, 120));
  }

  getCategoryBadge(category: string): string {
    const normalized = category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return normalized;
  }

  getRestaurantLocation(restaurantId: string): string {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    return restaurant ? `${restaurant.city}, ${restaurant.country}` : '';
  }

  trackById(_: number, item: InventoryItem): string {
    return item.id;
  }
}

