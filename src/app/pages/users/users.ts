import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../components/form/form';
import { TableComponent } from '../../components/table/table';
import { FormField } from '../../components/form/form-field.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormComponent, TableComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users {
  // ✅ Campos del formulario
  userFields: FormField[] = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'email', label: 'Correo electrónico', required: true },
    { name: 'rol', label: 'Rol', required: true },
  ];

  // ✅ Datos iniciales simulados
  users = [
    { nombre: 'Administrador', email: 'admin@recetario.com', rol: 'Administrador' },
    { nombre: 'Chef Juan', email: 'chef@recetario.com', rol: 'Chef' }
  ];

  // ✅ Columnas de la tabla
  userColumns = ['nombre', 'email', 'rol'];

  // ✅ Acción al enviar el formulario
  onSubmit(userData: any) {
    console.log('Nuevo usuario:', userData);
    this.users.push(userData);
  }
}
