import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../components/form/form';
import { TableComponent } from '../../components/table/table';
import { FormField, FormOption } from '../../components/form/form-field.model';
import { Restaurant, RestaurantFormData, CUISINE_TYPES, SAMPLE_RESTAURANTS } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, FormComponent, TableComponent],
  template: `
    <div class="restaurants-container">
      <!-- Header -->
      <div class="page-header">
        <h1>🏪 Gestión de Restaurantes</h1>
        <p>Administra la información de todos los restaurantes del sistema</p>
      </div>

      <!-- Contenido principal -->
      <div class="main-content">
        <!-- Formulario -->
        <div class="form-section">
          <div class="form-header">
            <h2>{{ isEditing ? 'Editar Restaurante' : 'Agregar Nuevo Restaurante' }}</h2>
            <button 
              *ngIf="isEditing" 
              class="cancel-btn" 
              (click)="cancelEdit()"
            >
              Cancelar Edición
            </button>
          </div>
          
          <app-form 
            [fields]="formFields"
            (formSubmit)="onFormSubmit($event)"
          ></app-form>
        </div>

        <!-- Tabla -->
        <div class="table-section">
          <div class="table-header">
            <h2>Lista de Restaurantes</h2>
            <div class="table-stats">
              <span class="total-count">Total: {{ restaurants.length }}</span>
              <span class="active-count">Activos: {{ getActiveCount() }}</span>
            </div>
          </div>
          
          <app-table 
            [columns]="tableColumns"
            [data]="restaurants"
            (edit)="onEdit($event)"
            (delete)="onDelete($event)"
          ></app-table>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="info-section">
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">🍽️</div>
            <div class="card-content">
              <h3>{{ restaurants.length }}</h3>
              <p>Restaurantes Registrados</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">⭐</div>
            <div class="card-content">
              <h3>{{ getAverageRating() }}</h3>
              <p>Calificación Promedio</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-content">
              <h3>{{ getTotalCapacity() }}</h3>
              <p>Capacidad Total</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">🏷️</div>
            <div class="card-content">
              <h3>{{ getUniqueCuisines() }}</h3>
              <p>Tipos de Cocina</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .restaurants-container {
      padding: 30px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      border-radius: 20px;
      color: white;
      box-shadow: 0 8px 24px rgba(76,175,80,0.3);
    }

    .page-header h1 {
      font-size: 3rem;
      margin-bottom: 16px;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .page-header p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .form-section,
    .table-section {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .form-header,
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-header h2,
    .table-header h2 {
      color: #4caf50;
      font-size: 1.5rem;
      margin: 0;
      font-weight: 600;
    }

    .cancel-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-btn:hover {
      background: #d32f2f;
      transform: translateY(-2px);
    }

    .table-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
    }

    .total-count {
      color: #4caf50;
      font-weight: 600;
    }

    .active-count {
      color: #2196f3;
      font-weight: 600;
    }

    .info-section {
      margin-top: 40px;
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
    }

    .info-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .card-icon {
      font-size: 3rem;
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
      height: 80px;
    }

    .card-content h3 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #4caf50;
      margin: 0 0 8px 0;
    }

    .card-content p {
      color: #666;
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }

    @media (max-width: 768px) {
      .restaurants-container {
        padding: 20px;
      }
      
      .page-header {
        padding: 20px;
      }
      
      .page-header h1 {
        font-size: 2.2rem;
      }
      
      .form-section,
      .table-section {
        padding: 20px;
      }
      
      .form-header,
      .table-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
      
      .table-stats {
        justify-content: center;
      }
      
      .info-cards {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .page-header h1 {
        font-size: 1.8rem;
      }
      
      .info-card {
        flex-direction: column;
        text-align: center;
      }
      
      .card-icon {
        font-size: 2.5rem;
        min-width: 60px;
        height: 60px;
      }
      
      .card-content h3 {
        font-size: 2rem;
      }
    }
  `]
})
export class RestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [...SAMPLE_RESTAURANTS];
  isEditing = false;
  editingIndex: number | null = null;

  // Configuración del formulario
  formFields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre del Restaurante',
      type: 'text',
      required: true,
      placeholder: 'Ej: El Fogón de la Abuela'
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      required: true,
      placeholder: 'Ej: Calle 85 #12-34, Bogotá'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      required: true,
      placeholder: 'Ej: +57 1 234-5678'
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'Ej: info@restaurante.com'
    },
    {
      name: 'cuisine',
      label: 'Tipo de Cocina',
      type: 'select',
      required: true,
      options: CUISINE_TYPES.map(cuisine => ({
        label: cuisine,
        value: cuisine
      }))
    },
    {
      name: 'rating',
      label: 'Calificación (1-5)',
      type: 'number',
      required: true,
      placeholder: 'Ej: 4.5'
    },
    {
      name: 'capacity',
      label: 'Capacidad de Personas',
      type: 'number',
      required: true,
      placeholder: 'Ej: 80'
    },
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Activo', value: 'true' },
        { label: 'Inactivo', value: 'false' }
      ]
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'text',
      required: true,
      placeholder: 'Descripción del restaurante...'
    },
    {
      name: 'openingHours',
      label: 'Horario de Atención',
      type: 'text',
      required: true,
      placeholder: 'Ej: Lun-Dom: 11:00 AM - 10:00 PM'
    }
  ];

  // Configuración de la tabla
  tableColumns = [
    'name',
    'cuisine',
    'rating',
    'capacity',
    'isActive',
    'phone',
    'actions'
  ];

  ngOnInit(): void {
    // Convertir booleanos a strings para el formulario
    this.restaurants = this.restaurants.map(restaurant => ({
      ...restaurant,
      isActive: restaurant.isActive.toString() as any
    }));
  }

  onFormSubmit(event: { data: any; index: number | null }): void {
    const { data, index } = event;
    
    // Convertir string de vuelta a boolean
    data.isActive = data.isActive === 'true';
    
    if (index !== null) {
      // Editar restaurante existente
      this.restaurants[index] = {
        ...data,
        id: this.restaurants[index].id,
        updatedAt: new Date()
      };
      this.isEditing = false;
      this.editingIndex = null;
    } else {
      // Crear nuevo restaurante
      const newRestaurant: Restaurant = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.restaurants.unshift(newRestaurant);
    }
  }

  onEdit(event: { data: any; index: number }): void {
    const { data, index } = event;
    
    // Convertir boolean a string para el formulario
    const editData = {
      ...data,
      isActive: data.isActive.toString()
    };
    
    // Obtener referencia al componente form
    const formComponent = document.querySelector('app-form') as any;
    if (formComponent && formComponent.loadDataForEdit) {
      formComponent.loadDataForEdit(editData, index);
    }
    
    this.isEditing = true;
    this.editingIndex = index;
  }

  onDelete(index: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
      this.restaurants.splice(index, 1);
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingIndex = null;
    
    // Resetear el formulario
    const formComponent = document.querySelector('app-form') as any;
    if (formComponent && formComponent.resetForm) {
      formComponent.resetForm();
    }
  }

  // Métodos de utilidad para estadísticas
  getActiveCount(): number {
    return this.restaurants.filter(r => r.isActive).length;
  }

  getAverageRating(): string {
    const total = this.restaurants.reduce((sum, r) => sum + r.rating, 0);
    return (total / this.restaurants.length).toFixed(1);
  }

  getTotalCapacity(): number {
    return this.restaurants.reduce((sum, r) => sum + r.capacity, 0);
  }

  getUniqueCuisines(): number {
    const cuisines = new Set(this.restaurants.map(r => r.cuisine));
    return cuisines.size;
  }
}
