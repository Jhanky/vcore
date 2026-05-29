# Requerimientos del Sistema - VatioCore

Este documento detalla los requerimientos funcionales y no funcionales para el SaaS de paneles solares.

## 1. Requerimientos Funcionales

### RF1: Gestión de Clientes
- El sistema debe permitir el registro de clientes con datos básicos (nombre, contacto, dirección).
- El sistema debe clasificar a los clientes según su potencial (ej. Scoring de 1 a 10).
- Debe permitir el seguimiento de la interacción con el cliente.

### RF2: Cotizaciones Fotovoltaicas
- El sistema debe calcular el valor de los sistemas fotovoltaicos basado en la potencia deseada (kWp).
- Debe permitir el seguimiento del estado de la propuesta (Borrador, Enviada, Aprobada, Rechazada).
- Debe generar un resumen técnico de la cotización.

### RF3: Gestión de Proyectos
- Una cotización aprobada debe poder convertirse en un proyecto.
- El sistema debe gestionar etapas: Planeación, Ejecución, Pruebas, Finalizado.
- Almacenamiento de documentación técnica por proyecto.

### RF4: Gestión de Suministros (Catálogo Técnico)
- Inventario y catálogo de componentes principales: **Paneles, Inversores y Baterías**.
- Registro de especificaciones técnicas (Wp, kW, kWh) y precios de compra.
- Asignación de suministros a proyectos específicos para control de costos.

### RF5: Control de Presupuesto
- Cálculo automático de costos proyectados vs. costos reales basados en suministros.

### RF6: Evidencias y Novedades
- Carga de imágenes y documentos como evidencia de avance.
- Registro de novedades o incidencias con notificaciones.

## 2. Requerimientos No Funcionales

### RNF1: Estética y UX
- La interfaz debe ser "Premium", moderna y responsiva.
- Uso de animaciones sutiles y modo oscuro opcional.

### RNF2: Rendimiento
- El sistema debe ser rápido (monolito optimizado con Inertia.js).

### RF7: Autenticación y Seguridad
- La página principal (raíz) del sistema debe ser un portal de Login.
- El usuario debe poder autenticarse usando **Correo Electrónico** o **Nombre de Usuario**.
- Validación de contraseña segura.
- Diseño de login premium con fondo dinámico o minimalista.
