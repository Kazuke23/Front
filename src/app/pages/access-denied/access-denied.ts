import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <div class="error-icon">🚫</div>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Contacta con el administrador si crees que esto es un error.</p>
        <div class="actions">
          <button routerLink="/" class="btn btn-primary">
            Ir al Inicio
          </button>
          <button routerLink="/login" class="btn btn-secondary">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .access-denied-content {
      background: white;
      border-radius: 15px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    h1 {
      color: #e74c3c;
      margin-bottom: 20px;
      font-size: 2rem;
    }

    p {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .actions {
      margin-top: 30px;
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
      transform: translateY(-2px);
    }

    @media (max-width: 480px) {
      .access-denied-content {
        padding: 20px;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class AccessDeniedComponent {}
