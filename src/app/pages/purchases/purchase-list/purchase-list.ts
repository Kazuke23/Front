import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseOrderDisplay, PurchaseStatus } from '../../../models/purchase.model';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: number;
}

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-list.html',
  styleUrls: ['./purchase-list.css']
})
export class PurchaseListComponent implements OnInit, OnDestroy {
  orders: PurchaseOrderDisplay[] = [];
  filteredOrders: PurchaseOrderDisplay[] = [];
  recentOrders: PurchaseOrderDisplay[] = [];
  stats = {
    totalOrders: 0,
    totalAmount: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
    inProcess: 0,
    restaurants: 0,
    suppliers: 0
  };

  searchTerm = '';
  statusFilter: string = 'all';
  supplierFilter: string = 'all';
  restaurantFilter: string = 'all';
  selectedOrder: PurchaseOrderDisplay | null = null;
  statCards: StatCard[] = [];
  currentPage = 1;
  itemsPerPage = 10;

  private subscription?: Subscription;

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar datos del backend al iniciar
    this.purchaseService.getAll().subscribe({
      next: (orders) => {
        this.orders = orders;
        if (!this.selectedOrder && this.orders.length) {
          this.selectedOrder = this.orders[0];
        }
        this.refreshData();
      },
      error: () => {
        // Si falla, usar datos locales
        this.orders = this.purchaseService.getAllSync();
        if (!this.selectedOrder && this.orders.length) {
          this.selectedOrder = this.orders[0];
        }
        this.refreshData();
      }
    });

    // Suscribirse a cambios en el BehaviorSubject
    this.subscription = this.purchaseService.purchase$.subscribe(() => {
      this.orders = this.purchaseService.getAllSync();
      if (!this.selectedOrder && this.orders.length) {
        this.selectedOrder = this.orders[0];
      }
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refreshData(): void {
    this.stats = this.purchaseService.getSummary();
    this.recentOrders = this.orders.slice(0, 5);
    this.statCards = [
      {
        label: 'Pedidos totales',
        value: this.stats.totalOrders.toString(),
        icon: '📋',
        trend: 8
      },
      {
        label: 'Monto total',
        value: `$${this.stats.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
        icon: '💰',
        trend: 12
      },
      {
        label: 'Pendientes',
        value: this.stats.pending.toString(),
        icon: '⏳',
        trend: -5
      },
      {
        label: 'Completados',
        value: this.stats.completed.toString(),
        icon: '✅',
        trend: 15
      }
    ];
    this.applyFilters();
  }

  onFiltersChange(): void {
    this.applyFilters();
    this.currentPage = 1;
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch =
        !search ||
        order.id.toLowerCase().includes(search) ||
        (order.supplierName && order.supplierName.toLowerCase().includes(search)) ||
        (order.restaurantName && order.restaurantName.toLowerCase().includes(search));
      const matchesStatus =
        this.statusFilter === 'all' || order.status === this.statusFilter;
      const matchesSupplier =
        this.supplierFilter === 'all' || order.supplier_id === this.supplierFilter;
      const matchesRestaurant =
        this.restaurantFilter === 'all' || order.restaurant_id === this.restaurantFilter;
      return matchesSearch && matchesStatus && matchesSupplier && matchesRestaurant;
    });
  }

  selectOrder(order: PurchaseOrderDisplay): void {
    this.selectedOrder = order;
  }

  goToCreate(): void {
    this.router.navigate(['/compras/create']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/compras/edit', id]);
  }

  editOrder(order: PurchaseOrderDisplay, event: MouseEvent): void {
    event.stopPropagation();
    this.goToEdit(order.id);
  }

  deleteOrder(order: PurchaseOrderDisplay, event: MouseEvent): void {
    event.stopPropagation();
    const confirmed = confirm(`¿Eliminar la orden "${order.id}"?`);
    if (confirmed) {
      this.purchaseService.delete(order.id).subscribe({
        next: () => {
          if (this.selectedOrder?.id === order.id) {
            this.selectedOrder = null;
          }
        },
        error: (error) => {
          console.error('Error al eliminar orden:', error);
          alert('Error al eliminar la orden. Por favor, intente nuevamente.');
        }
      });
      if (this.selectedOrder?.id === order.id) {
        this.selectedOrder = null;
      }
    }
  }

  getStatusClass(status: PurchaseStatus): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  getStatusLabel(status: PurchaseStatus): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'in_process': 'En Proceso'
    };
    return labels[status] || status;
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPaginatedOrders(): PurchaseOrderDisplay[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrders.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getSuppliers() {
    return this.purchaseService.getSuppliers();
  }

  getRestaurants() {
    return this.purchaseService.getRestaurants();
  }

  trackById(_: number, order: PurchaseOrderDisplay): string {
    return order.id;
  }

  // Método para reinicializar datos si hay problemas
  resetData(): void {
    if (confirm('¿Desea reinicializar todos los datos de compras? Esto eliminará todos los pedidos actuales.')) {
      this.purchaseService.resetData();
      this.refreshData();
    }
  }
}
