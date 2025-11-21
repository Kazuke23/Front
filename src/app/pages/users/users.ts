import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../components/form/form';
import { TableComponent } from '../../components/table/table';
import { FormField } from '../../components/form/form-field.model';
import { UserService } from '../../services/user.service';
import { AuthService, User } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormComponent, TableComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit, OnDestroy {
  // ✅ Campos del formulario
  userFields: FormField[] = [
    { name: 'full_name', label: 'Nombre completo', required: true },
    { name: 'email', label: 'Correo electrónico', required: true },
    { name: 'username', label: 'Usuario', required: true },
  ];

  // ✅ Datos de usuarios desde el servicio
  users: User[] = [];
  
  // ✅ Columnas de la tabla
  userColumns = ['full_name', 'email', 'username', 'role'];

  private subscription?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadUsers(): void {
    this.subscription = this.userService.getUsers().pipe(
      catchError(error => {
        console.error('Error al cargar usuarios:', error);
        return of([]);
      })
    ).subscribe(users => {
      // Normalizar usuarios para compatibilidad con el frontend
      this.users = users.map(user => {
        const normalized: User = {
          ...user,
          nombre: user.full_name || user.username,
          rol: user.role as any
        };
        return normalized;
      });
    });
  }

  // ✅ Acción al enviar el formulario
  onSubmit(userData: any) {
    console.log('Nuevo usuario:', userData);
    // Nota: El registro de usuarios se hace a través de AuthService.register()
    // Este componente solo muestra la lista de usuarios
    // Si necesitas crear usuarios desde aquí, deberías llamar a AuthService.register()
    this.loadUsers(); // Recargar lista después de crear
  }
}
