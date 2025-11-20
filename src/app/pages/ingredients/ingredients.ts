import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IngredientsService } from '../../services/ingredients.service';
import { Ingredient } from '../../models/ingredient.model';

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
    private ingredientsService: IngredientsService,
    private router: Router,
    private cd: ChangeDetectorRef   // <-- INYECTAR ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadIngredients();
  }

  loadIngredients() {
    this.loading = true;
    this.ingredientsService.getIngredients().subscribe({
      next: (res: Ingredient[]) => {
        this.ingredients = [...res]; // nueva referencia
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ingredientes', err);
        this.loading = false;
      }
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
    this.ingredientsService.deleteIngredient(id).subscribe({
      next: (res) => {
        console.log('[deleteIngredient] respuesta del servicio:', res);
        // Asegurarse de recargar la lista real desde el servicio (opcional)
        this.loadIngredients(); // actualiza desde la fuente autoritativa
        // y forzar otra vez la detección en caso de que el servicio emita la misma referencia
        setTimeout(() => this.cd.detectChanges(), 0);
      },
      error: (err) => {
        console.error('[deleteIngredient] error al eliminar en servicio:', err);
        // Si falla el DELETE, revertir la eliminación local (mejor experiencia)
        // (recomendado solo si tu servicio retorna error; evita duplicar lógica)
        this.loadIngredients(); // vuelve a pedir lista y restaura el estado
      }
    });
  }
}
