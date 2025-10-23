# 🔐 Sistema de Protección de Rutas - Recetario

## 📋 Resumen

Se ha implementado un sistema completo de protección de rutas por autenticación y roles para el proyecto Angular Recetario. El sistema incluye:

- **Servicio de Autenticación** (`AuthService`)
- **Guards de Protección** (`AuthGuard`, `RoleGuard`, `GuestGuard`)
- **Componente de Navegación** (`NavbarComponent`)
- **Página de Acceso Denegado** (`AccessDeniedComponent`)

## 🚀 Características Implementadas

### 1. Servicio de Autenticación (`AuthService`)

**Ubicación**: `src/app/services/auth.service.ts`

**Funcionalidades**:
- ✅ Gestión de estado de autenticación con RxJS
- ✅ Persistencia de sesión en localStorage
- ✅ Validación de credenciales
- ✅ Gestión de roles de usuario
- ✅ Métodos de verificación de permisos

**Usuarios Predefinidos**:
```typescript
// Administrador
email: 'admin@recetario.com'
password: '123456'
rol: 'Administrador'

// Chef
email: 'chef@recetario.com'
password: 'chef123'
rol: 'Chef'

// Usuario Normal
email: 'usuario@recetario.com'
password: 'user123'
rol: 'Usuario'
```

### 2. Guards de Protección

#### AuthGuard (`src/app/guards/auth.guard.ts`)
- ✅ Protege rutas que requieren autenticación
- ✅ Redirige al login si no está autenticado
- ✅ Preserva la URL de retorno

#### RoleGuard (`src/app/guards/role.guard.ts`)
- ✅ Protege rutas por roles específicos
- ✅ Verifica múltiples roles
- ✅ Redirige a página de acceso denegado

#### GuestGuard (`src/app/guards/guest.guard.ts`)
- ✅ Protege rutas públicas (ej: login)
- ✅ Redirige usuarios autenticados al home

### 3. Configuración de Rutas (`src/app/app.routes.ts`)

```typescript
export const routes: Routes = [
  // Ruta pública (solo para usuarios no autenticados)
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [GuestGuard]
  },
  
  // Ruta protegida por autenticación
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    canActivate: [AuthGuard]
  },
  
  // Rutas protegidas por roles específicos
  { 
    path: 'users', 
    loadComponent: () => import('./pages/users/users').then(m => m.Users),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] } // Solo administradores
  },
  
  { 
    path: 'formulario', 
    loadComponent: () => import('./pages/formulario/formulario').then(m => m.FormularioPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  { 
    path: 'tabla', 
    loadComponent: () => import('./pages/tabla/tabla').then(m => m.TablaPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Chef'] } // Administradores y Chefs
  },
  
  // Página de acceso denegado
  { 
    path: 'access-denied', 
    loadComponent: () => import('./pages/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  }
];
```

### 4. Componente de Navegación (`NavbarComponent`)

**Ubicación**: `src/app/components/navbar/navbar.ts`

**Funcionalidades**:
- ✅ Muestra estado de autenticación
- ✅ Navegación dinámica según roles
- ✅ Información del usuario actual
- ✅ Botón de cerrar sesión
- ✅ Diseño responsive

### 5. Página de Acceso Denegado (`AccessDeniedComponent`)

**Ubicación**: `src/app/pages/access-denied/access-denied.ts`

- ✅ Interfaz amigable para usuarios sin permisos
- ✅ Opciones de navegación
- ✅ Diseño moderno y responsive

## 🎯 Matriz de Permisos

| Ruta | Administrador | Chef | Usuario |
|------|---------------|------|---------|
| `/` (Home) | ✅ | ✅ | ✅ |
| `/login` | ❌* | ❌* | ❌* |
| `/users` | ✅ | ❌ | ❌ |
| `/formulario` | ✅ | ✅ | ❌ |
| `/tabla` | ✅ | ✅ | ❌ |
| `/access-denied` | ✅ | ✅ | ✅ |

*Solo usuarios no autenticados pueden acceder al login

## 🔧 Cómo Usar

### 1. Iniciar Sesión
1. Navegar a `/login`
2. Usar una de las credenciales predefinidas
3. El sistema redirigirá automáticamente según el rol

### 2. Navegación
- La barra de navegación muestra solo las opciones disponibles según el rol
- Los enlaces se ocultan automáticamente si no tienes permisos

### 3. Cerrar Sesión
- Usar el botón "Cerrar Sesión" en la barra de navegación
- El sistema limpiará la sesión y redirigirá al login

## 🚀 Pruebas Recomendadas

### Escenario 1: Usuario No Autenticado
1. Ir a cualquier ruta protegida (ej: `/users`)
2. ✅ Debe redirigir a `/login`
3. ✅ Después del login debe volver a la ruta original

### Escenario 2: Usuario Chef
1. Login con `chef@recetario.com` / `chef123`
2. ✅ Puede acceder a `/formulario` y `/tabla`
3. ❌ No puede acceder a `/users`
4. ✅ Ve página de acceso denegado si intenta acceder a `/users`

### Escenario 3: Usuario Administrador
1. Login con `admin@recetario.com` / `123456`
2. ✅ Puede acceder a todas las rutas
3. ✅ Ve todos los enlaces en la navegación

### Escenario 4: Persistencia de Sesión
1. Iniciar sesión
2. Cerrar el navegador
3. Abrir nuevamente y ir a la aplicación
4. ✅ Debe mantener la sesión activa

## 📁 Estructura de Archivos

```
src/app/
├── services/
│   └── auth.service.ts          # Servicio de autenticación
├── guards/
│   ├── auth.guard.ts           # Guard de autenticación
│   ├── role.guard.ts           # Guard de roles
│   └── guest.guard.ts          # Guard para usuarios no autenticados
├── components/
│   └── navbar/
│       └── navbar.ts           # Componente de navegación
├── pages/
│   └── access-denied/
│       └── access-denied.ts    # Página de acceso denegado
└── app.routes.ts               # Configuración de rutas
```

## 🎨 Mejoras Implementadas

- ✅ **Diseño Moderno**: Gradientes, sombras y animaciones
- ✅ **Responsive**: Adaptable a dispositivos móviles
- ✅ **UX Mejorada**: Mensajes claros y navegación intuitiva
- ✅ **Persistencia**: La sesión se mantiene entre recargas
- ✅ **Seguridad**: Protección robusta de rutas
- ✅ **Escalabilidad**: Fácil agregar nuevos roles y rutas

## 🔮 Próximas Mejoras Sugeridas

1. **Integración con Backend**: Conectar con API real
2. **Refresh Tokens**: Implementar renovación automática de tokens
3. **Roles Dinámicos**: Cargar roles desde el servidor
4. **Auditoría**: Log de accesos y acciones
5. **Multi-idioma**: Soporte para internacionalización
6. **Temas**: Modo oscuro/claro
7. **Notificaciones**: Sistema de notificaciones en tiempo real

---

¡El sistema está listo para usar! 🎉
