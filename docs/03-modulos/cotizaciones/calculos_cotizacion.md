# Documentación de Cálculos de Cotización (VatioCore)

Este documento detalla la lógica matemática y los flujos de cálculo utilizados en el módulo de cotizaciones de VatioCore, específicamente en `QuotationController.php`.

## 1. Cálculos Financieros y Costos (Método `recalculate`)

El cálculo del costo de un proyecto solar se realiza de manera progresiva, agregando diferentes rubros, gastos y utilidades al costo base de los suministros. El proceso se divide en varias etapas o "subtotales":

### 1.1. Subtotal Base (Costo de Equipos y Elementos)
Se calcula sumando el costo de todos los productos (paneles, inversores, baterías) y los ítems complementarios (mano de obra, cableado, etc.). Cada elemento incluye su propio porcentaje de ganancia.

* **Costo por línea de Producto/Ítem:**
  ```text
  Costo = Cantidad * Precio Unitario (COP)
  Subtotal Línea = Costo * (1 + Porcentaje de Ganancia)
  ```
* **Subtotal 1 (Base):**
  ```text
  Subtotal = Σ (Subtotal Línea de todos los Productos e Ítems)
  ```

### 1.2. Gestión Comercial (Subtotal 2)
Al Subtotal Base se le aplica un porcentaje correspondiente a la gestión comercial.

* **Gestión Comercial (cm):**
  ```text
  cm = Subtotal * Porcentaje de Gestión Comercial
  ```
* **Subtotal 2:**
  ```text
  Subtotal 2 = Subtotal + cm
  ```

### 1.3. Estructura AIU (Administración, Imprevistos y Utilidad) y Subtotal 3
Sobre el `Subtotal 2` se calculan los rubros del AIU y se determina el IVA (que solo se aplica sobre la utilidad en este tipo de proyectos).

* **Administración (admin):**
  ```text
  admin = Subtotal 2 * Porcentaje de Administración
  ```
* **Imprevistos (cont):**
  ```text
  cont = Subtotal 2 * Porcentaje de Imprevistos
  ```
* **Utilidad (profit):**
  ```text
  profit = Subtotal 2 * Porcentaje de Utilidad
  ```
* **IVA sobre Utilidad (profit_iva):**
  ```text
  profit_iva = profit * Porcentaje de IVA sobre Utilidad
  ```
* **Subtotal 3:**
  ```text
  Subtotal 3 = Subtotal 2 + admin + cont + profit + profit_iva
  ```

### 1.4. Valor Total y Retenciones
Finalmente, sobre el `Subtotal 3` se pueden aplicar impuestos de retención adicionales para obtener el valor final a pagar por el cliente.

* **Retenciones (wh):**
  ```text
  wh = Subtotal 3 * Porcentaje de Retenciones
  ```
* **Valor Total (total_value):**
  ```text
  Total = Subtotal 3 + wh
  ```

---

## 2. Cálculos Técnicos y Dimensionamiento (Método `analyzeSupplies`)

Además de la parte financiera, el sistema realiza cálculos técnicos para validar que la configuración propuesta cumpla con los requerimientos del cliente.

### 2.1. Potencia Instalada
* **Total Potencia Paneles (kWp):**
  ```text
  Potencia Paneles (kW) = Σ (Cantidad * Potencia del Panel en W) / 1000
  ```
* **Total Capacidad Inversores (kW):**
  ```text
  Capacidad Inversores (kW) = Σ (Cantidad * Potencia del Inversor en kW)
  ```

### 2.2. Ratio DC/AC
Es la relación entre la potencia de los paneles (DC) y la capacidad de los inversores (AC). Un ratio óptimo suele estar entre 1.0 y 1.3.

* **Ratio DC/AC:**
  ```text
  Ratio = Total Potencia Paneles (kW) / Total Capacidad Inversores (kW)
  ```

### 2.3. Estimación de Producción
Se utiliza un promedio de Horas Solares Pico (HSP) para Colombia estimado en **4.5 horas/día**.

* **Producción Anual Estimada (kWh/año):**
  ```text
  Producción Anual = Total Potencia Paneles (kW) * 4.5 * 365
  ```
* **Producción Mensual Estimada (kWh/mes):**
  ```text
  Producción Mensual = Producción Anual / 12
  ```

### 2.4. Cobertura de Consumo
Se calcula el porcentaje del consumo del cliente que es cubierto por la producción del sistema solar.

* **Porcentaje de Cobertura:**
  ```text
  Cobertura = (Producción Mensual / Consumo Mensual del Cliente) * 100
  ```

---

## 3. Consideraciones de la IA para Evaluaciones
El asistente de Inteligencia Artificial (cuando está habilitado) toma los cálculos técnicos anteriores junto con el ratio y la cobertura para proporcionar una recomendación técnica:
- Recomienda reducir paneles si el Ratio DC/AC es > 1.5.
- Recomienda aumentar inversores o reducir paneles si el Ratio DC/AC > 1.3 (Sobredimensionado).
- Recomienda agregar baterías en sistemas Off-grid o Híbridos si la producción sobrepasa significativamente el consumo (exceso de producción).
- Advierte si la cobertura es menor al 80%.
