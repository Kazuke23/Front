import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseOrder, PurchaseStatus } from '../../../models/purchase.model';

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
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  recentOrders: PurchaseOrder[] = [];
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
  selectedOrder: PurchaseOrder | null = null;
  statCards: StatCard[] = [];
  currentPage = 1;
  itemsPerPage = 10;

  private subscription?: Subscription;

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.purchaseService.purchase$.subscribe(orders => {
      this.orders = [...orders].sort(
        (a, b) => b.fechaPedido.getTime() - a.fechaPedido.getTime()
      );
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
        order.orderId.toLowerCase().includes(search) ||
        order.supplierName.toLowerCase().includes(search) ||
        order.restaurantName.toLowerCase().includes(search);
      const matchesStatus =
        this.statusFilter === 'all' || order.status === this.statusFilter;
      const matchesSupplier =
        this.supplierFilter === 'all' || order.supplierId === this.supplierFilter;
      const matchesRestaurant =
        this.restaurantFilter === 'all' || order.restaurantId === this.restaurantFilter;
      return matchesSearch && matchesStatus && matchesSupplier && matchesRestaurant;
    });
  }

  selectOrder(order: PurchaseOrder): void {
    this.selectedOrder = order;
  }

  goToCreate(): void {
    this.router.navigate(['/compras/create']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/compras/edit', id]);
  }

  editOrder(order: PurchaseOrder, event: MouseEvent): void {
    event.stopPropagation();
    this.goToEdit(order.id);
  }

  deleteOrder(order: PurchaseOrder, event: MouseEvent): void {
    event.stopPropagation();
    const confirmed = confirm(`¿Eliminar la orden "${order.orderId}"?`);
    if (confirmed) {
      this.purchaseService.delete(order.id);
      if (this.selectedOrder?.id === order.id) {
        this.selectedOrder = null;
      }
    }
  }

  formatDate(date?: Date | null): string {
    if (!date) return '--/--/--';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getStatusClass(status: PurchaseStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPaginatedOrders(): PurchaseOrder[] {
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

  trackById(_: number, order: PurchaseOrder): string {
    return order.id;
  }
}

