import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, of } from 'rxjs';
import { Recipe, RECIPE_CATEGORIES } from '../../../models/recipe.model';
import { RecipeService, CreateRecipeRequest, RecipeIngredient, RecipePreparation, Recipe as ApiRecipe } from '../../../services/recipe.service';
import { AuthService } from '../../../services/auth.service';

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
    private recipeService: RecipeService,
    private authService: AuthService
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
      // Obtener el restaurante actual del usuario
      const currentUser = this.authService.getCurrentUser();
      const restaurantId = currentUser?.restaurant_id;
      
      if (restaurantId) {
        // Cargar receta desde la API
        this.recipeService.getRecipeById(restaurantId, id).pipe(
          catchError(error => {
            console.error('Error al cargar receta desde API:', error);
            // Fallback: cargar desde localStorage
            this.loadFromLocalStorage(id);
            return of(null as any);
          })
        ).subscribe((recipe: ApiRecipe | null) => {
          if (!recipe) return;
          this.formData = {
            name: recipe.title,
            tipoCocina: 'General', // La API no tiene categoría
            ingredientes: recipe.ingredients?.map((ing: RecipeIngredient) => ing.ingredient_id).join(', ') || '',
            calorias: '0', // La API no tiene calorías
            costoEstimado: '0', // La API no tiene costo
            tiempoPreparacion: recipe.preparations && recipe.preparations.length > 0 
              ? (recipe.preparations.length * 5).toString() 
              : '30'
          };
        });
      } else {
        // Fallback: cargar desde localStorage
        this.loadFromLocalStorage(id);
      }
    } catch (error) {
      console.error('Error al cargar receta para editar:', error);
      this.loadFromLocalStorage(id);
    }
  }

  private loadFromLocalStorage(id: string): void {
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
      // Obtener el restaurante actual del usuario
      const currentUser = this.authService.getCurrentUser();
      const restaurantId = currentUser?.restaurant_id;
      const authorId = currentUser?.id || '';

      if (!restaurantId) {
        alert('No se pudo identificar el restaurante. Por favor inicia sesión nuevamente.');
        return;
      }

      if (this.isEditing && this.recipeId && restaurantId) {
        // Actualizar receta existente usando la API
        const updateRequest: any = {
          description: `Receta de ${this.formData.name}`,
          servings: parseInt(this.formData.tiempoPreparacion) || 4,
          ingredients: ingredientesArray.map((ingId, idx) => ({
            ingredient_id: ingId,
            quantity: 1,
            unit_id: '' // Necesitarías obtener el unit_id correcto
          })),
          preparations: preparationSteps.map((step, idx) => ({
            step_number: idx + 1,
            instructions: step
          }))
        };

        this.recipeService.updateRecipe(restaurantId, this.recipeId, updateRequest).pipe(
          catchError(error => {
            console.error('Error al actualizar receta en API:', error);
            // Fallback: guardar en localStorage
            this.saveToLocalStorage(true);
            return of(null);
          })
        ).subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/recetas']);
          }, 200);
        });
      } else if (restaurantId) {
        // Crear nueva receta usando la API
        const createRequest: CreateRecipeRequest = {
          title: this.formData.name,
          description: `Receta de ${this.formData.name}`,
          servings: parseInt(this.formData.tiempoPreparacion) || 4,
          authorId: authorId
        };

        this.recipeService.createRecipe(restaurantId, createRequest).pipe(
          catchError(error => {
            console.error('Error al crear receta en API:', error);
            // Fallback: guardar en localStorage
            this.saveToLocalStorage(false);
            return of(null);
          })
        ).subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/recetas']);
          }, 200);
        });
      } else {
        // Fallback: guardar en localStorage si no hay restaurantId
        this.saveToLocalStorage(this.isEditing);
      }
    } catch (error) {
      console.error('Error al guardar receta:', error);
      alert('Error al guardar la receta. Por favor intenta nuevamente.');
    }
  }

  private saveToLocalStorage(isEditing: boolean): void {
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

      const ingredientesArray = this.formData.ingredientes
        .split(/[,\n]/)
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const numSteps = Math.ceil(parseInt(this.formData.tiempoPreparacion) / 5);
      const preparationSteps: string[] = [];
      for (let i = 1; i <= numSteps; i++) {
        preparationSteps.push(`Paso ${i}: Preparar los ingredientes y seguir el proceso de cocción.`);
      }

      if (isEditing && this.recipeId) {
        const index = recipes.findIndex(r => r.id === this.recipeId);
        if (index !== -1) {
          recipes[index] = {
            ...recipes[index],
            name: this.formData.name,
            category: this.formData.tipoCocina,
            cost: parseFloat(this.formData.costoEstimado),
            calories: parseInt(this.formData.calorias),
            ingredients: ingredientesArray,
            preparation: preparationSteps,
            updatedAt: new Date()
          };
        }
      } else {
        const newRecipe: Recipe = {
          id: Date.now().toString(),
          name: this.formData.name,
          description: `Receta de ${this.formData.name}`,
          imageUrl: '',
          cost: parseFloat(this.formData.costoEstimado),
          calories: parseInt(this.formData.calorias),
          category: this.formData.tipoCocina,
          ingredients: ingredientesArray,
          preparation: preparationSteps,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        recipes.push(newRecipe);
      }
      
      localStorage.setItem('recipes', JSON.stringify(recipes));
      
      setTimeout(() => {
        this.router.navigate(['/recetas']);
      }, 200);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      alert('Error al guardar la receta. Por favor intenta nuevamente.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/recetas']);
  }
}

