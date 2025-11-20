import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: string[];
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.collapsed]="isCollapsed">
      <!-- Header del Sidebar -->
      <div class="sidebar-header">
        <div class="logo" (click)="toggleSidebar()">
          <div class="logo-icon">🍳</div>
          <span class="logo-text" *ngIf="!isCollapsed">Recetario</span>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()" *ngIf="!isCollapsed">
          <span class="toggle-icon">←</span>
        </button>
      </div>

      <!-- Navegación Principal -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-title" *ngIf="!isCollapsed">Menú Principal</div>
          
          <div class="nav-items">
            <a 
              *ngFor="let item of visibleItems" 
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: item.route === '/'}"
              class="nav-item"
              [class.collapsed]="isCollapsed"
              [title]="isCollapsed ? item.label : ''"
            >
              <div class="nav-icon">{{ item.icon }}</div>
              <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
              <div class="nav-indicator" *ngIf="!isCollapsed"></div>
            </a>
          </div>
        </div>
      </nav>

      <!-- Información del Usuario -->
      <div class="sidebar-footer">
        <div class="user-info" *ngIf="!isCollapsed && currentUser">
          <div class="user-avatar">
            <span class="avatar-text">{{ getInitials(currentUser.nombre || currentUser.full_name) }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.nombre }}</div>
            <div class="user-role">{{ currentUser.rol }}</div>
          </div>
        </div>
        
        <button class="logout-btn" (click)="logout()" [class.collapsed]="isCollapsed">
          <div class="logout-icon">🚪</div>
          <span class="logout-text" *ngIf="!isCollapsed">Cerrar Sesión</span>
        </button>
      </div>

      <!-- Botón de expansión cuando está colapsado -->
      <button class="expand-btn" (click)="toggleSidebar()" *ngIf="isCollapsed">
        <span class="expand-icon">→</span>
      </button>
    </div>

    <!-- Overlay para móviles -->
    <div class="sidebar-overlay" *ngIf="isMobile && !isCollapsed" (click)="closeSidebar()"></div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fffe 100%);
      border-right: 1px solid #e8f5e8;
      box-shadow: 2px 0 20px rgba(0,0,0,0.08);
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #e8f5e8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
      color: white;
      position: relative;
      overflow: hidden;
    }

    .sidebar-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
      pointer-events: none;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .logo-icon {
      font-size: 28px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .toggle-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 8px;
      padding: 8px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .toggle-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }

    .toggle-icon {
      font-size: 16px;
      font-weight: bold;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-section {
      padding: 0 20px;
    }

    .nav-title {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      padding-left: 4px;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      text-decoration: none;
      color: #555;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #FF4081 0%, #F06292 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .nav-item:hover::before {
      opacity: 0.1;
    }

    .nav-item:hover {
      color: #FF4081;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(255,64,129,0.2);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(233,30,99,0.3);
    }

    .nav-item.active::before {
      opacity: 0;
    }

    .nav-item.collapsed {
      justify-content: center;
      padding: 12px;
    }

    .nav-icon {
      font-size: 20px;
      min-width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-label {
      font-size: 14px;
      white-space: nowrap;
    }

    .nav-indicator {
      width: 4px;
      height: 4px;
      background: #E91E63;
      border-radius: 50%;
      margin-left: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .nav-item.active .nav-indicator {
      opacity: 1;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid #e8f5e8;
      background: linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: linear-gradient(135deg, #F8BBD0 0%, #F5F5F5 100%);
      border-radius: 12px;
      border: 1px solid #F8BBD0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 2px;
    }

    .user-role {
      font-size: 12px;
      color: #9E9E9E;
      background: rgba(233,30,99,0.1);
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(255,87,34,0.2);
    }

    .logout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(255,87,34,0.3);
    }

    .logout-btn.collapsed {
      justify-content: center;
      padding: 12px;
    }

    .logout-icon {
      font-size: 18px;
    }

    .logout-text {
      font-size: 14px;
    }

    .expand-btn {
      position: absolute;
      top: 50%;
      right: -15px;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(233,30,99,0.3);
      transition: all 0.3s ease;
    }

    .expand-btn:hover {
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(233,30,99,0.4);
    }

    .expand-icon {
      font-size: 14px;
      font-weight: bold;
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px;
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        transform: translateX(-100%);
        width: 280px;
      }

      .expand-btn {
        display: none;
      }
    }

    /* Animaciones */
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-100%);
      }
    }

    /* Scrollbar personalizado */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: #F8BBD0;
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: #E91E63;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobile = false;
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  // Items del sidebar según roles
  sidebarItems: SidebarItem[] = [
    {
      id: 'recetas',
      label: 'Recetas',
      icon: '📖',
      route: '/recetas',
      roles: ['Administrador', 'Chef']
    },
    {
      id: 'ingredientes',
      label: 'Ingredientes',
      icon: '🥬', // puedes cambiarlo por otro emoji si quieres
      route: '/ingredientes',
      roles: ['Administrador', 'Chef'] // mismos roles que recetas
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: '📦',
      route: '/inventario/admin',
      roles: ['Administrador', 'Chef']
    },
    {
      id: 'planificacion',
      label: 'Planificación',
      icon: '📅',
      route: '/planificacion',
      roles: ['Administrador', 'Chef']
    },
    {
      id: 'menu',
      label: 'Menús',
      icon: '🍽️',
      route: '/menu',
      roles: ['Administrador', 'Chef']
    },
    {
      id: 'restaurantes',
      label: 'Restaurantes',
      icon: '🏪',
      route: '/restaurantes',
      roles: ['Administrador']
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: '🚚',
      route: '/proveedores',
      roles: ['Administrador']
    },
    {
      id: 'compras',
      label: 'Compras',
      icon: '🛒',
      route: '/compras',
      roles: ['Administrador']
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.currentUser = state.user;
    });

    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  get visibleItems(): SidebarItem[] {
    if (!this.currentUser) return [];
    
    const userRole = (this.currentUser as any).rol || (this.currentUser as any).role;
    if (!userRole) return [];
    
    return this.sidebarItems
      .filter(item => item.roles.includes(userRole))
      .map(item => {
        // Ajustar ruta de inventario según el rol
        if (item.id === 'inventario') {
          if (userRole === 'Chef') {
            return { ...item, route: '/inventario/chef' };
          } else if (userRole === 'Administrador') {
            return { ...item, route: '/inventario/admin' };
          }
        }
        return item;
      });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
