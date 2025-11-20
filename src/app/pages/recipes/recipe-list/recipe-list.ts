import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { Recipe, RECIPE_CATEGORIES, SAMPLE_RECIPES } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.html',
  styleUrls: ['./recipe-list.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class RecipeListComponent implements OnInit, OnDestroy {
  
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  searchTerm: string = '';
  selectedRecipe: Recipe | null = null;
  isAdmin: boolean = false;
  private subscription?: Subscription;
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    this.isAdmin = this.authService.hasRole('Administrador');
    
    // Suscribirse a cambios en la autenticación
    this.authSubscription = this.authService.authState$.subscribe(() => {
      this.isAdmin = this.authService.hasRole('Administrador');
    });
    
    // Cargar recetas
    this.loadRecipes();
    
    // Suscribirse a eventos de navegación para recargar cuando se vuelva a esta página
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/recetas' || event.urlAfterRedirects === '/recetas') {
          setTimeout(() => {
            this.loadRecipes();
          }, 100);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  loadRecipes(): void {
    try {
      // Por ahora usamos datos de ejemplo del modelo
      // TODO: Conectar con RecipeService cuando esté disponible
      const storedRecipes = localStorage.getItem('recipes');
      if (storedRecipes) {
        this.recipes = JSON.parse(storedRecipes).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt)
        }));
      } else {
        // Usar datos de ejemplo si no hay datos guardados
        this.recipes = [...SAMPLE_RECIPES];
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
      }
      this.filterRecipes();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error en loadRecipes:', error);
      this.recipes = [...SAMPLE_RECIPES];
      this.filterRecipes();
    }
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.filterRecipes();
  }

  filterRecipes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRecipes = this.recipes;
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredRecipes = this.recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(search) ||
        recipe.category.toLowerCase().includes(search) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(search))
      );
    }
  }

  viewRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  editRecipe(recipe: Recipe): void {
    if (recipe && recipe.id) {
      this.router.navigate(['/recetas/edit', recipe.id]);
    }
  }

  deleteRecipe(recipe: Recipe): void {
    if (recipe && recipe.id) {
      if (confirm(`¿Estás seguro de que quieres eliminar la receta "${recipe.name}"?`)) {
        this.recipes = this.recipes.filter(r => r.id !== recipe.id);
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
        if (this.selectedRecipe?.id === recipe.id) {
          this.selectedRecipe = null;
        }
        this.filterRecipes();
      }
    }
  }

  closeView(): void {
    this.selectedRecipe = null;
  }

  getPreparationTime(recipe: Recipe): string {
    // Calcular tiempo de preparación basado en los pasos
    // Si hay pasos de preparación, estimamos 5 min por paso
    if (recipe.preparation && recipe.preparation.length > 0) {
      return `${recipe.preparation.length * 5} min`;
    }
    // Si no hay pasos, retornamos un valor por defecto
    return '30 min';
  }

  getIngredientsDisplay(recipe: Recipe): string {
    // Mostrar primeros 3 ingredientes
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return 'Sin ingredientes';
    }
    const display = recipe.ingredients.slice(0, 3).join(', ');
    return recipe.ingredients.length > 3 ? `${display}...` : display;
  }
}

