import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Recipe, RECIPE_CATEGORIES } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recipe-create.html',
  styleUrl: './recipe-create.css'
})
export class RecipeCreateComponent implements OnInit, OnDestroy {
  
  isEditing = false;
  recipeId: string | null = null;
  categories = RECIPE_CATEGORIES.filter(cat => cat !== 'Todas');
  
  formData = {
    name: '',
    tipoCocina: '',
    ingredientes: '',
    calorias: '',
    costoEstimado: '',
    tiempoPreparacion: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos editando
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeId = id;
      this.loadRecipeForEdit(id);
      this.isEditing = true;
    }
  }

  ngOnDestroy(): void {
  }

  loadRecipeForEdit(id: string): void {
    try {
      // Cargar receta desde localStorage
      const storedRecipes = localStorage.getItem('recipes');
      if (storedRecipes) {
        const recipes: Recipe[] = JSON.parse(storedRecipes);
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
          this.formData = {
            name: recipe.name,
            tipoCocina: recipe.category,
            ingredientes: recipe.ingredients.join(', '),
            calorias: recipe.calories.toString(),
            costoEstimado: recipe.cost.toString(),
            tiempoPreparacion: recipe.preparation && recipe.preparation.length > 0 
              ? (recipe.preparation.length * 5).toString() 
              : '30'
          };
        }
      }
    } catch (error) {
      console.error('Error al cargar receta para editar:', error);
    }
  }

  onSubmit(): void {
    // Validar campos requeridos
    if (!this.formData.name || !this.formData.tipoCocina || !this.formData.ingredientes || 
        !this.formData.calorias || !this.formData.costoEstimado || !this.formData.tiempoPreparacion) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que calorías, costo y tiempo sean números válidos
    const calorias = parseInt(this.formData.calorias);
    const costo = parseFloat(this.formData.costoEstimado);
    const tiempo = parseInt(this.formData.tiempoPreparacion);

    if (isNaN(calorias) || calorias <= 0) {
      alert('Por favor ingresa un valor válido para las calorías');
      return;
    }

    if (isNaN(costo) || costo <= 0) {
      alert('Por favor ingresa un valor válido para el costo estimado');
      return;
    }

    if (isNaN(tiempo) || tiempo <= 0) {
      alert('Por favor ingresa un valor válido para el tiempo de preparación');
      return;
    }

    // Procesar ingredientes (separados por líneas o comas)
    const ingredientesArray = this.formData.ingredientes
      .split(/[,\n]/)
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    if (ingredientesArray.length === 0) {
      alert('Por favor ingresa al menos un ingrediente');
      return;
    }

    // Crear pasos de preparación básicos basados en el tiempo
    const numSteps = Math.ceil(tiempo / 5);
    const preparationSteps: string[] = [];
    for (let i = 1; i <= numSteps; i++) {
      preparationSteps.push(`Paso ${i}: Preparar los ingredientes y seguir el proceso de cocción.`);
    }

    try {
      let recipes: Recipe[] = [];
      const storedRecipes = localStorage.getItem('recipes');
      if (storedRecipes) {
        recipes = JSON.parse(storedRecipes).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt)
        }));
      }

      if (this.isEditing && this.recipeId) {
        // Actualizar receta existente
        const index = recipes.findIndex(r => r.id === this.recipeId);
        if (index !== -1) {
          recipes[index] = {
            ...recipes[index],
            name: this.formData.name,
            category: this.formData.tipoCocina,
            cost: costo,
            calories: calorias,
            ingredients: ingredientesArray,
            preparation: preparationSteps,
            updatedAt: new Date()
          };
        }
      } else {
        // Crear nueva receta
        const newRecipe: Recipe = {
          id: Date.now().toString(),
          name: this.formData.name,
          description: `Receta de ${this.formData.name}`,
          imageUrl: '',
          cost: costo,
          calories: calorias,
          category: this.formData.tipoCocina,
          ingredients: ingredientesArray,
          preparation: preparationSteps,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        // Agregar al principio del array para que aparezca primero
        recipes.unshift(newRecipe);
      }
      
      // Guardar en localStorage
      localStorage.setItem('recipes', JSON.stringify(recipes));
      
      // Navegar a la lista
      setTimeout(() => {
        this.router.navigate(['/recetas']);
      }, 200);
    } catch (error) {
      console.error('Error al guardar receta:', error);
      alert('Error al guardar la receta. Por favor intenta nuevamente.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/recetas']);
  }
}

