# Documentación Completa: Cotizaciones

## Tabla de Contenidos
1. [Estructura de una Cotización](#1-estructura-de-una-cotización)
2. [Cálculo de Totales](#2-cálculo-de-totales)
3. [Página de Ver Cotización](#3-página-de-ver-cotización)
4. [Funcionalidad de Editar](#4-funcionalidad-de-editar)
5. [Porcentajes y Valores por Defecto](#5-porcentajes-y-valores-por-defecto)
6. [Ejemplo Completo](#6-ejemplo-completo)
7. [Archivos Involucrados](#7-archivos-involucrados)

---

## 1. Estructura de una Cotización

### 1.1 Productos (Suministros)
Son los componentes físicos del sistema solar:
- **Paneles solares**: Captan la energía solar
- **Inversores**: Convierten corriente continua a alterna
- **Baterías**: Solo para sistemas híbridos (almacenamiento)

Cada producto tiene:
- `product_type`: Tipo (panel, inverter, battery)
- `product_id`: ID del producto en el catálogo
- `quantity`: Cantidad
- `unit_price_cop`: Precio unitario en COP
- `profit_percentage`: Porcentaje de utilidad individual
- `snapshot_brand` / `snapshot_model`: Datos capturados al momento de crear

### 1.2 Items Complementarios
Son servicios y materiales necesarios para la instalación:
- **Mano de obra**: Instalación por kW
- **Material eléctrico**: Cables, conectores, etc. por kW
- **Estructura de soporte**: Para montaje de paneles
- **Trámites y permisos**: Costos fijos de legalización
- **Sobre estructura**: Costos adicionales opcionales

Cada item tiene:
- `description`: Descripción del item
- `category`: Categoría (mano_obra, material, servicio, etc.)
- `quantity`: Cantidad (fija o calculada)
- `unit_measure`: Unidad de medida (kW, panel, trámite, etc.)
- `unit_price_cop`: Precio unitario
- `profit_percentage`: Porcentaje de utilidad individual

---

## 2. Cálculo de Totales

El cálculo sigue un proceso **escalonado** donde cada paso depende del anterior.

### 2.1 Subtotal Base (con Utilidad Individual)

Por cada producto e item se calcula:

```
costo_item = cantidad × precio_unitario
utilidad_item = costo_item × porcentaje_utilidad_item
total_item = costo_item + utilidad_item
```

**Valores por defecto de utilidad individual:**
- Productos (paneles, inversores, baterías): **15%**
- Items (mano de obra, materiales, estructura): **15%**
- Trámites: **10%**
- Sobre estructura: **5%**

```
subtotal = Σ total_item (todos los productos + items)
```

### 2.2 Gestión Comercial

Se aplica sobre el subtotal:

```
gestión_comercial = subtotal × porcentaje_gestión_comercial
```

### 2.3 Subtotal 2

```
subtotal2 = subtotal + gestión_comercial
```

### 2.4 Cálculos sobre Subtotal 2

Todos estos porcentajes se aplican sobre `subtotal2`:

```
administración = subtotal2 × porcentaje_administración
imprevistos = subtotal2 × porcentaje_contingencia
utilidad = subtotal2 × porcentaje_utilidad
```

### 2.5 IVA sobre Utilidad

```
iva_utilidad = utilidad × porcentaje_iva_utilidad
```

### 2.6 Subtotal 3

```
subtotal3 = subtotal2 + administración + imprevistos + utilidad + iva_utilidad
```

### 2.7 Retenciones

```
retenciones = subtotal3 × porcentaje_retenciones
```

### 2.8 TOTAL FINAL

```
total = subtotal3 + retenciones
```

---

## 3. Página de Ver Cotización

### 3.1 Ubicación
Ruta: `/cotizaciones/{id}` (ej: `/cotizaciones/123`)

### 3.2 Componentes de la Vista

#### Tarjeta: Información del Cliente
- Nombre del cliente
- Email
- Teléfono
- Dirección completa
- Tipo de cliente (Residencial, Comercial, Industrial)
- Documento (Cédula o NIT)

#### Tarjeta: Información del Proyecto
- Nombre del proyecto
- Tipo de sistema (On-grid, Off-grid, Híbrido)
- Tipo de red (Monofásico, Trifásico)
- Potencia total en kW
- Indica si requiere financiamiento

#### Tarjeta: Información de la Cotización
- Vendedor responsable
- Fecha de creación
- Fecha de vencimiento
- Estado (Borrador, Enviada, Aprobada, Rechazada)
- **Valor Total** (destacado en verde)
- Valor por vatio

### 3.3 Sección: Suministros (Tabla)
Muestra todos los productos del sistema:
| Columna | Descripción |
|---------|-------------|
| Tipo | Icono + tipo (Panel Solar, Inversor, Batería) |
| Descripción | Marca y modelo del producto |
| Cantidad | Número de unidades |
| Precio Unitario | Precio por unidad en COP |
| % Utilidad | Porcentaje de ganancia |
| Valor Parcial | cantidad × precio |
| Utilidad | Valor de la ganancia |
| Total | Valor Parcial + Utilidad |

### 3.4 Sección: Items Complementarios (Tabla)
Muestra servicios y materiales:
| Columna | Descripción |
|---------|-------------|
| Descripción | Nombre del item |
| Cantidad | Cantidad (puede ser automática) |
| Unidad | kW, panel, trámite, etc. |
| Precio Unitario | Costo por unidad |
| % Utilidad | Porcentaje de ganancia |
| Valor Parcial | cantidad × precio |
| Utilidad | Valor de la ganancia |
| Total | Valor Parcial + Utilidad |

### 3.5 Sección: Resumen de Costos
Muestra el desglose escalonado:
- Subtotal
- Gestión Comercial (% editable)
- **Subtotal 2** (en verde)
- Administración (% editable)
- Imprevistos (% editable)
- Utilidad (% editable)
- IVA sobre la utilidad (19%)
- **Subtotal 3** (en verde)
- Retenciones (% editable)
- **TOTAL FINAL** (en verde, destacado)

---

## 4. Funcionalidad de Editar

### 4.1 Métodos de Edición

#### Método 1: Doble clic en filas de tablas
Al hacer doble clic en cualquier fila de:
- **Suministros**: Se activan campos editables inline
- **Items Complementarios**: Se activan campos editables inline

**Campos editables en Suministros:**
- Descripción (con selector de productos)
- Cantidad
- Precio Unitario
- % Utilidad

**Campos editables en Items:**
- Descripción
- Cantidad (para items con cálculo automático no se permite edición)
- Unidad
- Precio Unitario
- % Utilidad

#### Método 2: Doble clic en porcentajes del Resumen
Los siguientes porcentajes son editables directamente en el resumen:
- % Gestión Comercial
- % Administración
- % Imprevistos
- % Utilidad
- % Retención

### 4.2 Cambios Automáticos

Al editar ciertos campos, el sistema recalcula automáticamente:

| Campo Editado | Recalcula Automáticamente |
|---------------|---------------------------|
| Cantidad de paneles | Potencia total del proyecto |
| Potencia del proyecto | Cantidad de paneles, cantidad de inversores, items por kW |
| Precio de productos | Totales individuales, subtotales, total |
| % Utilidad | Totales individuales, subtotales, total |
| Porcentajes del resumen | Todos los subtotales y el total |

### 4.3 Recálculo de Items Complementarios

Los items complementarios tienen cantidades **automáticas** según su tipo:

| Item | Cantidad Automática |
|------|---------------------|
| Mano de obra | = Potencia total en kW |
| Material eléctrico | = Potencia total en kW |
| Estructura de soporte | = Número de paneles |
| Trámites | = 1 (fijo) |
| Sobre estructura | = 1 (fijo) |

Cuando cambias la potencia o cantidad de paneles, estos items se recalculan automáticamente.

### 4.4 Botón "Guardar Cambios"

Cuando hay cambios sin guardar:
1. Aparece un botón verde **"Guardar Cambios"** en el header
2. Al hacer clic, se construye el payload con todos los datos
3. Se envía al backend via `PUT /api/quotations/{id}`
4. Se muestra toast de éxito o error

### 4.5 Advertencia de Cambios Sin Guardar

Si intentas navegar away (volver a la lista, recargar, etc.) con cambios sin guardar:
1. Aparece un modal preguntando qué deseas hacer
2. Opciones:
   - **Seguir editando**: Cierra el modal, mantén los cambios
   - **Ignorar cambios**: Descarta todo y navega

### 4.6 Agregar/Eliminar Items

#### Agregar Item
- Botón "Añadir Ítem" en la sección de items complementarios
- Crea un nuevo item con valores por defecto:
  - Descripción: "Nuevo Ítem"
  - Cantidad: 1
  - Unidad: "und"
  - Precio Unitario: 0
  - % Utilidad: 35%
  - Categoría: "material"

#### Eliminar Item
- Icono de papelera que aparece al hacer hover sobre la fila
- Solo para items complementarios (no para productos)

---

## 5. Porcentajes y Valores por Defecto

### 5.1 Porcentajes Configurables

| Parámetro | Valor por Defecto | Descripción |
|-----------|-------------------|-------------|
| % Utilidad | 8% | Ganancia del proyecto |
| % IVA sobre Utilidad | 19% | Impuesto sobre la utilidad |
| % Gestión Comercial | 2% | Costo de gestión comercial |
| % Administración | 8% | Gastos administrativos |
| % Contingencia | 3% | Imprevistos |
| % Retenciones | 2.5% | Retenciones fiscales |

### 5.2 Utilidad Individual por Item

| Tipo | % Utilidad |
|------|------------|
| Productos (paneles, inversores, baterías) | 15% |
| Items (mano de obra, materiales, estructura) | 15% |
| Trámites | 10% |
| Sobre estructura | 5% |

### 5.3 Valores de Costos por Defecto

| Concepto | Valor por Defecto | Unidad de Medida |
|----------|-------------------|------------------|
| Mano de obra | $375,000 COP | por kW instalado |
| Trámites y permisos | $7,000,000 COP | fijo |
| Estructura de soporte | $130,000 COP | por panel |
| Material eléctrico | $345,000 COP | por kW instalado |

---

## 6. Ejemplo Completo

### 6.1 Datos del Sistema
- Potencia: 10 kWp
- Paneles: 26 unidades (panel de 400W c/u → 10,400W)
- Inversor: 1 unidad
- Sin baterías (sistema On-Grid)

### 6.2 Costos Base de Productos

| Producto | Cantidad | Precio Unitario | Costo Total | Utilidad (15%) | Total |
|----------|----------|-----------------|-------------|----------------|-------|
| Paneles | 26 | $800,000 | $20,800,000 | $3,120,000 | $23,920,000 |
| Inversor | 1 | $5,000,000 | $5,000,000 | $750,000 | $5,750,000 |

**Subtotal Productos = $29,670,000**

### 6.3 Costos Base de Items

| Item | Cantidad | Costo Unitario | Costo Total | Utilidad (15%) | Total |
|------|----------|----------------|-------------|----------------|-------|
| Mano de obra | 10 kW | $375,000/kW | $3,750,000 | $562,500 | $4,312,500 |
| Material eléctrico | 10 kW | $345,000/kW | $3,450,000 | $517,500 | $3,967,500 |
| Estructura soporte | 26 paneles | $130,000/panel | $3,380,000 | $507,000 | $3,887,000 |
| Trámites | 1 | $7,000,000 | $7,000,000 | $700,000 | $7,700,000 |

**Subtotal Items = $19,867,000**

### 6.4 Cálculo Total de Suministros

```
subtotal = $29,670,000 + $19,867,000 = $49,537,000
```

### 6.5 Cálculo Escalonado

| Paso | Concepto | Cálculo | Valor |
|------|----------|---------|-------|
| 1 | Subtotal | (suma de todos los totales) | $49,537,000 |
| 2 | Gestión Comercial (2%) | $49,537,000 × 0.02 | $990,740 |
| 3 | **Subtotal2** | $49,537,000 + $990,740 | **$50,527,740** |
| 4 | Administración (8%) | $50,527,740 × 0.08 | $4,042,219 |
| 5 | Imprevistos (3%) | $50,527,740 × 0.03 | $1,515,832 |
| 6 | Utilidad (8%) | $50,527,740 × 0.08 | $4,042,219 |
| 7 | IVA Utilidad (19%) | $4,042,219 × 0.19 | $768,022 |
| 8 | **Subtotal3** | $50,527,740 + $4,042,219 + $1,515,832 + $4,042,219 + $768,022 | **$60,896,032** |
| 9 | Retenciones (2.5%) | $60,896,032 × 0.025 | $1,522,401 |
| 10 | **TOTAL** | $60,896,032 + $1,522,401 | **$62,418,433** |

---

## 7. Archivos Involucrados

### 7.1 Backend

| Archivo | Descripción |
|---------|-------------|
| `app/Services/QuotationService.php` | Lógica de cálculo de totales (método `calculateTotals()`, líneas 204-258) |
| `app/Models/Quotation.php` | Modelo Eloquent con campos de totales y relaciones |
| `app/Http/Controllers/Api/QuotationController.php` | Controlador API para CRUD |
| `database/migrations/*_create_quotations_table.php` | Schema de la tabla quotations |
| `database/migrations/*_create_quotation_products_table.php` | Schema de productos |
| `database/migrations/*_create_quotation_items_table.php` | Schema de items |

### 7.2 Frontend

| Archivo | Descripción |
|---------|-------------|
| `src/features/quotations/components/QuotationDetailPage.jsx` | Página de ver/editar cotización |
| `src/features/quotations/hooks/useQuotationDetail.js` | Hook con lógica de datos y transformación |
| `src/features/quotations/components/QuotationModal.jsx` | Modal para crear/editar (función `transformFormData()`) |
| `src/features/quotations/components/QuotationProductsSection.jsx` | Sección de productos |
| `src/services/quotationService.js` | Servicio API para cotizaciones |
| `src/pages/quotations/QuotationsPage.jsx` | Lista de cotizaciones |

### 7.3 Rutas API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/quotations` | Listar cotizaciones (paginado) |
| GET | `/api/quotations/{id}` | Obtener detalle de cotización |
| POST | `/api/quotations` | Crear nueva cotización |
| PUT | `/api/quotations/{id}` | Actualizar cotización |
| DELETE | `/api/quotations/{id}` | Eliminar cotización |
| PATCH | `/api/quotations/{id}/status` | Cambiar estado |
| GET | `/api/quotations/{id}/pdf` | Descargar PDF |
| GET | `/api/quotation-statuses` | Listar estados disponibles |
| GET | `/api/quotations/statistics` | Estadísticas de cotizaciones |

---

## 8. Estados de una Cotización

| ID | Estado | Descripción |
|----|--------|-------------|
| 1 | Borrador | Cotización creada pero no enviada |
| 2 | Enviada | Cotización enviada al cliente |
| 3 | Aprobada | Cliente aceptó la cotización → se crea proyecto automáticamente |
| 4 | Rechazada | Cliente rechazó la cotización |

---

## 9. Notas Técnicas

1. **Redondeo**: Todos los valores se redondean a 2 decimales.
2. **Porcentajes**: Se almacenan como decimales (0.08 = 8%) en la DB y en el frontend.
3. **IVA**: Se calcula sobre la utilidad, no sobre el subtotal.
4. **Orden de cálculo**: Es importante seguir el orden exacto para evitar errores de precisión.
5. **Snapshot de productos**: Cuando se crea una cotización, se guarda una copia (snapshot) de la marca y modelo del producto para mantener la referencia incluso si el producto original cambia.
6. **Actualización automática**: Los totales se recalculan automáticamente cada vez que se crea o actualiza una cotización tanto en frontend como en backend.
7. **Catálogos**: El frontend cachea los catálogos de paneles, inversores y baterías para evitar peticiones repetitivas.
8. **Sobredimensionamiento de inversores**: Al calcular la cantidad de inversores se aplica un factor de 1.3 para asegurar que el inversor no trabaje al 100% de su capacidad.

---

*Documento creado: Abril 2026*
*Versión: 1.0*