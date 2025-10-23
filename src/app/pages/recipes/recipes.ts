import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe, RecipeFormData, RECIPE_CATEGORIES, SAMPLE_RECIPES } from '../../models/recipe.model';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="recipes-container">
      <!-- Header con búsqueda -->
      <div class="recipes-header">
        <div class="search-section">
          <div class="search-input-container">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Buscar recetas por nombre, ingrediente..."
              [(ngModel)]="searchTerm"
              (input)="filterRecipes()"
            >
          </div>
          <div class="user-profile">
            <div class="profile-icon">👤</div>
            <span class="dropdown-arrow">▼</span>
          </div>
        </div>
      </div>

      <!-- Título principal -->
      <div class="page-title">
        <h1>🍽️ Gestión de Recetas</h1>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <div class="search-filter">
              <span class="filter-icon">🔍</span>
              <input 
                type="text" 
                class="filter-input" 
                placeholder="Ej. 'Quinoa', 'Pasta', 'Tor'"
                [(ngModel)]="filterTerm"
                (input)="filterRecipes()"
              >
            </div>
            
            <div class="category-filter">
              <label>Categoría:</label>
              <select [(ngModel)]="selectedCategory" (change)="filterRecipes()">
                <option *ngFor="let category of RECIPE_CATEGORIES" [value]="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="cost-filter">
              <label>Rango de Costo: {{ minCost | currency:'COP':'symbol':'1.0-0' }} - {{ maxCost | currency:'COP':'symbol':'1.0-0' }}</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  [(ngModel)]="costRange" 
                  (input)="updateCostRange()"
                  class="cost-slider"
                >
                <div class="slider-track">
                  <div class="slider-fill" [style.width.%]="(costRange / 50000) * 100"></div>
                </div>
              </div>
            </div>
          </div>
          
          <button class="create-recipe-btn" (click)="openCreateModal()">
            <span class="plus-icon">+</span>
            Crear Nueva Receta
          </button>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content">
        <!-- Lista de recetas -->
        <div class="recipes-list">
          <div class="recipes-grid">
            <div 
              *ngFor="let recipe of paginatedRecipes" 
              class="recipe-card"
              [class.selected]="selectedRecipe?.id === recipe.id"
              (click)="selectRecipe(recipe)"
            >
              <div class="recipe-image">
                <img [src]="recipe.imageUrl" [alt]="recipe.name" loading="lazy">
              </div>
              <div class="recipe-info">
                <h3 class="recipe-name">{{ recipe.name }}</h3>
                <div class="recipe-stats">
                  <span class="recipe-cost">{{ recipe.cost | currency:'COP':'symbol':'1.0-0' }}</span>
                  <span class="recipe-calories">{{ recipe.calories }} kcal</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Paginación -->
          <div class="pagination-container" *ngIf="totalPages > 1">
            <div class="pagination-info">
              Mostrando {{ getMinValue() }} - {{ getMaxValue() }} de {{ filteredRecipes.length }} recetas
            </div>
            
            <div class="pagination-controls">
              <button 
                class="pagination-btn" 
                [disabled]="currentPage === 1"
                (click)="previousPage()"
              >
                ← Anterior
              </button>
              
              <div class="page-numbers">
                <button 
                  *ngFor="let page of getPageNumbers()" 
                  class="page-number"
                  [class.active]="page === currentPage"
                  (click)="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                class="pagination-btn" 
                [disabled]="currentPage === totalPages"
                (click)="nextPage()"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>

        <!-- Detalle de receta -->
        <div class="recipe-detail" *ngIf="selectedRecipe">
          <div class="detail-image">
            <img [src]="selectedRecipe.imageUrl" [alt]="selectedRecipe.name">
          </div>
          
          <div class="detail-content">
            <h2 class="detail-title">{{ selectedRecipe.name }}</h2>
            <p class="detail-description">{{ selectedRecipe.description }}</p>
            
            <div class="detail-stats">
              <span class="detail-cost">{{ selectedRecipe.cost | currency:'COP':'symbol':'1.0-0' }}</span>
              <span class="detail-calories">{{ selectedRecipe.calories }} kcal</span>
            </div>

            <div class="detail-section">
              <h3>Ingredientes:</h3>
              <ul class="ingredients-list">
                <li *ngFor="let ingredient of selectedRecipe.ingredients">{{ ingredient }}</li>
              </ul>
            </div>

            <div class="detail-section">
              <h3>Preparación:</h3>
              <ol class="preparation-list">
                <li *ngFor="let step of selectedRecipe.preparation">{{ step }}</li>
              </ol>
            </div>

            <div class="detail-actions">
              <button class="edit-btn" (click)="openEditModal(selectedRecipe)">
                ✏️ Editar Receta
              </button>
              <button class="delete-btn" (click)="deleteRecipe(selectedRecipe.id)">
                🗑️ Eliminar Receta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar receta -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Receta' : 'Crear Nueva Receta' }}</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form class="recipe-form" (ngSubmit)="saveRecipe()">
          <div class="form-group">
            <label>Nombre de la Receta:</label>
            <input type="text" [(ngModel)]="recipeForm.name" name="name" required>
          </div>
          
          <div class="form-group">
            <label>Descripción:</label>
            <textarea [(ngModel)]="recipeForm.description" name="description" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label>URL de la Imagen:</label>
            <input type="url" [(ngModel)]="recipeForm.imageUrl" name="imageUrl" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Costo (COP):</label>
              <input type="number" [(ngModel)]="recipeForm.cost" name="cost" min="0" required>
            </div>
            
            <div class="form-group">
              <label>Calorías:</label>
              <input type="number" [(ngModel)]="recipeForm.calories" name="calories" min="0" required>
            </div>
            
            <div class="form-group">
              <label>Categoría:</label>
              <select [(ngModel)]="recipeForm.category" name="category" required>
                <option *ngFor="let category of RECIPE_CATEGORIES.slice(1)" [value]="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Ingredientes (uno por línea):</label>
            <textarea 
              [(ngModel)]="ingredientsText" 
              name="ingredients" 
              rows="5" 
              placeholder="Ej: 200g quinoa cocida&#10;1 pepino, picado&#10;2 tomates, picados"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Preparación (un paso por línea):</label>
            <textarea 
              [(ngModel)]="preparationText" 
              name="preparation" 
              rows="5" 
              placeholder="Ej: En un bol grande combinar la quinoa cocida...&#10;En un recipiente pequeño, mezclar el jugo de limón..."
              required
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="save-btn">{{ isEditing ? 'Actualizar' : 'Crear' }} Receta</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .recipes-container {
      padding: 30px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .recipes-header {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 30px;
    }

    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .search-input-container {
      position: relative;
      flex: 1;
      max-width: 600px;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: #666;
    }

    .search-input {
      width: 100%;
      padding: 16px 16px 16px 50px;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .search-input:focus {
      outline: none;
      border-color: #4caf50;
      background: white;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      border-radius: 12px;
      cursor: pointer;
      color: white;
      transition: all 0.3s ease;
    }

    .user-profile:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76,175,80,0.3);
    }

    .profile-icon {
      font-size: 20px;
    }

    .dropdown-arrow {
      font-size: 12px;
      opacity: 0.8;
    }

    .page-title {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-title h1 {
      color: #4caf50;
      font-size: 3rem;
      margin: 0;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .filters-section {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 40px;
    }

    .filters-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
    }

    .filter-group {
      display: flex;
      gap: 30px;
      align-items: center;
      flex: 1;
    }

    .search-filter {
      position: relative;
      flex: 1;
      min-width: 250px;
    }

    .filter-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: #666;
    }

    .filter-input {
      width: 100%;
      padding: 14px 14px 14px 45px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .filter-input:focus {
      outline: none;
      border-color: #4caf50;
      background: white;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
    }

    .category-filter label,
    .cost-filter label {
      font-weight: 600;
      color: #333;
      margin-right: 12px;
      font-size: 14px;
    }

    .category-filter select {
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 14px;
      background: white;
      transition: all 0.3s ease;
      min-width: 150px;
    }

    .category-filter select:focus {
      outline: none;
      border-color: #4caf50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
    }

    .cost-filter {
      min-width: 250px;
    }

    .slider-container {
      position: relative;
      margin-top: 12px;
    }

    .cost-slider {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: #e1e5e9;
      outline: none;
      -webkit-appearance: none;
      transition: all 0.3s ease;
    }

    .cost-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #4caf50;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(76,175,80,0.3);
      transition: all 0.3s ease;
    }

    .cost-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(76,175,80,0.4);
    }

    .slider-track {
      position: absolute;
      top: 0;
      left: 0;
      height: 8px;
      background: #e1e5e9;
      border-radius: 4px;
      width: 100%;
    }

    .slider-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .create-recipe-btn {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
      border: none;
      padding: 16px 28px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(76,175,80,0.2);
    }

    .create-recipe-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(76,175,80,0.3);
    }

    .plus-icon {
      font-size: 20px;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .recipes-list {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }

    .recipe-card {
      border: 2px solid transparent;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .recipe-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.15);
    }

    .recipe-card.selected {
      border-color: #4caf50;
      box-shadow: 0 8px 20px rgba(76,175,80,0.25);
    }

    .recipe-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    .recipe-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .recipe-card:hover .recipe-image img {
      transform: scale(1.05);
    }

    .recipe-info {
      padding: 20px;
    }

    .recipe-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
      line-height: 1.4;
    }

    .recipe-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recipe-cost {
      font-size: 20px;
      font-weight: 700;
      color: #4caf50;
    }

    .recipe-calories {
      font-size: 14px;
      color: #666;
      background: #f8f9fa;
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
    }

    /* Paginación */
    .pagination-container {
      margin-top: 30px;
      padding-top: 25px;
      border-top: 2px solid #f0f0f0;
    }

    .pagination-info {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
    }

    .pagination-btn {
      padding: 12px 20px;
      border: 2px solid #e1e5e9;
      background: white;
      color: #666;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .pagination-btn:hover:not(:disabled) {
      border-color: #4caf50;
      color: #4caf50;
      transform: translateY(-2px);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 8px;
    }

    .page-number {
      width: 40px;
      height: 40px;
      border: 2px solid #e1e5e9;
      background: white;
      color: #666;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-number:hover {
      border-color: #4caf50;
      color: #4caf50;
      transform: translateY(-2px);
    }

    .page-number.active {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
      border-color: #4caf50;
      box-shadow: 0 4px 12px rgba(76,175,80,0.3);
    }

    .recipe-detail {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .detail-image {
      width: 100%;
      height: 220px;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 25px;
    }

    .detail-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .detail-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .detail-description {
      color: #666;
      line-height: 1.7;
      margin-bottom: 20px;
      font-size: 16px;
    }

    .detail-stats {
      display: flex;
      gap: 25px;
      margin-bottom: 30px;
    }

    .detail-cost {
      font-size: 24px;
      font-weight: 700;
      color: #4caf50;
    }

    .detail-calories {
      font-size: 16px;
      color: #666;
      background: #f8f9fa;
      padding: 10px 16px;
      border-radius: 20px;
      font-weight: 500;
    }

    .detail-section {
      margin-bottom: 30px;
    }

    .detail-section h3 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
    }

    .ingredients-list,
    .preparation-list {
      margin: 0;
      padding-left: 25px;
    }

    .ingredients-list li,
    .preparation-list li {
      margin-bottom: 12px;
      line-height: 1.6;
      color: #555;
      font-size: 15px;
    }

    .detail-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }

    .edit-btn,
    .delete-btn {
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
    }

    .edit-btn {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
    }

    .edit-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(76,175,80,0.3);
    }

    .delete-btn {
      background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
      color: white;
    }

    .delete-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(244,67,54,0.3);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e1e5e9;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .recipe-form {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4caf50;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .cancel-btn,
    .save-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #f8f9fa;
      color: #666;
      border: 2px solid #e1e5e9;
    }

    .save-btn {
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      color: white;
    }

    .save-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76,175,80,0.3);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      
      .filters-container {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
      }
      
      .filter-group {
        flex-direction: column;
        gap: 20px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .recipe-detail {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .recipes-container {
        padding: 20px;
      }
      
      .recipes-header {
        padding: 20px;
      }
      
      .filters-section {
        padding: 20px;
      }
      
      .recipes-list {
        padding: 20px;
      }
      
      .recipe-detail {
        padding: 20px;
      }
      
      .recipes-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .search-section {
        flex-direction: column;
        gap: 15px;
      }
      
      .search-input-container {
        max-width: none;
      }
      
      .page-title h1 {
        font-size: 2.2rem;
      }
      
      .pagination-controls {
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .page-numbers {
        order: -1;
        width: 100%;
        justify-content: center;
        margin-bottom: 15px;
      }
    }

    @media (max-width: 480px) {
      .recipes-container {
        padding: 15px;
      }
      
      .page-title h1 {
        font-size: 1.8rem;
      }
      
      .filter-group {
        gap: 15px;
      }
      
      .create-recipe-btn {
        padding: 12px 20px;
        font-size: 14px;
      }
      
      .recipe-card {
        margin-bottom: 15px;
      }
      
      .detail-actions {
        flex-direction: column;
        gap: 10px;
      }
      
      .edit-btn,
      .delete-btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class RecipesComponent implements OnInit {
  recipes: Recipe[] = [...SAMPLE_RECIPES];
  filteredRecipes: Recipe[] = [...SAMPLE_RECIPES];
  selectedRecipe: Recipe | null = null;
  
  // Filtros
  searchTerm = '';
  filterTerm = '';
  selectedCategory = 'Todas';
  minCost = 0;
  maxCost = 50000;
  costRange = 20000;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  
  // Modal
  showModal = false;
  isEditing = false;
  recipeForm: RecipeFormData = {
    name: '',
    description: '',
    imageUrl: '',
    cost: 0,
    calories: 0,
    category: 'Desayuno',
    ingredients: [],
    preparation: []
  };
  
  ingredientsText = '';
  preparationText = '';
  
  RECIPE_CATEGORIES = RECIPE_CATEGORIES;

  ngOnInit(): void {
    this.updateCostRange();
    this.updatePagination();
    if (this.recipes.length > 0) {
      this.selectedRecipe = this.recipes[0];
    }
  }

  selectRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  filterRecipes(): void {
    this.filteredRecipes = this.recipes.filter(recipe => {
      const matchesSearch = !this.searchTerm || 
        recipe.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesFilter = !this.filterTerm || 
        recipe.name.toLowerCase().includes(this.filterTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(this.filterTerm.toLowerCase()));
      
      const matchesCategory = this.selectedCategory === 'Todas' || 
        recipe.category === this.selectedCategory;
      
      const matchesCost = recipe.cost >= this.minCost && recipe.cost <= this.maxCost;
      
      return matchesSearch && matchesFilter && matchesCategory && matchesCost;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updateCostRange(): void {
    this.maxCost = this.costRange;
    this.filterRecipes();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecipes.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedRecipes(): Recipe[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRecipes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getMinValue(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getMaxValue(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredRecipes.length);
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.recipeForm = {
      name: '',
      description: '',
      imageUrl: '',
      cost: 0,
      calories: 0,
      category: 'Desayuno',
      ingredients: [],
      preparation: []
    };
    this.ingredientsText = '';
    this.preparationText = '';
    this.showModal = true;
  }

  openEditModal(recipe: Recipe): void {
    this.isEditing = true;
    this.recipeForm = { ...recipe };
    this.ingredientsText = recipe.ingredients.join('\n');
    this.preparationText = recipe.preparation.join('\n');
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.recipeForm = {
      name: '',
      description: '',
      imageUrl: '',
      cost: 0,
      calories: 0,
      category: 'Desayuno',
      ingredients: [],
      preparation: []
    };
    this.ingredientsText = '';
    this.preparationText = '';
  }

  saveRecipe(): void {
    // Procesar ingredientes y preparación
    this.recipeForm.ingredients = this.ingredientsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    this.recipeForm.preparation = this.preparationText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (this.isEditing) {
      // Actualizar receta existente
      const index = this.recipes.findIndex(r => r.id === this.selectedRecipe?.id);
      if (index !== -1) {
        this.recipes[index] = {
          ...this.recipeForm,
          id: this.selectedRecipe!.id,
          createdAt: this.selectedRecipe!.createdAt,
          updatedAt: new Date()
        };
        this.selectedRecipe = this.recipes[index];
      }
    } else {
      // Crear nueva receta
      const newRecipe: Recipe = {
        ...this.recipeForm,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.recipes.unshift(newRecipe);
      this.selectedRecipe = newRecipe;
    }

    this.filterRecipes();
    this.closeModal();
  }

  deleteRecipe(recipeId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      this.recipes = this.recipes.filter(r => r.id !== recipeId);
      if (this.selectedRecipe?.id === recipeId) {
        this.selectedRecipe = this.recipes.length > 0 ? this.recipes[0] : null;
      }
      this.filterRecipes();
    }
  }
}
