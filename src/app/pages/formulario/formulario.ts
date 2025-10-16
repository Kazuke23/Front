import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../components/form/form';
import { FormField } from '../../components/form/form-field.model';

@Component({
  selector: 'app-formulario-page',
  standalone: true,
  imports: [CommonModule, FormComponent],
  templateUrl: './formulario.html',
})
export class FormularioPage {
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

  onFormSubmit(values: any) {
    console.log('Formulario enviado:', values);
  }
}
