import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IngredientsService } from '../../services/ingredients.service';
import { Ingredient, Unit } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ingredients-form.html',
  styleUrls: ['./ingredients-form.css']
})
export class IngredientFormPage implements OnInit {

  id: string | null = null;
  units: Unit[] = [];

  formData: Ingredient = {
    id: '',
    name: '',
    default_unit_id: '',
    calories_per_unit: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ingredientsService: IngredientsService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); // para /ingredientes/editar/:id
    this.loadUnits();

    if (this.id) {
      this.ingredientsService.getIngredient(this.id).subscribe({
        next: (data) => {
          if (data) this.formData = data;
        },
        error: (err) => console.error('Error cargando ingrediente', err)
      });
    }
  }

  loadUnits() {
    this.ingredientsService.getUnits().subscribe({
      next: (units) => this.units = units,
      error: (err) => console.error('Error cargando unidades', err)
    });
  }

  save() {
    if (this.id) {
      this.ingredientsService.updateIngredient(this.id, this.formData).subscribe({
        next: () => this.router.navigate(['/ingredientes']),
        error: (err) => console.error('Error actualizando', err)
      });
    } else {
      this.ingredientsService.createIngredient(this.formData).subscribe({
        next: () => this.router.navigate(['/ingredientes']),
        error: (err) => console.error('Error creando', err)
      });
    }
  }

  cancel() {
    this.router.navigate(['/ingredientes']);
  }
}
