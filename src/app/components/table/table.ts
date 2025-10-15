import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class TableComponent {
  // Columnas que se mostrarán en la tabla
  @Input() columns: string[] = [];

  // Datos que se renderizarán en filas
  @Input() data: any[] = [];
}
