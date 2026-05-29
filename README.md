# Vcore - Sistema de Gestión de Clientes

Sistema de gestión de clientes desarrollado con Laravel e Inertia.js para el control y seguimiento de clientes en el mercado colombiano de energía solar.

> **Uso exclusivo para Colombia** - Este proyecto está diseñado y configurado únicamente para el mercado de clientes en Colombia.

## Descripción

Vcore es un sistema CRM especializado en la gestión de clientes para empresas de energía solar en Colombia. Permite administrar leads, cotizaciones, interacciones con clientes y seguimiento del proceso de venta.

## Características

- Gestión completa de clientes (CRUD)
- Seguimiento de interacciones con clientes
- Sistema de cotización
- Clasificación de clientes por estado (Lead, Cotizando, Cliente, Perdido)
- Datos de consumo energético y facturación mensual

## Tecnologías

- **Backend:** Laravel 11
- **Frontend:** Inertia.js + React + TypeScript
- **Base de datos:** SQLite
- **Estilos:** Tailwind CSS

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- SQLite

## Instalación

```bash
composer install
npm install
npm run dev
php artisan migrate
php artisan db:seed
```

## Datos de Prueba

El sistema incluye un seeder con 250 clientes de prueba distribuidos en diferentes ciudades de Colombia:

- Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales, Ibagué, Pasto, Neiva, Villavicencio, Santa Marta, Montería, Armenia, Soacha, Valledupar, Tunja, Floridablanca

## País

Este proyecto es de uso **exclusivo para Colombia**. Todos los datos, ciudades y configuraciones están pensados para el mercado colombiano.