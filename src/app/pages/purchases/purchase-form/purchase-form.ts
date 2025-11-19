import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import {
  PurchaseOrder,
  PurchaseItem,
  PurchaseStatus
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
  currentOrder?: PurchaseOrder;
  pageTitle = 'Nueva Compra';
  ctaLabel = 'Guardar compra';
  private subscriptions: Subscription[] = [];

  restaurants: InventoryRestaurant[] = [];
  suppliers: InventorySupplier[] = [];
  ingredients: InventoryIngredient[] = [];
  units: InventoryUnit[] = [];
  estados: PurchaseStatus[] = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];

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
      restaurantId: [this.restaurants[0]?.id ?? '', Validators.required],
      supplierId: [this.suppliers[0]?.id ?? '', Validators.required],
      fechaPedido: [this.formatInputDate(new Date()), Validators.required],
      fechaEntrega: [null],
      status: ['Pendiente', Validators.required],
      notas: [''],
      items: this.fb.array([]),
      montoTotal: [0]
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      ingredientId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitId: [this.units[0]?.id ?? '', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    const ingredientSub = itemForm.get('ingredientId')?.valueChanges.subscribe(value => {
      const ingredient = this.ingredients.find(i => i.id === value);
      if (ingredient) {
        const unitId = ingredient.defaultUnitId;
        const unit = this.units.find(u => u.id === unitId);
        if (unit) {
          itemForm.get('unitId')?.setValue(unitId, { emitEvent: false });
        }
      }
    });

    const priceQtySub = itemForm.valueChanges.subscribe(() => {
      this.updateItemSubtotal(itemForm);
    });

    this.subscriptions.push(ingredientSub!, priceQtySub);
    this.itemsFormArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.updateTotal();
  }

  private updateItemSubtotal(itemForm: FormGroup): void {
    const quantity = itemForm.get('quantity')?.value || 0;
    const price = itemForm.get('price')?.value || 0;
    const subtotal = quantity * price;
    itemForm.patchValue({ subtotal }, { emitEvent: false });
    this.updateTotal();
  }

  private updateTotal(): void {
    const items = this.itemsFormArray.value;
    const total = items.reduce((sum: number, item: any) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);
    this.form.patchValue({ montoTotal: total }, { emitEvent: false });
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
      restaurantId: order.restaurantId,
      supplierId: order.supplierId,
      fechaPedido: this.formatInputDate(order.fechaPedido),
      fechaEntrega: order.fechaEntrega ? this.formatInputDate(order.fechaEntrega) : null,
      status: order.status,
      notas: order.notas || ''
    });

    this.itemsFormArray.clear();
    order.items.forEach(item => {
      const itemForm = this.fb.group({
        ingredientId: [item.ingredientId, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
        unitId: [item.unitId, Validators.required],
        price: [item.price, [Validators.required, Validators.min(0)]]
      });
      
      const priceQtySub = itemForm.valueChanges.subscribe(() => {
        this.updateItemSubtotal(itemForm);
      });
      this.subscriptions.push(priceQtySub);
      
      this.itemsFormArray.push(itemForm);
    });
    this.updateTotal();
  }

  private formatInputDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
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
    const restaurant = this.restaurants.find(r => r.id === value.restaurantId);
    const supplier = this.suppliers.find(s => s.id === value.supplierId);

    const items: PurchaseItem[] = value.items.map((item: any, index: number) => {
      const ingredient = this.ingredients.find(i => i.id === item.ingredientId);
      const unit = this.units.find(u => u.id === item.unitId);
      return {
        id: this.currentOrder?.items[index]?.id || `pi-${Date.now()}-${index}`,
        purchaseItemId: this.currentOrder?.items[index]?.purchaseItemId || `pi-${Date.now()}-${index}`,
        orderId: this.currentOrder?.orderId || '',
        ingredientId: item.ingredientId,
        ingredientName: ingredient?.name || '',
        quantity: Number(item.quantity),
        unitId: item.unitId,
        unitCode: unit?.code || '',
        price: Number(item.price),
        subtotal: Number(item.quantity) * Number(item.price)
      };
    });

    const payload: Omit<PurchaseOrder, 'id' | 'orderId' | 'fechaCreacion' | 'fechaActualizacion'> = {
      restaurantId: value.restaurantId,
      restaurantName: restaurant?.name || '',
      supplierId: value.supplierId,
      supplierName: supplier?.name || '',
      fechaPedido: new Date(value.fechaPedido),
      fechaEntrega: value.fechaEntrega ? new Date(value.fechaEntrega) : null,
      montoTotal: items.reduce((sum, item) => sum + item.subtotal, 0),
      status: value.status,
      items,
      notas: value.notas?.trim() || undefined
    };

    if (this.isEditMode && this.currentOrder) {
      this.purchaseService.update(this.currentOrder.id, payload);
    } else {
      this.purchaseService.create(payload);
    }

    this.router.navigate(['/compras']);
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
}

