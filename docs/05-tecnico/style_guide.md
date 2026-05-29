# Guía de Estilo Visual - VatioCore (Premium & Modern)

Este documento define la identidad visual de VatioCore para asegurar una experiencia de usuario de alto nivel, profesional y moderna.

## 1. Paleta de Colores (The Solar Eclipse Palette)

Utilizaremos una combinación de tonos oscuros profundos con acentos vibrantes inspirados en la energía solar.

| Elemento | Dark Mode (HEX) | Light Mode (HEX) | Uso |
| :--- | :--- | :--- | :--- |
| **Primary (Solar Gold)** | `#FBBF24` | `#D97706` | Botones principales, acentos. |
| **Secondary (Electric Blue)** | `#3B82F6` | `#2563EB` | Enlaces, indicadores técnicos. |
| **Success (Eco Green)** | `#10B981` | `#059669` | Éxito, aprobaciones. |
| **Danger (Power Red)** | `#EF4444` | `#DC2626` | Alertas, errores. |
| **Background** | `#0F172A` | `#F8FAFC` | Fondo principal de la app. |
| **Surface / Card** | `#1E293B` | `#FFFFFF` | Tarjetas, paneles, contenedores. |
| **Text Primary** | `#F8FAFC` | `#0F172A` | Texto principal. |
| **Text Secondary** | `#94A3B8` | `#64748B` | Texto secundario/descriptivo. |

---

## 2. Diseño Responsivo (Mobile First)

Para asegurar que el personal de campo pueda usar la app eficientemente desde sus teléfonos:

- **Navegación**: En escritorio usamos Sidebar; en móvil, un menú "Drawer" lateral o una barra de navegación inferior para acciones rápidas.
- **Tablas**: Las tablas de datos complejos se transformarán en "Cards" (tarjetas) individuales en pantallas móviles.
- **Inputs**: Campos de formulario amplios con fuentes de mínimo 16px para evitar el zoom automático en iOS/Android.
- **Touch Targets**: Botones con un área mínima de 44x44px para facilitar la interacción táctil.


## 2. Tipografía

La tipografía debe ser limpia, legible y con un aire tecnológico.

- **Fuente Principal**: `Outfit` o `Inter` (Google Fonts).
- **Headings**: `Outfit` (Semi-bold a Bold) - Proporciona un look moderno y geométrico.
- **Body**: `Inter` (Regular) - Optimizado para legibilidad en pantallas.
- **Monospace**: `JetBrains Mono` - Para datos técnicos o IDs de proyecto.

---

## 3. Iconografía y Componentes

- **Estilo**: Lucide-React (iconos lineales, grosor de 1.5px o 2px).
- **Bordes**: Radio de curvatura amplio (`rounded-xl` / `12px` o `16px`).
- **Sombras**: Sombras suaves y profundas (`shadow-2xl`) para dar profundidad sobre el fondo oscuro.
- **Efectos**: **Glassmorphism** en el Sidebar y el Navbar (blur de 12px).

---

## 4. Animaciones y Micro-interacciones

Para lograr el efecto "Premium", las animaciones deben ser sutiles y fluidas.

- **Alertas (Toasts)**:
  - **Entrada**: `Slide In` desde la derecha con un ligero `Spring` (rebote).
  - **Salida**: `Fade Out` con reducción de escala.
  - **Progreso**: Una línea delgada en la base del toast que se consume según el tiempo de vida.
- **Botones**: 
  - Hover: Ligero aumento de escala (1.02x) y cambio de brillo (brightness 1.1).
  - Click: Reducción de escala momentánea (0.95x).
- **Transiciones de Página**: Desvanecimiento suave (`fade-in`) con un ligero desplazamiento hacia arriba (`slide-up`).

---

## 5. Diseño de Alertas y Estados

- **Premium Alert**: No usar el `window.alert` básico. Implementar modales con fondo desenfocado (Backdrop Blur).
- **Loading States**: Shimmer effect (esqueleto de carga) con un gradiente animado que se mueve horizontalmente.

---

## 6. Layout (Estructura)

- **Sidebar (Lateral Dinámico)**: 
  - **Estado Reposo**: Se muestra como una barra delgada con solo iconos para maximizar el espacio de trabajo.
  - **Interacción Hover**: Al pasar el cursor por el borde izquierdo o los iconos, el Sidebar se expande suavemente con una transición de `0.3s` mostrando las etiquetas de texto.
  - **Efecto Visual**: Fondo con Glassmorphism (`blur`), borde sutil y resaltado de ítem activo con el color `Solar Gold`.
- **Dashboard**: Uso de "Bento Grids" para mostrar métricas (clientes, cotizaciones, suministros).
