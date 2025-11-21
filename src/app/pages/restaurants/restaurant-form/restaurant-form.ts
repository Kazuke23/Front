import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant, CUISINE_TYPES } from '../../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurant-form.html',
  styleUrls: ['./restaurant-form.css']
})
export class RestaurantFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  restaurantId: string | null = null;
  pageTitle = 'Crear Nuevo Restaurante';
  loading = false;
  cuisineTypes = CUISINE_TYPES;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.restaurantId = id;
      this.pageTitle = 'Editar Restaurante';
      this.loadRestaurant(id);
    }
  }

  buildForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      cuisine: ['', [Validators.required]],
      status: ['', [Validators.required]],
      rating: ['', [Validators.required]],
      openingHours: ['', [Validators.required]]
    });
  }

  loadRestaurant(id: string): void {
    this.restaurantService.getById(id).subscribe({
      next: (restaurant) => {
        if (restaurant) {
          this.form.patchValue({
            name: restaurant.name,
            phone: restaurant.phone,
            address: restaurant.address,
            cuisine: restaurant.cuisine,
            status: restaurant.isActive ? 'active' : 'pending',
            rating: restaurant.rating,
            openingHours: restaurant.openingHours
          });
        }
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      if (this.isEditing && this.restaurantId) {
        // Editar: solo enviar address según el endpoint, pero guardar todos los datos localmente
        this.restaurantService.updateRestaurant(this.restaurantId, {
          address: formValue.address
        }, {
          name: formValue.name,
          phone: formValue.phone,
          cuisine: formValue.cuisine,
          rating: parseFloat(formValue.rating) || 0,
          isActive: formValue.status === 'active',
          openingHours: formValue.openingHours
        }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/restaurantes']);
          },
          error: (error) => {
            console.error('Error updating restaurant:', error);
            this.loading = false;
          }
        });
      } else {
        // Crear: enviar name, nit, city, country según el endpoint
        this.restaurantService.addRestaurant({
          name: formValue.name,
          nit: this.generateNIT(),
          city: this.extractCity(formValue.address),
          country: 'Colombia'
        }, {
          address: formValue.address,
          phone: formValue.phone,
          cuisine: formValue.cuisine,
          rating: parseFloat(formValue.rating) || 0,
          isActive: formValue.status === 'active',
          openingHours: formValue.openingHours
        }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/restaurantes']);
          },
          error: (error) => {
            console.error('Error creating restaurant:', error);
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  goBack(): void {
    this.router.navigate(['/restaurantes']);
  }

  getFieldClass(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.touched && field?.invalid) {
      return 'error';
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private generateNIT(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private extractCity(address: string): string {
    // Extraer ciudad de la dirección (asumiendo formato "Calle, Ciudad")
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'Bogotá';
  }
}

