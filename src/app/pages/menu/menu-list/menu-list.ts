import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../../models/menu.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.html',
  styleUrls: ['./menu-list.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class MenuListComponent implements OnInit, OnDestroy {
  
  menuItems: Menu[] = [];
  filteredMenuItems: Menu[] = [];
  searchTerm: string = '';
  selectedMenu: Menu | null = null;
  isAdmin: boolean = false;
  private subscription?: Subscription;
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private menuService: MenuService,
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
    
    // Cargar menús desde el servicio
    this.loadMenus();
    
    // Suscribirse a cambios en el servicio
    this.subscription = this.menuService.menus$.subscribe(() => {
      console.log('=== Suscripción activada - actualizando lista ===');
      // Usar setTimeout para asegurar que el cambio se haya propagado
      setTimeout(() => {
        this.loadMenus();
      }, 50);
    });
    
    // Suscribirse a eventos de navegación para recargar cuando se vuelva a esta página
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/menu' || event.urlAfterRedirects === '/menu') {
          console.log('Navegación a /menu detectada, recargando menús');
          setTimeout(() => {
            this.loadMenus();
          }, 100);
        }
      });
  }

  loadMenus(): void {
    try {
      console.log('=== loadMenus llamado ===');
      const menus = this.menuService.getMenus();
      console.log('Menús obtenidos del servicio:', menus);
      console.log('Cantidad de menús:', menus.length);
      
      // Validar que menus sea un array
      if (!Array.isArray(menus)) {
        console.error('getMenus no devolvió un array:', menus);
        this.menuItems = [];
        this.filterMenus();
        return;
      }
      
      // Crear una nueva referencia del array para forzar la detección de cambios
      this.menuItems = [...menus];
      console.log('menuItems actualizado:', this.menuItems.length);
      console.log('menuItems:', this.menuItems);
      
      this.filterMenus();
      console.log('filteredMenuItems después de filtrar:', this.filteredMenuItems.length);
      console.log('filteredMenuItems:', this.filteredMenuItems);
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error en loadMenus:', error);
      this.menuItems = [];
      this.filteredMenuItems = [];
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
        // Si es string, intentar parsearlo
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
    this.filterMenus();
  }

  filterMenus(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMenuItems = this.menuItems;
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredMenuItems = this.menuItems.filter(menu =>
        menu.nombre.toLowerCase().includes(search) ||
        (menu.restauranteNombre && menu.restauranteNombre.toLowerCase().includes(search))
      );
    }
  }

  viewMenu(menu: Menu): void {
    console.log('Ver menú:', menu);
    this.selectedMenu = menu;
  }

  editMenu(menu: Menu): void {
    console.log('Editar menú:', menu);
    if (menu && menu.id) {
      this.router.navigate(['/menu/edit', menu.id]);
    } else {
      console.error('Menú inválido para editar:', menu);
    }
  }

  deleteMenu(menu: Menu): void {
    console.log('Eliminar menú:', menu);
    if (menu && menu.id) {
      if (confirm(`¿Estás seguro de que quieres eliminar el menú "${menu.nombre}"?`)) {
        this.menuService.deleteMenu(menu.id);
        if (this.selectedMenu?.id === menu.id) {
          this.selectedMenu = null;
        }
      }
    } else {
      console.error('Menú inválido para eliminar:', menu);
    }
  }

  closeView(): void {
    this.selectedMenu = null;
  }
}
