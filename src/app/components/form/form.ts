import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormField } from './form-field.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css']
})
export class FormComponent {
  @Input() fields: FormField[] = [];
  @Output() formSubmit = new EventEmitter<{ data: any; index: number | null }>();

  formData: Record<string, any> = {};
  editingIndex: number | null = null;

  /** ✅ Enviar datos nuevos o editados */
  onSubmit(): void {
    // Evita enviar si el formulario está vacío
    if (Object.keys(this.formData).length === 0) return;

    // Emitir los datos al componente padre
    this.formSubmit.emit({
      data: { ...this.formData },
      index: this.editingIndex
    });

    // Reiniciar formulario
    this.resetForm();
  }

  /** ✅ Cargar datos en el formulario (modo edición) */
  loadDataForEdit(data: any, index: number): void {
    this.formData = { ...data };
    this.editingIndex = index;
  }

  /** 🔁 Reiniciar el formulario */
  resetForm(): void {
    this.formData = {};
    this.editingIndex = null;
  }
}
