import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../components/table/table';

@Component({
  selector: 'app-tabla-page',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './tabla.html',
})
export class TablaPage {
  columns = ['nombre', 'correo', 'celular', 'pais'];
  data = [
    { nombre: 'Sebas', correo: 'sebas@mail.com', celular: '3001234567', pais: 'Colombia' },
    { nombre: 'Ana', correo: 'ana@mail.com', celular: '3129876543', pais: 'México' },
  ];
}
