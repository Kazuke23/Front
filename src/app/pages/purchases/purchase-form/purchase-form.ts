import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { NotificationService } from '../../../services/notification.service';
import { PurchaseOrder, PurchaseItem, PurchaseStatus } from '../../../models/purchase.model';
import { InventoryRestaurant, InventorySupplier } from '../../../models/inventory.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-form.html',
  styleUrls: ['./purchase-form.css']
})
export class PurchaseFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  restaurants: InventoryRestaurant[] = [];
  suppliers: InventorySupplier[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private notificationService: NotificationService
  ) {
    this.restaurants = this.purchaseService.getRestaurants();
    this.suppliers = this.purchaseService.getSuppliers();
  }

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadOrder(id);
    } else {
      // Establecer fecha por defecto a hoy
      const today = new Date().toISOString().split('T')[0];
      this.form.patchValue({ date: today });
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      date: ['', [Validators.required]],
      value: [0, [Validators.required, Validators.min(0.01)]],
      supplier_id: ['', [Validators.required]],
      restaurant_id: ['', [Validators.required]]
    });
  }

  private loadOrder(id: string): void {
    this.purchaseService.getById(id).subscribe({
      next: (order) => {
        if (order) {
          const orderDate = new Date().toISOString().split('T')[0];
          this.form.patchValue({
            name: `Compra ${order.id}`,
            date: orderDate,
            value: order.totalAmount || 0,
            supplier_id: order.supplier_id,
            restaurant_id: order.restaurant_id
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading order:', error);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      // Crear items básicos para la API (un item genérico con el valor total)
      const items: PurchaseItem[] = [{
        ingredient_id: 'default',
        quantity: 1,
        unit_id: 'default',
        price: formValue.value
      }];

      const payload: Omit<PurchaseOrder, 'id'> = {
        restaurant_id: formValue.restaurant_id,
        supplier_id: formValue.supplier_id,
        status: 'pending' as PurchaseStatus,
        items: items
      };

      if (this.isEditMode) {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.purchaseService.update(id, payload).subscribe({
            next: () => {
              this.loading = false;
              this.notificationService.success('¡Compra actualizada exitosamente!');
              setTimeout(() => this.router.navigate(['/compras']), 1500);
            },
            error: (error: any) => {
              console.error('Error updating purchase:', error);
              this.loading = false;
              this.notificationService.error('No se pudo actualizar la compra.');
            }
          });
        }
      } else {
        this.purchaseService.create(payload).subscribe({
          next: () => {
            this.loading = false;
            this.notificationService.success('¡Compra creada exitosamente!');
            setTimeout(() => this.router.navigate(['/compras']), 1500);
          },
          error: (error: any) => {
            console.error('Error creating purchase:', error);
            this.loading = false;
            this.notificationService.error('No se pudo crear la compra.');
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  goBack(): void {
    this.router.navigate(['/compras']);
  }

  cancel(): void {
    this.goBack();
  }

  getFieldClass(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.touched && field?.invalid) {
      return 'error';
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
