import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';
import { NotificationService } from '../../../services/notification.service';
import {
  InventoryIngredient,
  InventoryItem,
  InventoryItemDisplay,
  InventoryRestaurant,
  InventoryUnit
} from '../../../models/inventory.model';
import { Observable, forkJoin, catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.html',
  styleUrls: ['./inventory-form.css']
})
export class InventoryFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  currentItem?: InventoryItemDisplay;
  pageTitle = 'Nuevo registro de inventario';
  ctaLabel = 'Guardar inventario';

  restaurants: InventoryRestaurant[] = [];
  ingredients: InventoryIngredient[] = [];
  units: InventoryUnit[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Cargar catálogos desde los servicios
    this.loadCatalogs().subscribe(() => {
      this.buildForm();
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode = true;
        this.pageTitle = 'Actualizar inventario';
        this.ctaLabel = 'Actualizar';
        this.loadItem(id);
      }
    });
  }

  /**
   * Cargar catálogos (restaurantes, ingredientes, unidades) desde los servicios
   */
  private loadCatalogs(): Observable<void> {
    this.loading = true;
    return forkJoin({
      restaurants: this.inventoryService.getRestaurantsObservable(),
      ingredients: this.inventoryService.getIngredientsObservable(),
      units: this.inventoryService.getUnitsObservable()
    }).pipe(
      map(({ restaurants, ingredients, units }) => {
        this.restaurants = restaurants;
        this.ingredients = ingredients;
        this.units = units;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Error al cargar catálogos:', error);
        // Fallback a datos locales
        this.restaurants = this.inventoryService.getRestaurants();
        this.ingredients = this.inventoryService.getIngredients();
        this.units = this.inventoryService.getUnits();
        this.loading = false;
        return of(void 0);
      })
    );
  }

  private buildForm(): void {
    this.form = this.fb.group({
      restaurant_id: [this.restaurants[0]?.id ?? '', Validators.required],
      ingredient_id: [this.ingredients[0]?.id ?? '', Validators.required],
      unit_id: [this.units[0]?.id ?? '', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadItem(id: string): void {
    this.inventoryService.getById(id).subscribe({
      next: (item) => {
        if (!item) {
          this.notificationService.warning('No se encontró el ítem solicitado.');
          setTimeout(() => this.router.navigate(['/inventario/admin']), 1500);
          return;
        }
        this.currentItem = item;
        this.form.patchValue({
          restaurant_id: item.restaurant_id,
          ingredient_id: item.ingredient_id,
          unit_id: item.unit_id,
          quantity: item.quantity
        });
      },
      error: () => {
        // Si falla, intentar con datos locales
        const localItem = this.inventoryService.getByIdSync(id);
        if (!localItem) {
          this.notificationService.warning('No se encontró el ítem solicitado.');
          setTimeout(() => this.router.navigate(['/inventario/admin']), 1500);
          return;
        }
        this.currentItem = localItem;
        this.form.patchValue({
          restaurant_id: localItem.restaurant_id,
          ingredient_id: localItem.ingredient_id,
          unit_id: localItem.unit_id,
          quantity: localItem.quantity
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    if (this.isEditMode && this.currentItem) {
      // Solo se puede actualizar la cantidad según el endpoint PUT /inventory/{id}
      const itemId = this.currentItem.id;
      const quantity = Number(value.quantity);
      this.inventoryService.updateQuantity(itemId, quantity).subscribe({
        next: () => {
          this.notificationService.success(`¡Cantidad actualizada a ${quantity} unidades exitosamente!`);
          setTimeout(() => this.router.navigate(['/inventario/admin']), 1500);
        },
        error: (error) => {
          console.error('Error al actualizar item:', error);
          this.notificationService.error('No se pudo actualizar el ítem. Por favor, intente nuevamente.');
        }
      });
    } else {
      const payload: Omit<InventoryItem, 'id'> = {
        restaurant_id: value.restaurant_id,
        ingredient_id: value.ingredient_id,
        unit_id: value.unit_id,
        quantity: Number(value.quantity)
      };
      this.inventoryService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('¡Nuevo ítem agregado al inventario exitosamente!');
          setTimeout(() => this.router.navigate(['/inventario/admin']), 1500);
        },
        error: (error) => {
          console.error('Error al crear item:', error);
          this.notificationService.error('No se pudo crear el ítem. Por favor, intente nuevamente.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/inventario/admin']);
  }

  getFieldClass(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return control.invalid && control.touched ? 'invalid' : '';
  }
}
