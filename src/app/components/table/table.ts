import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrls: ['./table.css']
})
export class TableComponent {
  @Input() columns: string[] = [];
  @Input() data: any[] = [];

  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<{ data: any, index: number }>();

  onDelete(index: number) {
    this.delete.emit(index);
  }

  onEdit(data: any, index: number) {
    this.edit.emit({ data, index });
  }
}
