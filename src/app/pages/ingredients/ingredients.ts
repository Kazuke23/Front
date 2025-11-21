import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IngredientService, Ingredient as ApiIngredient } from '../../services/ingredient.service';
import { Ingredient } from '../../models/ingredient.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ingredients.html',
  styleUrls: ['./ingredients.css']
})
export class IngredientsPage implements OnInit {

  ingredients: Ingredient[] = [];
  loading = true;
  searchTerm: string = '';

  constructor(
    private ingredientService: IngredientService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadIngredients();
  }

  loadIngredients() {
    this.loading = true;
    this.ingredientService.getIngredients().pipe(
      catchError(error => {
        console.error('Error cargando ingredientes desde API:', error);
        return of([]);
      })
    ).subscribe((res: ApiIngredient[]) => {
      // Convertir ingredientes de la API al formato del frontend
      this.ingredients = res.map((ing: ApiIngredient): Ingredient => ({
        id: ing.id,
        name: ing.name,
        default_unit_id: ing.defaultUnit?.id || ing.default_unit_id || '',
        calories_per_unit: ing.caloriesPerUnit || ing.calories_per_unit || 0,
        description: ing.description || ''
      }));
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  get filteredIngredients(): Ingredient[] {
    const term = (this.searchTerm || '').toLowerCase();
    return this.ingredients.filter(i =>
      i.name.toLowerCase().includes(term)
    );
  }

  goToCreate() {
    this.router.navigate(['/ingredientes', 'nuevo']);
  }

  goToEdit(id?: string) {
    if (!id) return;
    this.router.navigate(['/ingredientes', 'editar', id]);
  }

  // ---------- Método delete mejorado con diagnostico y forzado de refresh ----------
  deleteIngredient(id?: string) {
    console.log('[deleteIngredient] id recibido:', id);

    if (!id) {
      console.warn('[deleteIngredient] id undefined, abortando');
      return;
    }

    const confirmed = confirm('¿Seguro que deseas eliminar este ingrediente?');
    if (!confirmed) {
      console.log('[deleteIngredient] usuario canceló');
      return;
    }

    // 1) Optimistic update: quitar inmediatamente del array local
    const beforeCount = this.ingredients.length;
    this.ingredients = this.ingredients.filter(ing => ing.id !== id);
    console.log(`[deleteIngredient] eliminado localmente (antes=${beforeCount} ahora=${this.ingredients.length})`);

    // Forzar cambio de referencia (por si acaso)
    this.ingredients = [...this.ingredients];
    // Forzar detección de cambios inmediatamente
    this.cd.detectChanges();

    // 2) Llamada al servicio para eliminar en "backend"
    this.ingredientService.deleteIngredient(id).pipe(
      catchError(error => {
        console.error('[deleteIngredient] error al eliminar en servicio:', error);
        // Si falla el DELETE, revertir la eliminación local
        this.loadIngredients(); // vuelve a pedir lista y restaura el estado
        return of(void 0);
      })
    ).subscribe(() => {
      console.log('[deleteIngredient] ingrediente eliminado exitosamente');
      // Recargar la lista desde la API
      this.loadIngredients();
      setTimeout(() => this.cd.detectChanges(), 0);
    });
  }
}
