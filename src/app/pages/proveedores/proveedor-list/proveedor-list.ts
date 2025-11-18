import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { ProveedorService } from '../../../services/proveedor.service';
import { Proveedor } from '../../../models/proveedor.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.html',
  styleUrls: ['./proveedor-list.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ProveedorListComponent implements OnInit, OnDestroy {
  
  proveedores: Proveedor[] = [];
  filteredProveedores: Proveedor[] = [];
  searchTerm: string = '';
  selectedProveedor: Proveedor | null = null;
  isAdmin: boolean = false;
  private subscription?: Subscription;
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private proveedorService: ProveedorService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    this.isAdmin = this.authService.hasRole('Administrador');
    
    // Suscribirse a cambios en la autenticación
    this.authSubscription = this.authService.authState$.subscribe(() => {
      this.isAdmin = this.authService.hasRole('Administrador');
    });
    
    // Cargar proveedores desde el servicio
    this.loadProveedores();
    
    // Suscribirse a cambios en el servicio
    this.subscription = this.proveedorService.proveedores$.subscribe(() => {
      setTimeout(() => {
        this.loadProveedores();
      }, 50);
    });
    
    // Suscribirse a eventos de navegación para recargar cuando se vuelva a esta página
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/proveedores' || event.urlAfterRedirects === '/proveedores') {
          setTimeout(() => {
            this.loadProveedores();
          }, 100);
        }
      });
  }

  loadProveedores(): void {
    try {
      const proveedores = this.proveedorService.getProveedores();
      this.proveedores = [...proveedores];
      this.filterProveedores();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error en loadProveedores:', error);
      this.proveedores = [];
      this.filteredProveedores = [];
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  formatDate(date: string | Date | null | undefined): string {
    try {
      if (!date) return '_/_/_';
      
      let dateObj: Date;
      if (typeof date === 'string') {
        if (!date || date.trim() === '') return '_/_/_';
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return '_/_/_';
      }
      
      if (isNaN(dateObj.getTime())) return '_/_/_';
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error en formatDate:', error, date);
      return '_/_/_';
    }
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.filterProveedores();
  }

  filterProveedores(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProveedores = this.proveedores;
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredProveedores = this.proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(search) ||
        proveedor.contacto.toLowerCase().includes(search) ||
        proveedor.email.toLowerCase().includes(search) ||
        proveedor.tipoProducto.toLowerCase().includes(search)
      );
    }
  }

  viewProveedor(proveedor: Proveedor): void {
    this.selectedProveedor = proveedor;
  }

  editProveedor(proveedor: Proveedor): void {
    if (proveedor && proveedor.id) {
      this.router.navigate(['/proveedores/edit', proveedor.id]);
    }
  }

  deleteProveedor(proveedor: Proveedor): void {
    if (proveedor && proveedor.id) {
      if (confirm(`¿Estás seguro de que quieres eliminar el proveedor "${proveedor.nombre}"?`)) {
        this.proveedorService.deleteProveedor(proveedor.id);
        if (this.selectedProveedor?.id === proveedor.id) {
          this.selectedProveedor = null;
        }
      }
    }
  }

  closeView(): void {
    this.selectedProveedor = null;
  }

  getActiveCount(): number {
    return this.proveedores.filter(p => p.activo).length;
  }

  getUniqueProductTypes(): number {
    const types = new Set(this.proveedores.map(p => p.tipoProducto));
    return types.size;
  }
}

