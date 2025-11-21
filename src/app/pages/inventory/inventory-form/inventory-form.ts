import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';
import { NotificationService } from '../../../services/notification.service';
import {
  InventoryIngredient,
  InventoryItem,
  InventoryItemDisplay,
  InventoryRestaurant,
  InventoryUnit,
  InventorySupplier
} from '../../../models/inventory.model';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
  suppliers: InventorySupplier[] = [];
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
    this.ingredients = this.inventoryService.getIngredients();
    this.units = this.inventoryService.getUnits();
    this.suppliers = this.inventoryService.getSuppliers();
    this.categories = this.inventoryService.getCategories();
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
      ingredient_name: ['', Validators.required],
      ingredient_id: [''],
      unit_id: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      supplier_id: ['', Validators.required],
      reorder_level: [10, [Validators.min(0)]]
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
          ingredient_name: item.ingredientName || '',
          ingredient_id: item.ingredient_id,
          unit_id: item.unit_id,
          quantity: item.quantity,
          category: item.category || '',
          supplier_id: item.supplier_id || '',
          reorder_level: item.reorder_level || 10
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
          ingredient_name: localItem.ingredientName || '',
          ingredient_id: localItem.ingredient_id,
          unit_id: localItem.unit_id,
          quantity: localItem.quantity,
          category: localItem.category || '',
          supplier_id: localItem.supplier_id || '',
          reorder_level: localItem.reorder_level || 10
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
      // Actualizar item completo
      const itemId = this.currentItem.id;
      const quantity = Number(value.quantity);
      
      // Actualizar localmente primero (para respuesta inmediata)
      const items = this.inventoryService.getAllSync();
      const baseItem = items.find(i => i.id === itemId);
      if (baseItem) {
        const updatedItem: InventoryItem = {
          id: baseItem.id,
          restaurant_id: baseItem.restaurant_id,
          ingredient_id: baseItem.ingredient_id,
          unit_id: value.unit_id || baseItem.unit_id,
          quantity,
          category: value.category,
          supplier_id: value.supplier_id,
          reorder_level: value.reorder_level ? Number(value.reorder_level) : 10,
          updatedAt: new Date()
        };
        
        // Actualizar en el BehaviorSubject del servicio
        const allItems = this.inventoryService['inventorySubject'].value;
        const itemIndex = allItems.findIndex((i: InventoryItem) => i.id === itemId);
        if (itemIndex !== -1) {
          const updated = [...allItems];
          updated[itemIndex] = updatedItem;
          this.inventoryService['inventorySubject'].next(updated);
          this.inventoryService['persist']();
        }
      }
      
      // Luego intentar actualizar en el backend (solo cantidad según API)
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
      // Buscar o crear ingrediente basado en el nombre
      let ingredient_id = value.ingredient_id;
      if (!ingredient_id && value.ingredient_name) {
        const existingIngredient = this.ingredients.find(
          ing => ing.name.toLowerCase() === value.ingredient_name.toLowerCase()
        );
        if (existingIngredient) {
          ingredient_id = existingIngredient.id;
        } else {
          // Crear nuevo ingrediente temporal
          ingredient_id = 'ing-' + Date.now();
        }
      }

      const payload: Omit<InventoryItem, 'id'> = {
        restaurant_id: value.restaurant_id || this.restaurants[0]?.id,
        ingredient_id: ingredient_id,
        unit_id: value.unit_id,
        quantity: Number(value.quantity),
        category: value.category,
        supplier_id: value.supplier_id,
        reorder_level: value.reorder_level ? Number(value.reorder_level) : 10,
        updatedAt: new Date()
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
