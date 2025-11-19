import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import {
  PurchaseOrder,
  PurchaseItem,
  PurchaseStatus,
  PurchaseOrderDisplay
} from '../../../models/purchase.model';
import {
  InventoryRestaurant,
  InventorySupplier,
  InventoryIngredient,
  InventoryUnit
} from '../../../models/inventory.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-form.html',
  styleUrls: ['./purchase-form.css']
})
export class PurchaseFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  currentOrder?: PurchaseOrderDisplay;
  pageTitle = 'Nueva Compra';
  ctaLabel = 'Guardar compra';
  private subscriptions: Subscription[] = [];

  restaurants: InventoryRestaurant[] = [];
  suppliers: InventorySupplier[] = [];
  ingredients: InventoryIngredient[] = [];
  units: InventoryUnit[] = [];
  estados: PurchaseStatus[] = ['pending', 'in_process', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private purchaseService: PurchaseService
  ) {
    this.restaurants = this.purchaseService.getRestaurants();
    this.suppliers = this.purchaseService.getSuppliers();
    this.ingredients = this.purchaseService.getIngredients();
    this.units = this.purchaseService.getUnits();
  }

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Compra';
      this.ctaLabel = 'Actualizar compra';
      this.loadOrder(id);
    } else {
      this.addItem();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private buildForm(): void {
    this.form = this.fb.group({
      restaurant_id: [this.restaurants[0]?.id ?? '', Validators.required],
      supplier_id: [this.suppliers[0]?.id ?? '', Validators.required],
      status: ['pending', Validators.required],
      items: this.fb.array([])
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      ingredient_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit_id: [this.units[0]?.id ?? '', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    const ingredientSub = itemForm.get('ingredient_id')?.valueChanges.subscribe(value => {
      const ingredient = this.ingredients.find(i => i.id === value);
      if (ingredient) {
        const unitId = ingredient.defaultUnitId;
        const unit = this.units.find(u => u.id === unitId);
        if (unit) {
          itemForm.get('unit_id')?.setValue(unitId, { emitEvent: false });
        }
      }
    });

    const priceQtySub = itemForm.valueChanges.subscribe(() => {
      this.updateTotal();
    });

    this.subscriptions.push(ingredientSub!, priceQtySub);
    this.itemsFormArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.updateTotal();
  }

  private updateTotal(): void {
    // El total se calcula en el backend, aquí solo para mostrar
  }

  private loadOrder(id: string): void {
    const order = this.purchaseService.getById(id);
    if (!order) {
      alert('No se encontró la orden solicitada.');
      this.router.navigate(['/compras']);
      return;
    }
    this.currentOrder = order;
    this.form.patchValue({
      restaurant_id: order.restaurant_id,
      supplier_id: order.supplier_id,
      status: order.status
    });

    this.itemsFormArray.clear();
    order.items.forEach(item => {
      const itemForm = this.fb.group({
        ingredient_id: [item.ingredient_id, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
        unit_id: [item.unit_id, Validators.required],
        price: [item.price, [Validators.required, Validators.min(0)]]
      });

      const priceQtySub = itemForm.valueChanges.subscribe(() => {
        this.updateTotal();
      });
      this.subscriptions.push(priceQtySub);

      this.itemsFormArray.push(itemForm);
    });
  }

  submit(): void {
    if (this.form.invalid || this.itemsFormArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.itemsFormArray.length === 0) {
        alert('Debe agregar al menos un ítem a la compra.');
      }
      return;
    }

    const value = this.form.value;

    const items: PurchaseItem[] = value.items.map((item: any) => ({
      ingredient_id: item.ingredient_id,
      quantity: Number(item.quantity),
      unit_id: item.unit_id,
      price: Number(item.price)
    }));

    const payload: Omit<PurchaseOrder, 'id'> = {
      restaurant_id: value.restaurant_id,
      supplier_id: value.supplier_id,
      status: value.status,
      items: items
    };

    if (this.isEditMode && this.currentOrder) {
      this.purchaseService.update(this.currentOrder.id, payload).subscribe({
        next: () => {
          this.router.navigate(['/compras']);
        },
        error: (error) => {
          console.error('Error al actualizar orden:', error);
          alert('Error al actualizar la orden. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.purchaseService.create(payload).subscribe({
        next: () => {
          this.router.navigate(['/compras']);
        },
        error: (error) => {
          console.error('Error al crear orden:', error);
          alert('Error al crear la orden. Por favor, intente nuevamente.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/compras']);
  }

  getFieldClass(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return control.invalid && control.touched ? 'invalid' : '';
  }

  getItemFieldClass(index: number, field: string): string {
    const itemForm = this.itemsFormArray.at(index);
    if (!itemForm) return '';
    const control = itemForm.get(field);
    if (!control) return '';
    return control.invalid && control.touched ? 'invalid' : '';
  }

  getTotal(): number {
    return this.itemsFormArray.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const price = item.get('price')?.value || 0;
      return sum + (quantity * price);
    }, 0);
  }

  getItemSubtotal(index: number): number {
    const itemForm = this.itemsFormArray.at(index);
    if (!itemForm) return 0;
    const quantity = itemForm.get('quantity')?.value || 0;
    const price = itemForm.get('price')?.value || 0;
    return quantity * price;
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
}
