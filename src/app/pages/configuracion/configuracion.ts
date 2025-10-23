import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>⚙️ Configuración</h1>
        <p>Configura los parámetros del sistema</p>
      </div>
      
      <div class="config-sections">
        <div class="config-section">
          <h2>🔧 Configuración General</h2>
          <div class="config-item">
            <label>Nombre del Restaurante</label>
            <input type="text" value="Recetario" class="form-control">
          </div>
          <div class="config-item">
            <label>Horario de Atención</label>
            <input type="text" value="8:00 AM - 10:00 PM" class="form-control">
          </div>
        </div>
        
        <div class="config-section">
          <h2>👥 Gestión de Usuarios</h2>
          <div class="config-item">
            <label>Permitir Registro de Nuevos Usuarios</label>
            <input type="checkbox" checked>
          </div>
          <div class="config-item">
            <label>Notificaciones por Email</label>
            <input type="checkbox" checked>
          </div>
        </div>
        
        <div class="config-section">
          <h2>🍽️ Configuración de Menús</h2>
          <div class="config-item">
            <label>Categorías Disponibles</label>
            <select class="form-control">
              <option>Desayuno</option>
              <option>Almuerzo</option>
              <option>Cena</option>
              <option>Postres</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="config-actions">
        <button class="btn btn-primary">💾 Guardar Cambios</button>
        <button class="btn btn-secondary">🔄 Restaurar Valores</button>
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

    .config-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 32px;
      margin-bottom: 40px;
    }

    .config-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .config-section h2 {
      color: #4caf50;
      margin-bottom: 20px;
      font-size: 1.3rem;
      border-bottom: 2px solid #e8f5e8;
      padding-bottom: 8px;
    }

    .config-item {
      margin-bottom: 20px;
    }

    .config-item label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #4caf50;
    }

    .config-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #4caf50;
    }

    .config-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 40px;
    }
  `]
})
export class ConfiguracionComponent {}
