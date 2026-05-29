# Sistema de Roles y Permisos (RBAC) - VatioCore

VatioCore utiliza un sistema de Control de Acceso Basado en Roles (RBAC) gestionado de forma dinámica por el Administrador.

## 1. Arquitectura de Permisos

El sistema se basa en tres entidades principales:
1. **Usuarios**: Personas con acceso al sistema.
2. **Roles**: Conjunto de permisos (ej. Administrador, Vendedor, Instalador).
3. **Permisos**: Acciones atómicas que se pueden realizar (ej. `clientes.crear`, `cotizaciones.aprobar`).

## 2. Roles Iniciales (Predefinidos)

| Rol | Descripción | Permisos Clave |
| :--- | :--- | :--- |
| **Super Admin** | Acceso total al sistema. | Todos los permisos + Gestión de roles. |
| **Comercial** | Gestión de clientes y ventas. | `clientes.*`, `cotizaciones.*`, `proyectos.ver`. |
| **Técnico / Instalador** | Ejecución de proyectos en campo. | `proyectos.ver`, `evidencias.crear`, `novedades.crear`. |
| **Logística** | Gestión de materiales y stock. | `suministros.*`, `proyectos.ver`. |

---

## 3. Gestión Dinámica (Panel de Administración)

El Administrador podrá:
- **Crear nuevos Roles**: Definir nombres personalizados (ej. "Gerente de Zona").
- **Asignar Permisos**: Mediante una matriz de checkboxes, vincular permisos específicos a cada rol.
- **Asignar Roles a Usuarios**: Un usuario puede tener uno o múltiples roles.

### Matriz de Permisos Sugerida:

#### Clientes
- `ver clientes`
- `crear clientes`
- `editar clientes`
- `eliminar clientes`

#### Cotizaciones
- `ver cotizaciones`
- `crear cotizaciones`
- `editar cotizaciones`
- `enviar cotizaciones`
- `aprobar cotizaciones`

#### Proyectos
- `ver proyectos`
- `editar proyectos`
- `gestionar documentos técnicos`
- `finalizar proyectos`

#### Suministros
- `ver inventario`
- `gestionar stock`
- `asignar suministros a proyectos`

#### Evidencias (Campo)
- `ver evidencias`
- `subir fotos/evidencias`
- `reportar novedades`

---

## 4. Seguridad y Middleware

- **Protección de Rutas**: Cada ruta del backend (Laravel) y componente del frontend (React) estará protegido por el permiso correspondiente.
- **Interfaz React**: Los elementos de la UI (botones de edición, menús) se ocultarán automáticamente si el usuario no tiene el permiso necesario.
- **Auditoría**: Se registrará qué usuario realizó acciones críticas (ej. quién aprobó una cotización o quién cambió un rol).
