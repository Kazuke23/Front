import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IngredientService, Ingredient as ApiIngredient, Unit as ApiUnit, CreateIngredientRequest, UpdateIngredientRequest } from '../../services/ingredient.service';
import { Ingredient, Unit } from '../../models/ingredient.model';
import { catchError, of } from 'rxjs';

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
    private ingredientService: IngredientService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); // para /ingredientes/editar/:id
    this.loadUnits();

    if (this.id) {
      this.ingredientService.getIngredientById(this.id).pipe(
        catchError(error => {
          console.error('Error cargando ingrediente desde API:', error);
          return of(null);
        })
      ).subscribe((data: ApiIngredient | null) => {
        if (data) {
          // Convertir de API al formato del frontend
          this.formData = {
            id: data.id,
            name: data.name,
            default_unit_id: data.defaultUnit?.id || data.default_unit_id || '',
            calories_per_unit: data.caloriesPerUnit || data.calories_per_unit || 0,
            description: data.description || ''
          };
        }
      });
    }
  }

  loadUnits() {
    this.ingredientService.getUnits().pipe(
      catchError(error => {
        console.error('Error cargando unidades desde API:', error);
        return of([]);
      })
    ).subscribe((apiUnits: ApiUnit[]) => {
      // Convertir unidades de la API al formato del frontend
      this.units = apiUnits.map((unit: ApiUnit): Unit => ({
        id: unit.id,
        name: unit.description || unit.code || ''
      }));
    });
  }

  save() {
    if (!this.formData.name || !this.formData.default_unit_id) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Buscar la unidad seleccionada para obtener su información completa
    const selectedUnit = this.units.find(u => u.id === this.formData.default_unit_id);
    if (!selectedUnit) {
      alert('Por favor selecciona una unidad válida');
      return;
    }

    if (this.id) {
      // Actualizar ingrediente existente
      const updateRequest: UpdateIngredientRequest = {
        name: this.formData.name,
        description: this.formData.description,
        caloriesPerUnit: this.formData.calories_per_unit || undefined,
        defaultUnit: {
          id: selectedUnit.id,
          code: selectedUnit.name.substring(0, 3).toUpperCase(),
          description: selectedUnit.name
        }
      };

      this.ingredientService.updateIngredient(this.id, updateRequest).pipe(
        catchError(error => {
          console.error('Error actualizando ingrediente:', error);
          alert('Error al actualizar el ingrediente. Por favor intenta nuevamente.');
          return of(null);
        })
      ).subscribe(() => {
        this.router.navigate(['/ingredientes']);
      });
    } else {
      // Crear nuevo ingrediente
      const createRequest: CreateIngredientRequest = {
        code: this.formData.name.substring(0, 3).toUpperCase(),
        name: this.formData.name,
        description: this.formData.description,
        caloriesPerUnit: this.formData.calories_per_unit || undefined,
        defaultUnit: {
          id: selectedUnit.id,
          code: selectedUnit.name.substring(0, 3).toUpperCase(),
          description: selectedUnit.name
        }
      };

      this.ingredientService.createIngredient(createRequest).pipe(
        catchError(error => {
          console.error('Error creando ingrediente:', error);
          alert('Error al crear el ingrediente. Por favor intenta nuevamente.');
          return of(null);
        })
      ).subscribe(() => {
        this.router.navigate(['/ingredientes']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/ingredientes']);
  }
}
