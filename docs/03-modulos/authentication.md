# Módulo Autenticación - Auth

## 1. Descripción General

El sistema de autenticación usa Laravel Breeze con Inertia.js. Permite login con email o username, registro, logout, y gestión de perfil de usuario.

## 2. Stack Tecnológico

- **Backend**: Laravel Sanctum + Breeze
- **Frontend**: React + Inertia
- **Estilos**: Tailwind CSS con theme variables

## 3. Modelos de Datos

### 3.1 User (extendido)
```php
class User extends Authenticatable
{
    use HasProfilePhoto;

    protected $fillable = [
        'name',
        'username',           // Campo extendido
        'email',
        'password',
        'profile_photo_path', // Avatar
    ];

    // Relaciones
    public function clients()      → hasMany(Client)
    public function quotations()   → hasMany(Quotation)
}
```

### 3.2 Agentes IA (extensión futura)
```php
// Campo extendido en users
'agent_conversations' → hasMany(AgentConversation)
```

## 4. Vistas

### 4.1 Login (Auth/Login.tsx)
- Email o Username
- Contraseña
- Recordar sesión
- Link a registro
- Diseño glassmorphism con gradiente

### 4.2 Registro (Auth/Register.tsx)
- Nombre
- Username (único)
- Email
- Contraseña
- Confirmar contraseña

### 4.3 Perfil (Profile/Edit.tsx)
- Información personal (nombre, email)
- Avatar
- Cambio de contraseña
- Eliminar cuenta

## 5. Middleware

### 5.1 HandleInertiaRequests
```php
public function share(Request $request)
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
}
```

### 5.2 Rutas Protegidas
```php
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', ...);
    Route::resource('clients', ...);
    Route::resource('quotations', ...);
    Route::resource('supplies', ...);
});
```

## 6. Rutas

```
# Guest routes (no auth)
GET  /login    → login (GuestLayout)
POST /login    → authenticate
GET  /register → register (GuestLayout)
POST /register → store

# Auth routes
POST /logout  → destroy (cierre de sesión)

# Profile
GET  /profile → edit (AuthenticatedLayout)
PUT  /profile → update
```

## 7. Gestión de Sesión

### 7.1 Remember Me
```typescript
const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
});
```

### 7.2 CSRF Protection
Laravel requiere token CSRF para POST requests:
```typescript
// bootstrap.ts
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

## 8. Tema (Dark/Light)

### 8.1 Toggle en Sidebar
```typescript
const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.add('light');
    localStorage.setItem('theme', theme);
}, [theme]);
```

### 8.2 Variables CSS
```css
:root {
    --solar-gold: #FBBF24;
    --bg-main: #0F172A;
    --text-primary: #F8FAFC;
}

.light {
    --bg-main: #F1F5F9;
    --text-primary: #0F172A;
}
```

## 9. Permisos y Roles (Futuro)

### 9.1 Roles Propuestos
| Rol | Descripción |
|-----|-------------|
| Admin | Acceso total |
| Asesor | CRUD clientes y cotizaciones |
| Tecnico | Solo lectura + evidencias |
| Visualizador | Solo lectura |

### 9.2 Matriz de Permisos
| Recurso | Admin | Asesor | Tecnico | Visualizador |
|---------|-------|--------|---------|-------------|
| Clients | CRUD | CRUD | R | R |
| Quotations | CRUD | CRUD | R | R |
| Supplies | CRUD | R | R | R |
| Projects | CRUD | CRUD | CRUD | R |
| Evidencias | CRUD | R | CRUD | R |

## 10. Autenticación API (Sanctum)

### 10.1 Configuración
```php
// config/sanctum.php
return [
    'expiration' => null, // Tokens no expiran
    'middleware' => [
        'authenticate_session' => true,
        'encrypt_cookies' => true,
    ],
];
```

### 10.2 Uso Futuro
Para apps móviles o APIs REST:
```bash
POST /login → { token: "..." }
Authorization: Bearer {token}
```

## 11. Componentes

| Componente | Descripción |
|------------|-------------|
| GuestLayout | Layout sin sidebar (login/register) |
| AuthenticatedLayout | Layout con sidebar y header |
| TextInput | Input memoizado |
| InputError | Mensaje de error |
| InputLabel | Label semántico |
| PrimaryButton | Botón principal |
| SecondaryButton | Botón secundario |
| DangerButton | Botón de peligro (eliminar cuenta) |

## 12. Hooks Relacionados

| Hook | Descripción |
|------|-------------|
| usePage() | Acceso a props globales de Inertia |
| useForm() | Manejo de formularios |
| router.post() | Submit con CSRF automático |

## 13. Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO AUTH                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐     ┌─────────┐     ┌──────────────────┐     │
│   │  /login │────►│ Breeze  │────►│ Authenticated   │     │
│   │  GET    │     │  Auth   │     │ Layout +         │     │
│   └─────────┘     └─────────┘     │ Dashboard        │     │
│        │               │         └──────────────────┘     │
│        │               │                                    │
│        ▼               ▼                                    │
│   ┌─────────┐     ┌─────────┐                              │
│   │ /register│     │  user   │                              │
│   │  GET    │────►│ session │                              │
│   └─────────┘     └─────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 14. Seguridad Implementada

- CSRF token en todos los forms POST
- Password hashing con bcrypt
- Session expiration configurable
- Rate limiting en intentos de login
- Remember me token seguro
