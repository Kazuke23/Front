import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { InventoryItemDisplay, InventoryRestaurant } from '../../../models/inventory.model';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: number;
}

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.html',
  styleUrls: ['./admin-inventory.css']
})
export class AdminInventoryComponent implements OnInit, OnDestroy {
  items: InventoryItemDisplay[] = [];
  filteredItems: InventoryItemDisplay[] = [];
  recentItems: InventoryItemDisplay[] = [];
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
  selectedItem: InventoryItemDisplay | null = null;
  statCards: StatCard[] = [];

  private subscription?: Subscription;

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
  }

  ngOnInit(): void {
    this.subscription = this.inventoryService.inventory$.subscribe(() => {
      this.items = this.inventoryService.getAll();
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
        label: 'Artículos activos',
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
        label: 'Categorías cubiertas',
        value: this.stats.categories.toString(),
        icon: '🏷️',
        trend: 2
      },
      {
        label: 'Sedes con stock',
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
        (item.ingredientName && item.ingredientName.toLowerCase().includes(search)) ||
        (item.restaurantName && item.restaurantName.toLowerCase().includes(search));
      const matchesStatus =
        this.statusFilter === 'all' || (item.status && item.status === this.statusFilter);
      const matchesRestaurant =
        this.restaurantFilter === 'all' || item.restaurant_id === this.restaurantFilter;
      return matchesSearch && matchesStatus && matchesRestaurant;
    });
  }

  selectItem(item: InventoryItemDisplay): void {
    this.selectedItem = item;
  }

  goToCreate(): void {
    this.router.navigate(['/inventario/admin/create']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/inventario/admin/edit', id]);
  }

  editItem(item: InventoryItemDisplay, event: MouseEvent): void {
    event.stopPropagation();
    this.goToEdit(item.id);
  }

  deleteItem(item: InventoryItemDisplay, event: MouseEvent): void {
    event.stopPropagation();
    const name = item.ingredientName || item.id;
    const confirmed = confirm(`¿Eliminar "${name}" del inventario?`);
    if (confirmed) {
      this.inventoryService.delete(item.id);
      if (this.selectedItem?.id === item.id) {
        this.selectedItem = null;
      }
    }
  }

  getStockProgress(item: InventoryItemDisplay): number {
    // Asumir nivel crítico en 10 unidades
    const criticalLevel = 10;
    const ratio = (item.quantity / criticalLevel) * 100;
    return Math.max(5, Math.min(ratio, 120));
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Disponible';
    const labels: { [key: string]: string } = {
      'available': 'Disponible',
      'low': 'Crítico',
      'out': 'Agotado'
    };
    return labels[status] || 'Disponible';
  }

  trackById(_: number, item: InventoryItemDisplay): string {
    return item.id;
  }

  // Método para reinicializar datos si hay problemas
  resetData(): void {
    if (confirm('¿Desea reinicializar todos los datos de inventario? Esto eliminará todos los ítems actuales.')) {
      this.inventoryService.resetData();
      this.refreshData();
    }
  }
}
