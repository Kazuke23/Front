import { Injectable, createComponent, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { NotificationComponent, NotificationType } from '../components/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private container?: HTMLElement;
  private notifications: any[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {
    if (typeof document !== 'undefined') {
      this.createContainer();
    }
  }

  private createContainer(): void {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    this.container.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 10000; pointer-events: none;';
    document.body.appendChild(this.container);
  }

  show(message: string, type: NotificationType = 'info', duration: number = 4000): void {
    if (typeof document === 'undefined') {
      console.warn('Notifications not available in SSR');
      return;
    }

    // Asegurar que el contenedor existe
    if (!this.container) {
      this.createContainer();
    }

    if (!this.container) {
      console.error('Failed to create notification container');
      return;
    }

    try {
      const componentRef = createComponent(NotificationComponent, {
        environmentInjector: this.injector
      });
      
      if (!componentRef) {
        console.error('Failed to create notification component');
        return;
      }

      // Configurar propiedades
      componentRef.instance.message = message;
      componentRef.instance.type = type;
      componentRef.instance.duration = duration;

      // Adjuntar al DOM primero
      this.appRef.attachView(componentRef.hostView);
      const element = componentRef.location.nativeElement;
      
      if (!element) {
        console.error('Component element is null');
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        return;
      }

      // Agregar al contenedor
      element.style.pointerEvents = 'auto';
      this.container.appendChild(element);

      // Guardar referencia
      this.notifications.push(componentRef);

      // Forzar detección de cambios
      this.appRef.tick();

      // Mostrar la notificación después de un pequeño delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (componentRef.instance) {
            componentRef.instance.visible = true;
            this.appRef.tick();
          }
        });
      });

      // Auto-remover después de la duración
      if (duration > 0) {
        setTimeout(() => {
          this.remove(componentRef);
        }, duration);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      // NO usar alert - solo loggear
    }
  }

  private remove(componentRef: any): void {
    if (!componentRef) return;

    const element = componentRef.location.nativeElement;
    
    // Ocultar primero
    if (componentRef.instance) {
      componentRef.instance.visible = false;
      this.appRef.tick();
    }
    
    // Remover del array
    const index = this.notifications.indexOf(componentRef);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
    
    // Remover del DOM después de la animación
    setTimeout(() => {
      try {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        console.error('Error removing notification:', error);
      }
    }, 400);
  }

  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }
}

