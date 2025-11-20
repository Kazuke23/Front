import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: NotificationType = 'info';
  @Input() duration: number = 4000;

  visible: boolean = false;
  private timeoutId?: number;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Mostrar inmediatamente después de que Angular haya renderizado
    setTimeout(() => {
      this.visible = true;
      this.cdr.detectChanges();
    }, 50);

    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  hide(): void {
    this.visible = false;
    this.cdr.detectChanges();
  }

  getIcon(): string {
    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}

