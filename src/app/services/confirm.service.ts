import { Injectable, createComponent, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const componentRef = createComponent(ConfirmDialogComponent, {
          environmentInjector: this.injector
        });

        if (!componentRef) {
          console.error('Failed to create confirm dialog');
          // No usar confirm nativo, rechazar la promesa
          resolve(false);
          return;
        }

        const instance = componentRef.instance;
        instance.title = options.title || 'Confirmar acción';
        instance.message = options.message;
        instance.confirmText = options.confirmText || 'Confirmar';
        instance.cancelText = options.cancelText || 'Cancelar';
        instance.type = options.type || 'warning';

        let resolved = false;

        instance.confirmed.subscribe(() => {
          if (!resolved) {
            resolved = true;
            resolve(true);
            this.remove(componentRef);
          }
        });

        instance.cancelled.subscribe(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
            this.remove(componentRef);
          }
        });

        this.appRef.attachView(componentRef.hostView);
        const element = componentRef.location.nativeElement;
        document.body.appendChild(element);
        
        // Forzar detección de cambios
        this.appRef.tick();
        
        setTimeout(() => {
          instance.show();
          this.appRef.tick();
        }, 50);
      } catch (error) {
        console.error('Error creating confirm dialog:', error);
        // No usar confirm nativo, rechazar la promesa
        resolve(false);
      }
    });
  }

  private remove(componentRef: any): void {
    if (!componentRef) return;
    
    const element = componentRef.location.nativeElement;
    if (componentRef.instance) {
      componentRef.instance.hide();
    }
    
    setTimeout(() => {
      try {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        console.error('Error removing confirm dialog:', error);
      }
    }, 300);
  }
}

