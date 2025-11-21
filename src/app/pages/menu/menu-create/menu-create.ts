import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RestaurantService } from '../../../services/restaurant.service';
import { MenuService } from '../../../services/menu.service';
import { Restaurant } from '../../../models/restaurant.model';
import { Menu } from '../../../models/menu.model';

@Component({
  selector: 'app-menu-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './menu-create.html',
  styleUrl: './menu-create.css'
})
export class MenuCreate implements OnInit, OnDestroy {
  
  restaurantes: Restaurant[] = [];
  private subscription?: Subscription;
  isEditing = false;
  menuId: string | null = null;
  
  formData = {
    restaurante: '',
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos editando
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.menuId = id;
      this.loadMenuForEdit(id);
      this.isEditing = true;
    }

    // Obtener todos los restaurantes primero
    const allRestaurants = this.restaurantService.getRestaurants();
    console.log('Todos los restaurantes:', allRestaurants);
    
    // Obtener solo los restaurantes activos
    this.restaurantes = this.restaurantService.getActiveRestaurants();
    console.log('Restaurantes activos:', this.restaurantes);
    
    // Suscribirse a cambios en los restaurantes
    this.subscription = this.restaurantService.restaurants$.subscribe((restaurants: Restaurant[]) => {
      console.log('Restaurantes actualizados:', restaurants);
      this.restaurantes = restaurants.filter((r: Restaurant) => r.isActive);
      console.log('Restaurantes activos actualizados:', this.restaurantes);
    });
  }

  loadMenuForEdit(id: string): void {
    // Usar el método síncrono que no requiere restaurantId
    const menu = this.menuService.getMenuByIdSync(id);
    if (menu) {
      this.formData = {
        restaurante: menu.restauranteId,
        nombre: menu.nombre,
        fechaInicio: menu.fechaInicio,
        fechaFin: menu.fechaFin
      };
    } else {
      // Si no se encuentra localmente, intentar cargar desde la API
      // Buscar en todos los restaurantes
      this.restaurantService.getRestaurantsObservable().subscribe({
        next: (restaurants: Restaurant[]) => {
          let found = false;
          for (const restaurant of restaurants) {
            if (found) break;
            this.menuService.getMenuById(restaurant.id, id).subscribe({
              next: (menuFromApi) => {
                if (menuFromApi && !found) {
                  found = true;
                  this.formData = {
                    restaurante: menuFromApi.restauranteId,
                    nombre: menuFromApi.nombre,
                    fechaInicio: menuFromApi.fechaInicio,
                    fechaFin: menuFromApi.fechaFin
                  };
                }
              },
              error: () => {
                // Continuar buscando en el siguiente restaurante
              }
            });
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSubmit(): void {
    console.log('=== INICIO onSubmit ===');
    console.log('Formulario enviado:', this.formData);
    
    // Validar campos
    if (!this.formData.restaurante || !this.formData.nombre || !this.formData.fechaInicio || !this.formData.fechaFin) {
      alert('Por favor completa todos los campos');
      console.log('Validación fallida - campos incompletos');
      return;
    }

    if (this.isEditing && this.menuId) {
      // Actualizar menú existente
      console.log('Actualizando menú:', this.menuId);
      this.menuService.updateMenu(this.menuId, {
        restauranteId: this.formData.restaurante,
        nombre: this.formData.nombre,
        fechaInicio: this.formData.fechaInicio,
        fechaFin: this.formData.fechaFin
      });
      console.log('Menú actualizado');
    } else {
      // Crear nuevo menú
      console.log('Creando nuevo menú');
      const newMenu: Menu = {
        id: Date.now().toString(),
        restauranteId: this.formData.restaurante,
        nombre: this.formData.nombre,
        fechaInicio: this.formData.fechaInicio,
        fechaFin: this.formData.fechaFin,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Menú a guardar:', JSON.stringify(newMenu, null, 2));
      
      // Verificar que el servicio existe
      if (!this.menuService) {
        console.error('MenuService no está disponible');
        alert('Error: No se puede acceder al servicio de menús');
        return;
      }
      
      this.menuService.addMenu(newMenu);
      console.log('Menú guardado en servicio');
      
      // Verificar que se guardó
      const menusAfter = this.menuService.getMenus();
      console.log('Menús después de guardar:', menusAfter);
      console.log('Total de menús:', menusAfter.length);
    }
    
    // Esperar un momento antes de navegar para asegurar que se guarde
    setTimeout(() => {
      console.log('Navegando a /menu');
      this.router.navigate(['/menu']);
    }, 200);
  }

  onCancel(): void {
    this.router.navigate(['/menu']);
  }
}
