import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { InventoryItem, InventoryStatus } from '../../../models/inventory.model';

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

  unidades = ['kg', 'unidades', 'litros', 'cajas', 'bolsas', 'paquetes'];
  categorias = ['Vegetales', 'Carnes', 'Básicos', 'Aceites', 'Lácteos', 'Especias', 'Bebidas'];
  estados: InventoryStatus[] = ['Disponible', 'Crítico', 'Agotado'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService
  ) {}

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
      unidad: ['kg', Validators.required],
      categoria: ['', Validators.required],
      proveedor: ['', Validators.required],
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
    const estadoSub = this.form.get('estado')?.valueChanges.subscribe(() => {
      if (this.form.touched) {
        this.statusManuallyEdited = true;
      }
    });

    [cantidadSub, reordenSub, estadoSub].forEach(sub => sub && this.subscriptions.push(sub));
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
    return {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion?.trim(),
      cantidad: Number(value.cantidad),
      unidad: value.unidad,
      categoria: value.categoria,
      proveedor: value.proveedor,
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

  getFieldClass(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return control.invalid && control.touched ? 'invalid' : '';
  }
}

