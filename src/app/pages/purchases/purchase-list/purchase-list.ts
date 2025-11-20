import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmService } from '../../../services/confirm.service';
import { PurchaseOrderDisplay, PurchaseStatus } from '../../../models/purchase.model';

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
  currentPage = 1;
  itemsPerPage = 10;

  private subscription?: Subscription;

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private notificationService: NotificationService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
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

      // Suscribirse a cambios en el BehaviorSubject para actualizaciones en tiempo real
      this.subscription = this.purchaseService.purchase$.subscribe(() => {
        const newOrders = this.purchaseService.getAllSync();
        // Solo actualizar si hay cambios reales
        if (JSON.stringify(this.orders.map(o => o.id)) !== JSON.stringify(newOrders.map(o => o.id))) {
          this.orders = newOrders;
          // Actualizar selección si la orden seleccionada ya no existe
          if (this.selectedOrder && !this.orders.find(o => o.id === this.selectedOrder?.id)) {
            this.selectedOrder = this.orders.length > 0 ? this.orders[0] : null;
          }
          this.refreshData();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refreshData(): void {
    this.stats = this.purchaseService.getSummary();
    this.recentOrders = this.orders.slice(0, 5);
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
    const orderId = order.id;
    
    this.confirmService.confirm({
      title: 'Eliminar orden',
      message: `¿Está seguro de eliminar la orden "${orderId}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        // Eliminar inmediatamente del array local para respuesta instantánea
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.applyFilters();
        
        // Limpiar selección si era la orden seleccionada
        if (this.selectedOrder?.id === orderId) {
          this.selectedOrder = this.orders.length > 0 ? this.orders[0] : null;
        }
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        // Actualizar estadísticas
        this.refreshData();
        
        // Mostrar notificación
        this.notificationService.success(`¡Orden "${orderId}" eliminada exitosamente!`);
        
        // Llamar al servicio para eliminar del backend y actualizar el BehaviorSubject
        this.purchaseService.delete(orderId).subscribe({
          next: () => {
            // Sincronizar con el servicio después de la eliminación
            this.orders = this.purchaseService.getAllSync();
            this.refreshData();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al eliminar orden del backend:', error);
            // Ya se eliminó localmente, solo sincronizar
            this.orders = this.purchaseService.getAllSync();
            this.refreshData();
            this.cdr.detectChanges();
          }
        });
      }
    });
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
    this.confirmService.confirm({
      title: 'Reinicializar datos',
      message: '¿Desea reinicializar todos los datos de compras? Esto eliminará todos los pedidos actuales y no se puede deshacer.',
      confirmText: 'Reinicializar',
      cancelText: 'Cancelar',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.purchaseService.resetData();
        this.refreshData();
        this.notificationService.success('¡Datos reinicializados exitosamente!');
      }
    });
  }
}
