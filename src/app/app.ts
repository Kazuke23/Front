import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormComponent } from './components/form/form'; // ✅ formulario
import { TableComponent } from './components/table/table'; // ✅ tabla
import { FormField } from './components/form/form-field.model'; // ✅ modelo del form

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormComponent, TableComponent], // ✅ todos los componentes
  templateUrl: './app.html',
})
export class App {
  // Campos del formulario dinámico
  formFields: FormField[] = [
    { type: 'text', label: 'Nombre', name: 'nombre', required: true, placeholder: 'Ingresa tu nombre' },
    { type: 'email', label: 'Correo', name: 'email', required: true, placeholder: 'Ingresa tu correo' },
    { type: 'text', label: 'Celular', name: 'celular', required: true, placeholder: 'Ingresa tu número' },
    {
      type: 'select',
      label: 'País',
      name: 'pais',
      options: [
        { label: 'Colombia', value: 'co' },
        { label: 'México', value: 'mx' },
        { label: 'Argentina', value: 'ar' },
      ],
    },
  ];

  // Columnas de la tabla
  columns = ['nombre', 'correo', 'celular', 'pais'];

  // Datos de ejemplo (podrán venir del backend después)
  data = [
    { nombre: 'Sebas', correo: 'sebas@mail.com', celular: '3001234567', pais: 'Colombia' },
    { nombre: 'Ana', correo: 'ana@mail.com', celular: '3129876543', pais: 'México' },
  ];

  // Captura el envío del formulario
  onFormSubmit(values: any) {
    console.log('Datos del formulario:', values);
    this.data.push(values); // ✅ Agrega los datos a la tabla temporalmente
  }
}