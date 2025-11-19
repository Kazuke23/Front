import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';
import {
  InventoryIngredient,
  InventoryItem,
  InventoryItemDisplay,
  InventoryRestaurant,
  InventoryUnit
} from '../../../models/inventory.model';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
    this.ingredients = this.inventoryService.getIngredients();
    this.units = this.inventoryService.getUnits();
  }

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pageTitle = 'Actualizar inventario';
      this.ctaLabel = 'Actualizar';
      this.loadItem(id);
    }
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
    const item = this.inventoryService.getById(id);
    if (!item) {
      alert('No se encontró el ítem solicitado.');
      this.router.navigate(['/inventario/admin']);
      return;
    }
    this.currentItem = item;
    this.form.patchValue({
      restaurant_id: item.restaurant_id,
      ingredient_id: item.ingredient_id,
      unit_id: item.unit_id,
      quantity: item.quantity
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
      this.inventoryService.updateQuantity(this.currentItem.id, Number(value.quantity)).subscribe({
        next: () => {
          this.router.navigate(['/inventario/admin']);
        },
        error: (error) => {
          console.error('Error al actualizar item:', error);
          alert('Error al actualizar el item. Por favor, intente nuevamente.');
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
          this.router.navigate(['/inventario/admin']);
        },
        error: (error) => {
          console.error('Error al crear item:', error);
          alert('Error al crear el item. Por favor, intente nuevamente.');
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
