import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  formLogin: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.formLogin.get('email');
  }

  get password() {
    return this.formLogin.get('password');
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.formLogin.invalid) return;

    this.loading = true;

    setTimeout(() => {
      const { email, password } = this.formLogin.value;

      if (email === 'admin@recetario.com' && password === '123456') {
        alert('✅ Bienvenido Administrador al sistema Recetario');
        this.router.navigate(['/home']);
      } else if (email === 'chef@recetario.com' && password === 'chef123') {
        alert('👨‍🍳 Bienvenido Chef al Recetario');
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos. Intenta nuevamente.';
      }

      this.loading = false;
      this.cdr.detectChanges();
    }, 1500);
  }
}
