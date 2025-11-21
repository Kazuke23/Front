import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../../../services/purchase.service';
import { NotificationService } from '../../../services/notification.service';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
    private purchaseService: PurchaseService,
    private notificationService: NotificationService
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
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      name: ['', Validators.required],
      order_date: [today, Validators.required],
      total_amount: ['', [Validators.required, Validators.min(0.01)]],
      restaurant_id: [this.restaurants.length > 0 ? this.restaurants[0].id : '', Validators.required],
      supplier_id: [this.suppliers.length > 0 ? this.suppliers[0].id : '', Validators.required],
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
    this.purchaseService.getById(id).subscribe({
      next: (order) => {
        if (!order) {
          this.notificationService.warning('No se encontró la orden solicitada.');
          setTimeout(() => this.router.navigate(['/compras']), 1500);
          return;
        }
        this.currentOrder = order;
        const orderDate = order.orderDate || order.order_date;
        const dateValue = orderDate instanceof Date 
          ? orderDate.toISOString().split('T')[0] 
          : orderDate 
            ? (typeof orderDate === 'string' ? orderDate.split('T')[0] : orderDate)
            : new Date().toISOString().split('T')[0];
        
        this.form.patchValue({
          name: order.name || '',
          order_date: dateValue,
          total_amount: order.totalAmount || order.total_amount || 0,
          restaurant_id: order.restaurant_id,
          supplier_id: order.supplier_id,
          status: order.status
        });

        this.itemsFormArray.clear();
        order.items.forEach((item: any) => {
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
      },
      error: () => {
        // Si falla, intentar con datos locales
        const localOrder = this.purchaseService.getByIdSync(id);
        if (!localOrder) {
          this.notificationService.warning('No se encontró la orden solicitada.');
          setTimeout(() => this.router.navigate(['/compras']), 1500);
          return;
        }
        this.currentOrder = localOrder;
        const orderDate = localOrder.orderDate || localOrder.order_date;
        const dateValue = orderDate instanceof Date 
          ? orderDate.toISOString().split('T')[0] 
          : orderDate 
            ? (typeof orderDate === 'string' ? orderDate.split('T')[0] : orderDate)
            : new Date().toISOString().split('T')[0];
        
        this.form.patchValue({
          name: localOrder.name || '',
          order_date: dateValue,
          total_amount: localOrder.totalAmount || localOrder.total_amount || 0,
          restaurant_id: localOrder.restaurant_id,
          supplier_id: localOrder.supplier_id,
          status: localOrder.status
        });

        this.itemsFormArray.clear();
        localOrder.items.forEach((item: any) => {
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
    });
  }

  submit(): void {
    // Validar campos requeridos manualmente
    if (!this.form.get('name')?.value || !this.form.get('order_date')?.value || 
        !this.form.get('total_amount')?.value || !this.form.get('restaurant_id')?.value || 
        !this.form.get('supplier_id')?.value) {
      this.form.markAllAsTouched();
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    // Si hay items, usarlos; si no, crear un array vacío
    const items: PurchaseItem[] = value.items && value.items.length > 0
      ? value.items.map((item: any) => ({
          ingredient_id: item.ingredient_id,
          quantity: Number(item.quantity),
          unit_id: item.unit_id,
          price: Number(item.price)
        }))
      : [];

    const payload: Omit<PurchaseOrder, 'id'> = {
      name: value.name || `Compra ${new Date().toLocaleDateString()}`,
      order_date: value.order_date || new Date().toISOString().split('T')[0],
      total_amount: value.total_amount && value.total_amount !== '' ? Number(value.total_amount) : 0,
      restaurant_id: value.restaurant_id,
      supplier_id: value.supplier_id,
      status: value.status || 'pending',
      items: items
    };

    if (this.isEditMode && this.currentOrder) {
      const orderId = this.currentOrder.id;
      this.purchaseService.update(orderId, payload).subscribe({
        next: () => {
          this.notificationService.success(`¡Orden #${orderId} actualizada exitosamente!`);
          setTimeout(() => this.router.navigate(['/compras']), 1500);
        },
        error: (error) => {
          console.error('Error al actualizar orden:', error);
          this.notificationService.error('No se pudo actualizar la orden. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.purchaseService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('¡Nueva orden de compra creada exitosamente!');
          setTimeout(() => this.router.navigate(['/compras']), 1500);
        },
        error: (error) => {
          console.error('Error al crear orden:', error);
          this.notificationService.error('No se pudo crear la orden. Por favor, intente nuevamente.');
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
