import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css']
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Está seguro de realizar esta acción?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<void>();

  visible: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  show(): void {
    this.visible = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.detectChanges();
  }

  hide(): void {
    this.visible = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.cdr.detectChanges();
  }

  confirm(): void {
    this.confirmed.emit(true);
    this.hide();
  }

  cancel(): void {
    this.cancelled.emit();
    this.hide();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.cancel();
    }
  }
}

