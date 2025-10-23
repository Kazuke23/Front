import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ConfettiPiece {
  x: number;
  y: number;
  color: string;
  delay: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {
  formLogin: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl = '';

  // Estados de los inputs
  emailFocused = false;
  passwordFocused = false;
  emailValid = false;
  passwordValid = false;
  showPassword = false;

  // Animaciones y efectos
  confettiPieces: ConfettiPiece[] = [];
  showSuccess = false;
  titleWords = ['Recetario', 'Digital'];

  // Intervalos para animaciones
  private confettiInterval?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    // Sin animaciones de partículas para fondo limpio
  }

  ngOnDestroy(): void {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }

  get email() {
    return this.formLogin.get('email');
  }

  get password() {
    return this.formLogin.get('password');
  }

  // Sin métodos de partículas para fondo limpio

  // Eventos de focus/blur para inputs
  onEmailFocus(): void {
    this.emailFocused = true;
  }

  onEmailBlur(): void {
    this.emailFocused = false;
    this.emailValid = this.email?.valid || false;
  }

  onPasswordFocus(): void {
    this.passwordFocused = true;
  }

  onPasswordBlur(): void {
    this.passwordFocused = false;
    this.passwordValid = this.password?.valid || false;
  }

  // Toggle para mostrar/ocultar contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Llenar credenciales demo
  fillDemoCredentials(type: 'admin' | 'chef'): void {
    if (type === 'admin') {
      this.formLogin.patchValue({
        email: 'admin@recetario.com',
        password: '123456'
      });
    } else {
      this.formLogin.patchValue({
        email: 'chef@recetario.com',
        password: 'chef123'
      });
    }
    
    // Efecto visual al llenar
    this.emailFocused = true;
    this.passwordFocused = true;
    setTimeout(() => {
      this.emailFocused = false;
      this.passwordFocused = false;
    }, 1000);
  }

  // Generar confetti para éxito
  generateConfetti(): void {
    this.confettiPieces = [];
    const colors = ['#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#f44336'];
    
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2
      });
    }
  }

  // Mostrar efectos de éxito
  showSuccessEffects(): void {
    this.showSuccess = true;
    this.generateConfetti();
    
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.formLogin.invalid) return;

    this.loading = true;

    try {
      const { email, password } = this.formLogin.value;
      const success = await this.authService.login(email, password);

      if (success) {
        this.showSuccessEffects();
        const user = this.authService.getCurrentUser();
        const welcomeMessage = this.getWelcomeMessage(user?.rol);
        
        setTimeout(() => {
          alert(welcomeMessage);
          this.router.navigate([this.returnUrl]);
        }, 1500);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos. Intenta nuevamente.';
      }
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private getWelcomeMessage(rol?: string): string {
    switch (rol) {
      case 'Administrador':
        return '✅ Bienvenido Administrador al sistema Recetario';
      case 'Chef':
        return '👨‍🍳 Bienvenido Chef al Recetario';
      case 'Usuario':
        return '👤 Bienvenido Usuario al Recetario';
      default:
        return '✅ Bienvenido al sistema Recetario';
    }
  }
}