import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import {
  InventoryIngredient,
  InventoryItem,
  InventoryRestaurant,
  InventoryStatus,
  InventorySupplier,
  InventoryUnit
} from '../../../models/inventory.model';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.html',
  styleUrls: ['./inventory-form.css']
})
export class InventoryFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  currentItem?: InventoryItem;
  pageTitle = 'Nuevo registro de inventario';
  ctaLabel = 'Guardar inventario';
  private subscriptions: Subscription[] = [];
  private statusManuallyEdited = false;

  categorias = ['Vegetales', 'Carnes', 'Básicos', 'Aceites', 'Lácteos', 'Especias', 'Bebidas'];
  estados: InventoryStatus[] = ['Disponible', 'Crítico', 'Agotado'];
  restaurants: InventoryRestaurant[] = [];
  ingredients: InventoryIngredient[] = [];
  units: InventoryUnit[] = [];
  suppliers: InventorySupplier[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService
  ) {
    this.restaurants = this.inventoryService.getRestaurants();
    this.ingredients = this.inventoryService.getIngredients();
    this.units = this.inventoryService.getUnits();
    this.suppliers = this.inventoryService.getSuppliers();
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

    this.setupAutoStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      unidad: [this.units[0]?.code ?? 'kg', Validators.required],
      unitId: [this.units[0]?.id ?? '', Validators.required],
      inventoryId: [''],
      categoria: ['', Validators.required],
      restaurantId: [this.restaurants[0]?.id ?? '', Validators.required],
      ingredientId: [this.ingredients[0]?.id ?? '', Validators.required],
      supplierId: [this.suppliers[0]?.id ?? '', Validators.required],
      nivelReorden: [5, [Validators.required, Validators.min(0)]],
      costoUnitario: [null, [Validators.min(0)]],
      estado: ['Disponible', Validators.required],
      fechaExpiracion: [null],
      lote: [''],
      notas: [''],
      imagen: ['']
    });
  }

  private loadItem(id: string): void {
    const item = this.inventoryService.getById(id);
    if (!item) {
      alert('No se encontró el registro solicitado.');
      this.router.navigate(['/inventario/admin']);
      return;
    }
    this.currentItem = item;
    this.form.patchValue({
      ...item,
      fechaExpiracion: item.fechaExpiracion ? this.formatInputDate(item.fechaExpiracion) : null
    });
  }

  private formatInputDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  private setupAutoStatus(): void {
    const cantidadSub = this.form.get('cantidad')?.valueChanges.subscribe(() => this.syncStatus());
    const reordenSub = this.form.get('nivelReorden')?.valueChanges.subscribe(() => this.syncStatus());
    const unitSub = this.form.get('unitId')?.valueChanges.subscribe(value => {
      const unit = this.units.find(u => u.id === value);
      if (unit) {
        this.form.get('unidad')?.setValue(unit.code, { emitEvent: false });
      }
    });
    const ingredientSub = this.form.get('ingredientId')?.valueChanges.subscribe(value => {
      const ingredient = this.ingredients.find(i => i.id === value);
      const nombreControl = this.form.get('nombre');
      if (ingredient && nombreControl && (!nombreControl.dirty || !nombreControl.value)) {
        nombreControl.setValue(ingredient.name);
      }
      this.syncInventoryCode();
    });
    const restaurantSub = this.form.get('restaurantId')?.valueChanges.subscribe(() => {
      this.syncInventoryCode();
    });
    const estadoSub = this.form.get('estado')?.valueChanges.subscribe(() => {
      if (this.form.touched) {
        this.statusManuallyEdited = true;
      }
    });

    [cantidadSub, reordenSub, estadoSub, unitSub, ingredientSub, restaurantSub].forEach(sub => sub && this.subscriptions.push(sub));
    this.syncInventoryCode();
  }

  private syncStatus(): void {
    if (this.statusManuallyEdited) return;
    const cantidad = this.form.get('cantidad')?.value;
    const nivel = this.form.get('nivelReorden')?.value;
    if (cantidad === null || nivel === null) return;
    const estado = this.inventoryService.inferStatus(Number(cantidad), Number(nivel));
    this.form.get('estado')?.setValue(estado, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toInventoryPayload();

    if (this.isEditMode && this.currentItem) {
      this.inventoryService.update(this.currentItem.id, payload);
    } else {
      this.inventoryService.create(payload);
    }

    this.router.navigate(['/inventario/admin']);
  }

  cancel(): void {
    this.router.navigate(['/inventario/admin']);
  }

  private toInventoryPayload(): Omit<InventoryItem, 'id' | 'fechaCreacion' | 'fechaActualizacion'> {
    const value = this.form.value;
    const restaurant = this.restaurants.find(r => r.id === value.restaurantId);
    const ingredient = this.ingredients.find(i => i.id === value.ingredientId);
    const unit = this.units.find(u => u.id === value.unitId);
    const supplier = this.suppliers.find(s => s.id === value.supplierId);
    const inventoryId = value.inventoryId?.trim() || this.currentItem?.inventoryId || this.generateInventoryCode(restaurant?.id, ingredient?.id);

    return {
      inventoryId,
      nombre: value.nombre.trim() || ingredient?.name || '',
      descripcion: value.descripcion?.trim(),
      cantidad: Number(value.cantidad),
      unidad: unit?.code ?? value.unidad,
      unitId: unit?.id ?? value.unitId,
      unitCode: unit?.code ?? value.unidad,
      categoria: value.categoria,
      proveedor: supplier?.name ?? '',
      supplierId: supplier?.id ?? '',
      restaurantId: restaurant?.id ?? '',
      restaurantName: restaurant?.name ?? '',
      ingredientId: ingredient?.id ?? '',
      ingredientName: ingredient?.name ?? value.nombre,
      nivelReorden: Number(value.nivelReorden),
      costoUnitario: value.costoUnitario !== null && value.costoUnitario !== undefined
        ? Number(value.costoUnitario)
        : undefined,
      estado: value.estado,
      fechaExpiracion: value.fechaExpiracion ? new Date(value.fechaExpiracion) : null,
      lote: value.lote?.trim(),
      notas: value.notas?.trim(),
      imagen: value.imagen?.trim() || undefined
    };
  }

  private syncInventoryCode(): void {
    if (this.isEditMode) {
      return;
    }
    const control = this.form.get('inventoryId');
    if (!control || control.dirty) {
      return;
    }
    const restaurantId = this.form.get('restaurantId')?.value;
    const ingredientId = this.form.get('ingredientId')?.value;
    control.setValue(this.generateInventoryCode(restaurantId, ingredientId), { emitEvent: false });
  }

  private generateInventoryCode(restaurantId?: string, ingredientId?: string): string {
    const restSegment = restaurantId ? restaurantId.split('-').slice(-1)[0] : 'rest';
    const ingredientSegment = ingredientId ? ingredientId.split('-').slice(-1)[0] : 'ing';
    return `inv-${restSegment}-${ingredientSegment}-${Date.now()}`;
  }

  getFieldClass(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return control.invalid && control.touched ? 'invalid' : '';
  }
}

