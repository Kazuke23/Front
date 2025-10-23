import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📅 Planificación</h1>
        <p>Gestiona la planificación de menús y eventos</p>
      </div>
      
      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <h3>🗓️ Calendario de Menús</h3>
          </div>
          <div class="card-content">
            <p>Planifica los menús semanales y mensuales</p>
            <button class="btn btn-primary">Ver Calendario</button>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>📋 Lista de Eventos</h3>
          </div>
          <div class="card-content">
            <p>Gestiona eventos especiales y celebraciones</p>
            <button class="btn btn-primary">Gestionar Eventos</button>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>📊 Estadísticas</h3>
          </div>
          <div class="card-content">
            <p>Analiza el rendimiento de la planificación</p>
            <button class="btn btn-primary">Ver Estadísticas</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-header h1 {
      color: #4caf50;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
      padding: 20px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .card-content {
      padding: 24px;
    }

    .card-content p {
      color: #666;
      margin-bottom: 16px;
      line-height: 1.6;
    }
  `]
})
export class PlanificacionComponent {}
