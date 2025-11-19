import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <h2>🍳 Recetario</h2>
        </div>
        
        <div class="navbar-menu" *ngIf="isAuthenticated">
          <div class="navbar-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              🏠 Inicio
            </a>
            
            <a routerLink="/formulario" routerLinkActive="active" 
               *ngIf="canAccessFormulario">
              📝 Formulario
            </a>
            
            <a routerLink="/inventario/admin" routerLinkActive="active"
               *ngIf="canAccessInventario">
              📦 Inventario
            </a>
            
            <a routerLink="/users" routerLinkActive="active"
               *ngIf="canAccessUsers">
              👥 Usuarios
            </a>
          </div>
          
          <div class="navbar-user">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.nombre }}</span>
              <span class="user-role">{{ currentUser?.rol }}</span>
            </div>
            <button class="logout-btn" (click)="logout()">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #AD1457 0%, #E91E63 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .navbar-nav {
      display: flex;
      gap: 1.5rem;
    }

    .navbar-nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .navbar-nav a:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }

    .navbar-nav a.active {
      background: rgba(255,255,255,0.2);
      font-weight: 600;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.9rem;
    }

    .user-name {
      font-weight: 600;
    }

    .user-role {
      opacity: 0.8;
      font-size: 0.8rem;
    }

    .logout-btn {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-menu {
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-nav {
        flex-wrap: wrap;
        justify-content: center;
      }

      .navbar-user {
        flex-direction: column;
        gap: 0.5rem;
      }

      .user-info {
        align-items: center;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.isAuthenticated = state.isAuthenticated;
      this.currentUser = state.user;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  get canAccessFormulario(): boolean {
    return this.authService.hasAnyRole(['Administrador', 'Chef']);
  }

  get canAccessInventario(): boolean {
    return this.authService.hasRole('Administrador');
  }

  get canAccessUsers(): boolean {
    return this.authService.hasRole('Administrador');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
