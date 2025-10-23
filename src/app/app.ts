import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  showSidebar = false;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.updateSidebarVisibility();
    });

    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebarVisibility();
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private updateSidebarVisibility(): void {
    const currentUrl = this.router.url;
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Mostrar sidebar solo si está autenticado y no está en login
    this.showSidebar = isAuthenticated && !currentUrl.includes('/login');
  }
}
