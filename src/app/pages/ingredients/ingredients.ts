import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Ingredient,
  IngredientFormData,
  INGREDIENT_CATEGORIES,
  SAMPLE_INGREDIENTS
} from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredients.html',
  styleUrls: ['./ingredients.css']
})
export class IngredientsComponent {
  ingredients: Ingredient[] = [...SAMPLE_INGREDIENTS];
  filteredIngredients: Ingredient[] = [...this.ingredients];

  categories = INGREDIENT_CATEGORIES;
  selectedCategory = 'Todos';
  searchTerm = '';

  showForm = false;
  editingIngredient: Ingredient | null = null;

  formData: IngredientFormData = {
    name: '',
    unit: '',
    cost: 0,
    stock: 0,
    category: 'Otros',
    description: ''
  };

  constructor() {
    this.filterIngredients();
  }

  // --- Filtrado (asegura que "Todos" muestre todo)
  filterIngredients(): void {
    const search = (this.searchTerm || '').trim().toLowerCase();
    const category = this.selectedCategory || 'Todos';

    this.filteredIngredients = this.ingredients.filter(i => {
      const matchCategory = category === 'Todos' || i.category === category;
      const matchSearch =
        !search ||
        i.name.toLowerCase().includes(search) ||
        (i.description || '').toLowerCase().includes(search);
      return matchCategory && matchSearch;
    });
  }

  // --- Abrir formulario para nuevo ingrediente
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    } else {
      // Abrir para crear por defecto
      this.editingIngredient = null;
      this.resetForm();
    }
  }

  // --- Preparar formulario para editar
  editIngredient(ingredient: Ingredient): void {
    this.editingIngredient = ingredient;
    // Asignamos solo los campos del formulario (sin id, fechas, etc.)
    this.formData = {
      name: ingredient.name,
      unit: ingredient.unit,
      cost: ingredient.cost,
      stock: ingredient.stock,
      category: ingredient.category,
      description: ingredient.description
    };
    this.showForm = true;
  }

  // --- Guardar (crear o actualizar)
  saveIngredient(): void {
    // Validación mínima
    if (!this.formData.name || !this.formData.unit) {
      alert('Por favor completa al menos nombre y unidad.');
      return;
    }

    if (this.editingIngredient) {
      // Actualizar elemento en el arreglo por índice
      const idx = this.ingredients.findIndex(i => i.id === this.editingIngredient!.id);
      if (idx !== -1) {
        const updated: Ingredient = {
          ...this.ingredients[idx],
          name: this.formData.name,
          unit: this.formData.unit,
          cost: this.formData.cost,
          stock: this.formData.stock,
          category: this.formData.category,
          description: this.formData.description,
          updatedAt: new Date()
        };
        this.ingredients[idx] = updated;
      } else {
        // Por seguridad, fallback: agregar como nuevo si no se encuentra
        const newIng: Ingredient = {
          id: Date.now().toString(),
          name: this.formData.name,
          unit: this.formData.unit,
          cost: this.formData.cost,
          stock: this.formData.stock,
          category: this.formData.category,
          description: this.formData.description,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.ingredients.unshift(newIng);
      }
    } else {
      // Crear nuevo
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: this.formData.name,
        unit: this.formData.unit,
        cost: this.formData.cost,
        stock: this.formData.stock,
        category: this.formData.category,
        description: this.formData.description,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.ingredients.unshift(newIngredient);
    }

    // Actualizar lista filtrada y cerrar formulario
    this.filterIngredients();
    this.resetForm();
    this.showForm = false;
    this.editingIngredient = null;
  }

  // --- Eliminar
  deleteIngredient(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return;
    this.ingredients = this.ingredients.filter(i => i.id !== id);
    this.filterIngredients();
  }

  // --- Cancelar edición y limpiar
  cancelEdit(): void {
    this.editingIngredient = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      unit: '',
      cost: 0,
      stock: 0,
      category: this.categories.includes('Otros') ? 'Otros' : this.categories[0],
      description: ''
    };
  }
}
