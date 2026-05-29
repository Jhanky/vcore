# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Sistema CRM para empresas de energía solar en Colombia. Desarrollado con Laravel 13 + Inertia.js + React + TypeScript.

## Comandos Comunes

```bash
# Desarrollo local (inicia servidor, queue, logs y vite simultáneamente)
npm run dev

# Instalar dependencias
composer install && npm install

# Migraciones y seeders
php artisan migrate
php artisan db:seed

# Tests
npm run test          # Tests Laravel
npx vitest            # Tests React

# Linting
./vendor/bin/pint     # PHP (Laravel Pint)
npx eslint            # JS/TS
npx tsc --noEmit      # TypeScript

# Build producción
npm run build
```

## Arquitectura

### Backend (Laravel)
- **Autenticación**: Laravel Breeze con Inertia.js (React)
- **Permisos**: spatie/laravel-permission (RBAC con roles y permisos)
- **PDF**: barryvdh/laravel-dompdf + spatie/browsershot
- **AI**: laravel/ai (integración con IA para cotizaciones)
- **API de productos**: laravel/sanctum para tokens MCP

### Modelos Principales
```
Client          → Lead/Cotizando/Cliente/Perdido (estados de venta)
Project         → Proyectos con estados, transiciones e hitos
Quotation       → Cotizaciones asociadas a clientes
Panel/Inverter/Battery → Catálogo de productos solares
```

### Rutas Importantes
- `/clients` - Gestión de clientes
- `/quotations` - Sistema de cotización
- `/projects` - Seguimiento de proyectos con estados dinámicos
- `/access-control` - Users + Roles unificado
- `/settings` - Tema, contraseña, tokens MCP

### Frontend (React + Inertia)
- Componentes en `resources/js`
- Páginas en `resources/js/Pages`
- Tailwind CSS para estilos
- Recharts para gráficos
- Lucide React para iconos
- React Window para listas virtualesizadas

### Base de Datos
- SQLite (desarrollo)
- 250 clientes de prueba en seeders (ciudades de Colombia)

## Patrones

- Controllers devuelven componentes Inertia (`return Inertia::render(...)`)
- Requests validan con `Illuminate\Http\Request`
- Modelos usan `HasFactory` y relaciones Eloquent
- Soft deletes para Client y Project