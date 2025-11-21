import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';
import { Restaurant, CUISINE_TYPES } from '../../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restaurant-form.html',
  styleUrls: ['./restaurant-form.css']
})
export class RestaurantFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  currentRestaurant: Restaurant | null = null;
  cuisineTypes = CUISINE_TYPES;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadRestaurant(id);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.email]], // Opcional, solo validar formato si se ingresa
      cuisine: ['', Validators.required],
      rating: ['', Validators.required],
      capacity: [0], // Opcional
      isActive: ['', Validators.required],
      description: [''],
      openingHours: ['', Validators.required]
    });
  }

  private loadRestaurant(id: string): void {
    const restaurant = this.restaurantService.getRestaurantByIdSync(id);
    if (restaurant) {
      this.currentRestaurant = restaurant;
      this.form.patchValue({
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating.toString(),
        capacity: restaurant.capacity,
        isActive: restaurant.isActive === true ? 'true' : 'false',
        description: restaurant.description,
        openingHours: restaurant.openingHours
      });
    } else {
      this.notificationService.error('Restaurante no encontrado');
      this.router.navigate(['/restaurantes']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const value = this.form.value;
    const restaurantData: Restaurant = {
      id: this.currentRestaurant?.id || Date.now().toString(),
      name: value.name,
      address: value.address,
      phone: value.phone,
      email: value.email || '',
      cuisine: value.cuisine,
      rating: Number(value.rating),
      capacity: Number(value.capacity) || 0,
      isActive: value.isActive === 'true' || value.isActive === true,
      description: value.description || '',
      openingHours: value.openingHours,
      createdAt: this.currentRestaurant?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (this.isEditMode && this.currentRestaurant) {
      this.restaurantService.updateRestaurant(this.currentRestaurant.id, restaurantData);
      this.notificationService.success(`¡Restaurante "${restaurantData.name}" actualizado exitosamente!`);
    } else {
      this.restaurantService.addRestaurant(restaurantData);
      this.notificationService.success(`¡Restaurante "${restaurantData.name}" creado exitosamente!`);
    }

    setTimeout(() => this.router.navigate(['/restaurantes']), 1500);
  }

  cancel(): void {
    this.router.navigate(['/restaurantes']);
  }
}

