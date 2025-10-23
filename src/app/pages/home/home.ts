import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  constructor(private authService: AuthService) {}

  get canAccessUsers(): boolean {
    return this.authService.hasRole('Administrador');
  }

  get canAccessRestaurants(): boolean {
    return this.authService.hasRole('Administrador');
  }
}
