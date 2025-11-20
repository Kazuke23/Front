import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmService } from '../../../services/confirm.service';
import { InventoryItemDisplay, InventoryRestaurant } from '../../../models/inventory.model';

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

  private subscription?: Subscription;

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private notificationService: NotificationService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
  }

  ngOnInit(): void {
    // Cargar datos del backend al iniciar
    this.inventoryService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        if (!this.selectedItem && this.items.length) {
          this.selectedItem = this.items[0];
        }
        this.refreshData();
      },
      error: () => {
        // Si falla, usar datos locales
        this.items = this.inventoryService.getAllSync();
        if (!this.selectedItem && this.items.length) {
          this.selectedItem = this.items[0];
        }
        this.refreshData();
      }
    });

    // Suscribirse a cambios en el BehaviorSubject para actualizaciones en tiempo real
    this.subscription = this.inventoryService.inventory$.subscribe(() => {
      // Usar setTimeout para asegurar que se ejecute después de la actualización del servicio
      setTimeout(() => {
        const newItems = this.inventoryService.getAllSync();
        const currentIds = this.items.map(i => i.id).sort().join(',');
        const newIds = newItems.map(i => i.id).sort().join(',');
        
        // Actualizar si hay cambios en los IDs
        if (currentIds !== newIds) {
          // Crear nuevo array para forzar detección de cambios
          this.items = [...newItems];
          
          // Actualizar selección si el item seleccionado ya no existe
          if (this.selectedItem && !this.items.find(i => i.id === this.selectedItem?.id)) {
            this.selectedItem = this.items.length > 0 ? this.items[0] : null;
          }
          
          this.refreshData();
          this.cdr.detectChanges();
        }
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refreshData(): void {
    this.stats = this.inventoryService.getSummary();
    this.categories = this.inventoryService.getCategories();
    this.recentItems = this.items.slice(0, 4);
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
    const itemId = item.id;
    
    this.confirmService.confirm({
      title: 'Eliminar ítem',
      message: `¿Está seguro de eliminar "${name}" del inventario? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        // Eliminar inmediatamente del array local (respuesta instantánea)
        this.items = this.items.filter(i => i.id !== itemId);
        
        // Limpiar selección si era el item seleccionado
        if (this.selectedItem?.id === itemId) {
          this.selectedItem = this.items.length > 0 ? this.items[0] : null;
        }
        
        // Actualizar filtros y estadísticas
        this.refreshData();
        
        // Forzar detección de cambios inmediatamente
        this.cdr.detectChanges();
        
        // Mostrar notificación
        this.notificationService.success(`¡"${name}" eliminado exitosamente!`);
        
        // Llamar al servicio para sincronizar con backend (ya actualizó BehaviorSubject)
        this.inventoryService.delete(itemId).subscribe({
          next: () => {
            // Sincronizar con el servicio para asegurar consistencia
            const syncedItems = this.inventoryService.getAllSync();
            if (syncedItems.length !== this.items.length) {
              this.items = [...syncedItems];
              this.refreshData();
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
            console.error('Error al eliminar item del backend:', error);
            // Ya se eliminó localmente, solo sincronizar si es necesario
            const syncedItems = this.inventoryService.getAllSync();
            if (syncedItems.length !== this.items.length) {
              this.items = [...syncedItems];
              this.refreshData();
              this.cdr.detectChanges();
            }
          }
        });
      }
    });
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
    this.confirmService.confirm({
      title: 'Reinicializar datos',
      message: '¿Desea reinicializar todos los datos de inventario? Esto eliminará todos los ítems actuales y no se puede deshacer.',
      confirmText: 'Reinicializar',
      cancelText: 'Cancelar',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.inventoryService.resetData();
        this.refreshData();
        this.notificationService.success('¡Datos reinicializados exitosamente!');
      }
    });
  }
}
