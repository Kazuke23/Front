import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProveedorService } from '../../../services/proveedor.service';
import { Proveedor, TIPOS_PRODUCTO } from '../../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proveedor-create.html',
  styleUrl: './proveedor-create.css'
})
export class ProveedorCreateComponent implements OnInit, OnDestroy {
  
  isEditing = false;
  proveedorId: string | null = null;
  tiposProducto = TIPOS_PRODUCTO;
  
  formData = {
    nombre: '',
    contacto: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoProducto: '',
    activo: 'true',
    notas: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos editando
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proveedorId = id;
      this.loadProveedorForEdit(id);
      this.isEditing = true;
    }
  }

  ngOnDestroy(): void {
  }

  loadProveedorForEdit(id: string): void {
    const proveedor = this.proveedorService.getProveedorById(id);
    if (proveedor) {
      this.formData = {
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        email: proveedor.email,
        telefono: proveedor.telefono,
        direccion: proveedor.direccion,
        tipoProducto: proveedor.tipoProducto,
        activo: proveedor.activo.toString(),
        notas: proveedor.notas || ''
      };
    }
  }

  onSubmit(): void {
    // Validar campos requeridos
    if (!this.formData.nombre || !this.formData.contacto || !this.formData.email || 
        !this.formData.telefono || !this.formData.direccion || !this.formData.tipoProducto) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    if (this.isEditing && this.proveedorId) {
      // Actualizar proveedor existente
      this.proveedorService.updateProveedor(this.proveedorId, {
        nombre: this.formData.nombre,
        contacto: this.formData.contacto,
        email: this.formData.email,
        telefono: this.formData.telefono,
        direccion: this.formData.direccion,
        tipoProducto: this.formData.tipoProducto,
        activo: this.formData.activo === 'true',
        notas: this.formData.notas || undefined
      });
    } else {
      // Crear nuevo proveedor
      const newProveedor: Proveedor = {
        id: Date.now().toString(),
        nombre: this.formData.nombre,
        contacto: this.formData.contacto,
        email: this.formData.email,
        telefono: this.formData.telefono,
        direccion: this.formData.direccion,
        tipoProducto: this.formData.tipoProducto,
        activo: this.formData.activo === 'true',
        notas: this.formData.notas || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.proveedorService.addProveedor(newProveedor);
    }
    
    // Esperar un momento antes de navegar para asegurar que se guarde
    setTimeout(() => {
      this.router.navigate(['/proveedores']);
    }, 200);
  }

  onCancel(): void {
    this.router.navigate(['/proveedores']);
  }
}

