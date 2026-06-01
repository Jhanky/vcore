# Módulo de Seguimiento ante Air-e

## Descripción general

Este módulo permite gestionar y hacer seguimiento completo del proceso de conexión de proyectos fotovoltaicos ante **Air-e S.A.S. E.S.P.**, operador de red en los departamentos de Atlántico, Magdalena y La Guajira. El proceso está regulado por la **Resolución CREG 174 de 2021** y sus complementarias.

El módulo se integra con el script de proxy existente que consulta el transformador asociado a un usuario mediante su NIC (Número de Identificación del Cliente), eliminando la necesidad de ingresar manualmente los datos de red eléctrica.

---

## Integración con el proxy NIC → Punto de conexión

### ¿Qué hace el proxy?

El script de proxy consulta el endpoint interno de Air-e (`BUSINESS_CREG_030.PuntoConexion`) usando el **NIC del recibo de energía** del cliente (campo `matricula` en la respuesta) y retorna los datos técnicos del transformador y punto de suministro asociado. Esta información es fundamental porque Air-e la exige en el formulario de solicitud de conexión simplificada.

### Respuesta real del proxy

```json
{
  "__type": "BUSINESS_CREG_030.PuntoConexion",
  "P_TIPO_CONSULTA": 0,
  "P_CODIGO": null,
  "codigo": 65761270,
  "matricula": "0202R",
  "localizacion": "CRA 1 #  27A - 98 EDIFICIO AQUARELLA",
  "potencia_nominal": "300",
  "tens_pri": 13.8,
  "tens_sec": "208/120",
  "propiedad": "1",
  "nom_propiedad": "PARTICULAR",
  "REL_CON_1": 0,
  "NUM_TRAFO_CT": 0,
  "CapacidadDisp": "150",
  "latitud": 11.2374976,
  "longitud": -74.2190352,
  "circuito": null,
  "subestacion": null,
  "AMARADO": "1",
  "MismoPunto": "1",
  "PDISPONIBLE": "1",
  "Kdisponible": null
}
```

### Mapeo de campos a datos del proyecto

| Campo del proxy | Tipo | Descripción | Uso en el módulo |
|---|---|---|---|
| `matricula` | string | NIC / matrícula del punto de suministro | Identificador principal del cliente |
| `codigo` | number | Código interno Air-e del punto de conexión | Referencia para trámites y PQR |
| `localizacion` | string | Dirección del predio | Pre-llena dirección del proyecto |
| `potencia_nominal` | string (kVA) | Potencia nominal del transformador | Base para calcular disponibilidad |
| `CapacidadDisp` | string (kVA) | Capacidad disponible en el transformador | Indicador preliminar de disponibilidad |
| `tens_pri` | number (kV) | Tensión primaria del transformador | Determina nivel de tensión (NT2 = 13.8 kV) |
| `tens_sec` | string (V) | Tensión secundaria entregada al usuario | Confirma NT1 si es 208/120 V o 220/127 V |
| `nom_propiedad` | string | Tipo de propietario del transformador | Referencia para tipo de contrato |
| `PDISPONIBLE` | string ("0"/"1") | Indica si hay disponibilidad de potencia | Pre-califica disponibilidad de red |
| `CapacidadDisp` | string (kVA) | Capacidad disponible restante | Compara contra potencia FV del proyecto |
| `latitud` / `longitud` | number | Coordenadas GPS del transformador | Visualización en mapa del módulo |
| `AMARADO` | string ("0"/"1") | Punto amarrado a otro circuito | Alerta si es "1": puede haber restricciones |
| `circuito` | string \| null | Código del circuito eléctrico | Se requiere para el formulario; puede venir nulo |
| `subestacion` | string \| null | Subestación que alimenta el circuito | Dato complementario para el estudio |

### Lógica de pre-calificación de disponibilidad

Con los datos del proxy, el módulo calcula un **índice de disponibilidad preliminar** antes de que el usuario ingrese al portal de Air-e:

```
potencia_proyecto_kw    ← ingresada por el usuario (kW AC)
potencia_proyecto_kva   = potencia_proyecto_kw / 0.9   (factor de potencia estimado)
capacidad_disponible    = parseFloat(CapacidadDisp)     (kVA del proxy)
porcentaje_ocupacion    = (potencia_proyecto_kva / capacidad_disponible) * 100
```

| `PDISPONIBLE` | Porcentaje de ocupación | Resultado probable | Acción sugerida |
|:---:|:---:|---|---|
| `"0"` | cualquiera | 🔴 **Rojo** | Preparar estudio de conexión simplificado |
| `"1"` | < 50 % | 🟢 **Verde** | Proceder con solicitud simplificada |
| `"1"` | 50 % – 80 % | 🟡 **Amarillo** | Proceder, pero revisar condiciones específicas |
| `"1"` | > 80 % | 🟠 **Naranja/Rojo** | Probable estudio de conexión requerido |

> **Importante:** este cálculo es **orientativo**. El color oficial lo asigna el portal de Air-e al ingresar el número de transformador. La clasificación preliminar sirve para preparar documentos con anticipación.

### Casos especiales a manejar

**`circuito` viene nulo:** ocurre en algunos puntos de suministro. El módulo debe mostrar un aviso indicando que el código de circuito deberá obtenerse manualmente desde el portal de Air-e o solicitarlo por correo al OR antes de radicar. El campo queda editable.

**`AMARADO = "1"`:** indica que el transformador está "amarrado" a otro circuito, lo que puede implicar restricciones técnicas adicionales. El módulo muestra una alerta informativa recomendando validar con Air-e antes de dimensionar el sistema.

**`Kdisponible` viene nulo:** campo reservado por Air-e para un indicador de capacidad adicional no siempre poblado. No bloquea el flujo; se ignora si es nulo.

### Determinación del nivel de tensión (NT)

El nivel de tensión se infiere automáticamente de `tens_pri`:

```
tens_pri < 1 kV    →  NT1  (baja tensión — red secundaria)
tens_pri = 13.8 kV →  NT2  (media tensión — red de distribución primaria)
tens_pri > 13.8 kV →  NT3  (alta tensión)
```

El nivel de tensión define los plazos de revisión técnica del OR (ver Etapa 3).

### Cómo se usa en el módulo al crear un proyecto

Al crear un nuevo proyecto, el usuario ingresa únicamente el **NIC** (matrícula). El módulo invoca el proxy y pre-llena automáticamente:

| Campo del formulario Air-e | Campo proxy | Transformación |
|---|---|---|
| Dirección del predio | `localizacion` | Directo |
| Código del transformador / circuito | `codigo` | Directo (como referencia interna) |
| Circuito eléctrico | `circuito` | Directo (o manual si es nulo) |
| Nivel de tensión | `tens_pri` | Inferido según tabla anterior |
| Capacidad disponible en red | `CapacidadDisp` | Convertido a kVA |
| Coordenadas para mapa | `latitud` / `longitud` | Visualización interna |

> **Nota:** Si el proxy no retorna resultado para un NIC dado, el módulo muestra un aviso solicitando verificar la matrícula en la factura física. Aparece como "Matrícula" o "NIC" en la parte superior derecha de la factura Air-e.

---

## Clasificación del proyecto

Antes de iniciar el trámite, el módulo clasifica automáticamente el proyecto según la potencia instalada declarada, determinando el tipo de solicitante y el procedimiento que aplica:

| Tipo | Capacidad nominal | Procedimiento |
|---|---|---|
| **AGPE pequeño** | ≤ 100 kW | Sin estudio de conexión |
| **AGPE mediano** | 100 kW – 1 MW | Con estudio de conexión simplificado |
| **AGGE** | 1 MW – 5 MW | Con estudio de conexión simplificado |
| **GD pequeño** | ≤ 100 kW (ESP) | Sin estudio de conexión |
| **GD mediano** | 100 kW – 1 MW (ESP) | Con estudio de conexión simplificado |

La clasificación también determina si el proyecto requiere medidor bidireccional (obligatorio cuando hay entrega de excedentes a la red) y si aplica contrato de conexión formal con Air-e.

---

## Etapas del proceso y seguimiento

### Etapa 0 — Consulta de disponibilidad de red

**Responsable:** Integrador / instalador  
**Canal:** Portal web de Air-e (sistema de trámite en línea)

El módulo usa los campos `PDISPONIBLE` y `CapacidadDisp` del proxy para mostrar un semáforo preliminar antes de acceder al portal de Air-e. Ver la lógica completa en la sección **Lógica de pre-calificación de disponibilidad**.

- **`PDISPONIBLE = "0"`** → resultado probable 🔴 rojo (sin disponibilidad declarada)
- **`PDISPONIBLE = "1"` y ocupación < 50 %** → probable 🟢 verde
- **`PDISPONIBLE = "1"` y ocupación 50–80 %** → probable 🟡 amarillo
- **`PDISPONIBLE = "1"` y ocupación > 80 %** → probable 🟠 naranja/rojo

> Este indicador es orientativo. El color oficial lo asigna el portal de Air-e al ingresar el código del transformador (`codigo` del proxy).

**Campos a registrar:**

```
fecha_consulta_disponibilidad    date
color_resultado                  enum: verde | amarillo | naranja | rojo
porcentaje_resultado             decimal
requiere_estudio_conexion        boolean   ← true si color es rojo
archivo_resultado_pdf            file
```

**Alerta automática:** Si el color es rojo y no se ha cargado el estudio de conexión en 30 días, el módulo genera una alerta al responsable del proyecto.

---

### Etapa 1 — Radicación de solicitud

**Responsable:** Integrador  
**Canal:** Sistema de trámite en línea Air-e  
**Plazo para el OR:** No aplica (responsabilidad del solicitante)

En esta etapa se diligencia y radica el formulario oficial ante Air-e, adjuntando toda la documentación técnica requerida.

**Documentos requeridos según tipo de proyecto:**

| Documento | AGPE ≤100 kW | AGPE >100 kW | AGGE | GD ≤100 kW | GD >100 kW |
|---|:---:|:---:|:---:|:---:|:---:|
| Formulario de conexión simplificado | ✓ | ✓ | ✓ | ✓ | ✓ |
| Estudio de conexión simplificado | — | ✓ | ✓ | — | ✓ |
| Cert. experiencia/capacitación instalador | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manual dispositivo control inyección a red | ✓ (si aplica) | ✓ (si aplica) | ✓ | — | — |
| Archivo consulta disponibilidad de red | ✓ | — | — | ✓ | — |
| Certificado norma inversores | ✓ | ✓ | ✓ | ✓ | ✓ |
| Diagrama unifilar + esquema protecciones | ✓ | ✓ | ✓ | ✓ | ✓ |
| Distancias de seguridad a redes MT | ✓ | ✓ | ✓ | ✓ | ✓ |

**Campos a registrar:**

```
fecha_radicacion                 date
numero_radicado                  string     ← asignado por Air-e al radicar
documentos_adjuntos[]            file[]
observaciones_radicacion         text
```

---

### Etapa 2 — Revisión de completitud de documentación

**Responsable:** Air-e (Operador de Red)  
**Plazo legal del OR:**

| Tipo de proyecto | Revisión OR | Subsanación solicitante | Revisión post-subsanación |
|---|:---:|:---:|:---:|
| AGPE / GD ≤ 100 kW | **2 días hábiles** | 5 días hábiles | 2 días hábiles |
| AGPE / GD / AGGE > 100 kW | **5 días hábiles** | 5 días hábiles | 5 días hábiles |

**Campos a registrar:**

```
fecha_inicio_revision_completitud    date      ← igual a fecha_radicacion
fecha_limite_respuesta_or            date      ← calculada automáticamente
estado                               enum: en_revision | subsanacion_requerida | aprobada | negada
fecha_notificacion_subsanacion       date
fecha_limite_subsanacion_solicitante date      ← calculada: +5 días hábiles
observaciones_or                     text
fecha_entrega_subsanacion            date
documentos_subsanacion[]             file[]
```

**Cálculo automático de fechas límite:** El módulo calcula `fecha_limite_respuesta_or` excluyendo sábados, domingos y festivos colombianos (Ley 51 de 1983).

**Alerta automática:** 1 día hábil antes del vencimiento del plazo del OR, si no se ha registrado respuesta.

---

### Etapa 3 — Verificación técnica

**Responsable:** Air-e (Operador de Red)  
**Plazo legal del OR:**

| Condición | Revisión OR | Subsanación solicitante | Revisión post-subsanación |
|---|:---:|:---:|:---:|
| NT1 (baja tensión) ≤ 100 kW | **5 días hábiles** | 5 días hábiles | 5 días hábiles |
| NT1 ≤ 10 kW sin inyección | **3 días hábiles** | 5 días hábiles | 2 días hábiles |
| NT2 / NT3 o > 100 kW | **10 días hábiles** | 10 días hábiles | 5 días hábiles |
| Con estudio de conexión simplificado | **20 días hábiles** | 10 días hábiles | 5 días hábiles |

El OR verifica: cumplimiento de normas para inversores, certificados de capacitación del instalador, sistema de control de no inyección (si aplica), límites de tensión en NT1 y cumplimiento de reglas de protecciones.

**Campos a registrar:**

```
fecha_inicio_verificacion_tecnica    date
fecha_limite_respuesta_or            date      ← calculada automáticamente
estado                               enum: en_revision | subsanacion_requerida | aprobada | negada
motivo_negacion                      text      ← si estado = negada
fecha_notificacion_or                date
observaciones_tecnicas               text
fecha_entrega_subsanacion_tecnica    date
documentos_subsanacion_tecnica[]     file[]
```

> Si la solicitud es negada, el solicitante puede iniciar un nuevo trámite desde cero en cualquier momento. El módulo permite duplicar el expediente como punto de partida.

---

### Etapa 4 — Aprobación y contrato de conexión

**Responsable:** Air-e emite aprobación; integrador firma contrato  
**Vigencia de la aprobación:**

| Tipo | Vigencia | Prórroga máxima |
|---|:---:|:---:|
| AGPE / GD | **6 meses** | 3 meses adicionales |
| AGGE | **12 meses** | 12 meses adicionales |

El contrato de conexión aplica solo en los casos definidos en el artículo 16 de la CREG 174/2021. El plazo para la firma es de **15 días hábiles** desde la aprobación.

**Campos a registrar:**

```
fecha_aprobacion                     date
fecha_vencimiento_aprobacion         date      ← calculada: +6 o +12 meses
prorroga_solicitada                  boolean
fecha_vencimiento_prorrogada         date
numero_contrato_conexion             string
fecha_firma_contrato                 date
fecha_limite_firma_contrato          date      ← calculada: +15 días hábiles
archivo_aprobacion                   file
archivo_contrato_firmado             file
```

**Alertas automáticas:**
- 30 días antes del vencimiento de vigencia → aviso de gestionar entrada en operación o solicitar prórroga
- 10 días antes del vencimiento → alerta crítica
- 10 días antes del vencimiento del plazo de firma de contrato → alerta firma pendiente

---

### Etapa 5 — Visita técnica y energización

**Responsable:** Air-e (visita) / Integrador (coordinación)  
**Plazo legal del OR:** 5 días hábiles desde la solicitud de entrada en operación

El instalador radica la solicitud de visita técnica a través del sistema de trámite en línea una vez que la instalación esté lista para operar.

**Para proyectos ≤ 100 kW:**
- Primera visita sin costo.
- Si se requieren ajustes, Air-e programa segunda visita sin costo en los 7 días hábiles siguientes.
- Tercera visita en adelante tiene costo (según CREG 225/1997): urbano ~$149.164 COP / rural ~$208.066 COP.

**Para proyectos > 100 kW:**
- Air-e coordina un plan de pruebas con mínimo 48 horas de antelación.
- Primera visita sin costo; visitas adicionales tienen costo.

**Campos a registrar:**

```
fecha_solicitud_visita               date
fecha_limite_visita_or               date      ← calculada: +5 días hábiles
fecha_visita_programada              date
resultado_visita_1                   enum: aprobada | ajustes_requeridos | no_realizada
observaciones_visita_1               text
fecha_visita_2                       date      ← si aplica
resultado_visita_2                   enum: aprobada | ajustes_requeridos
costo_visitas_adicionales            decimal
fecha_energizacion                   date      ← fecha real de conexión a la red
```

---

### Etapa 6 — Medidor bidireccional y operación

**Responsable:** Air-e (instalación del medidor) / Comercializador (facturación)

El cambio a medidor bidireccional con registro horario es obligatorio para todos los proyectos que entreguen excedentes a la red, según la CREG 038 de 2014. Este medidor registra tanto la energía importada de la red como los excedentes exportados, habilitando el esquema de **créditos de energía**.

**Campos a registrar:**

```
requiere_medidor_bidireccional       boolean   ← true si exporta excedentes
fecha_solicitud_cambio_medidor       date
fecha_instalacion_medidor            date
numero_medidor_nuevo                 string
tipo_medidor                         string
fecha_inicio_facturacion_neta        date
comercializador_excedentes           string    ← empresa que compra los excedentes
numero_contrato_excedentes           string
```

---

## Modelo de estados del proyecto

El módulo gestiona el estado global del expediente a través de la siguiente máquina de estados:

```
BORRADOR
  └─► CONSULTA_DISPONIBILIDAD
        └─► RADICADO
              ├─► REVISION_COMPLETITUD
              │     ├─► SUBSANACION_COMPLETITUD
              │     └─► VERIFICACION_TECNICA
              │           ├─► SUBSANACION_TECNICA
              │           └─► APROBADO
              │                 ├─► CONTRATO_PENDIENTE
              │                 ├─► EN_VIGENCIA
              │                 │     └─► VISITA_SOLICITADA
              │                 │           └─► ENERGIZADO ✓
              │                 └─► PRORROGADO
              └─► NEGADO (reiniciable)
```

---

## Alertas y notificaciones

El módulo genera alertas automáticas según los siguientes eventos:

| Evento | Anticipación | Tipo |
|---|---|---|
| Vencimiento plazo OR sin respuesta | 1 día hábil antes | ⚠️ Advertencia |
| Vencimiento plazo subsanación solicitante | 2 días hábiles antes | ⚠️ Advertencia |
| Vencimiento plazo firma contrato | 10 días hábiles antes | ⚠️ Advertencia |
| Vencimiento vigencia aprobación | 30 días antes | ℹ️ Informativa |
| Vencimiento vigencia aprobación | 10 días antes | 🔴 Crítica |
| Proyecto negado | Inmediata | ℹ️ Informativa |
| Energización exitosa | Inmediata | ✅ Éxito |

---

## Tiempos totales estimados

| Tipo de proyecto | Escenario sin subsanaciones | Escenario con subsanaciones |
|---|---|---|
| AGPE ≤ 100 kW (color verde) | 15 – 20 días hábiles | 35 – 45 días hábiles |
| AGPE ≤ 100 kW (color rojo) | 6 – 7 meses | 8 – 9 meses |
| AGPE 100 kW – 1 MW | 6 – 7 meses | 8 – 9 meses |
| AGGE 1 MW – 5 MW | 7 – 9 meses | 10 – 12 meses |

---

## Marco normativo

| Norma | Descripción |
|---|---|
| **Resolución CREG 174 de 2021** | Marco principal: procedimientos de conexión AGPE, AGGE y GD |
| **Circular CREG 021 de 2022** | Lineamientos para el estudio de conexión simplificado |
| **Acuerdo CNO 1749** | Requisitos de protecciones para conexión al SIN |
| **CREG 038 de 2014** | Medición y créditos de energía para autogeneradores |
| **CREG 135 de 2021** | Condiciones para venta de excedentes al comercializador |
| **RETIE vigente** | Reglamento técnico de instalaciones eléctricas |
| **Ley 1715 de 2014** | Marco legal FNCER y beneficios tributarios |

---

## Notas de implementación

- **Días hábiles:** todos los plazos están expresados en días hábiles colombianos. El cálculo debe excluir sábados, domingos y los festivos definidos en la Ley 51 de 1983 y sus modificaciones.
- **Prórroga de vigencia:** debe solicitarse antes del vencimiento a través del sistema de trámite en línea de Air-e, diligenciando el formulario correspondiente. No es automática.
- **Proxy NIC:** si el proxy retorna error o datos desactualizados, el sistema debe permitir el ingreso manual del número de circuito y transformador, los cuales también pueden obtenerse directamente de la factura del servicio.
- **Versión regulatoria:** este documento refleja el estado regulatorio a mayo de 2026. La CREG puede expedir resoluciones que modifiquen plazos o procedimientos; se recomienda verificar actualizaciones en [gestornormativo.creg.gov.co](https://gestornormativo.creg.gov.co).