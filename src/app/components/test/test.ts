import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../form/form';
import { TableComponent } from '../table/table';
import { FormField } from '../form/form-field.model';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, FormComponent, TableComponent],
  templateUrl: './test.html',
  styleUrls: ['./test.css']
})
export class TestComponent {
  formFields: FormField[] = [
    { type: 'text', label: 'Nombre', name: 'nombre', required: true, placeholder: 'Ingresa tu nombre' },
    { type: 'email', label: 'Correo', name: 'email', required: true, placeholder: 'Ingresa tu correo' },
    { type: 'text', label: 'Celular', name: 'celular', required: true, placeholder: 'Ingresa tu número' },
    {
      type: 'select', label: 'País', name: 'pais',
      options: [
        { label: 'Colombia', value: 'co' },
        { label: 'México', value: 'mx' },
        { label: 'Argentina', value: 'ar' }
      ]
    }
  ];

  columns = ['nombre', 'correo', 'celular', 'pais'];
  data = [
    { nombre: 'Sebas', correo: 'sebas@mail.com', celular: '3001234567', pais: 'Colombia' },
    { nombre: 'Ana', correo: 'ana@mail.com', celular: '3129876543', pais: 'México' },
  ];

  onFormSubmit(event: any) {
    const { data, index } = event;

    if (index !== null && index !== undefined) {
      this.data[index] = data; // ✅ Editar existente
    } else {
      this.data.push(data); // ✅ Agregar nuevo
    }
  }

  onDelete(index: number) {
    this.data.splice(index, 1);
  }

  onEdit(event: any) {
    const { data, index } = event;
    const form = document.querySelector('app-form') as any;
    form?.loadDataForEdit(data, index);
  }
}
