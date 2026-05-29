# Funcionalidades Principales - VatioCore

Detalle profundo de los módulos clave del sistema.

## 1. Módulo de Clientes (CRM)
- **Dashboard de Leads**: Visualización de los clientes más potenciales.
- **Clasificación Automática**: Algoritmo simple para calificar clientes según interés y capacidad instalable.
- **Historial**: Log de llamadas, visitas y correos.

## 2. Calculadora de Cotizaciones
- **Configurador de Sistema**:
  - Selección de número de paneles.
  - Selección de tipo de inversor.
  - Cálculo de estructura y cableado automático.
- **Proyección de Generación**: Estimación de kWh mensuales según la ubicación.
- **Workflow de Aprobación**: Botón de "Aceptar Propuesta" que dispara la creación del proyecto.

## 3. Centro de Proyectos
- **Diagrama de Proceso**: Seguimiento visual de las fases del proyecto.
- **Repositorio Documental**: Planos, permisos de red, y contratos.
- **Asignación de Personal**: Definir qué técnicos están a cargo.

## 4. Gestión de Suministros (Catálogo Técnico)
Este módulo alimenta la calculadora de cotizaciones y el control de costos.

- **Componentes Base**:
  - **Paneles Solares**: Registro de marca, potencia (Wp), eficiencia y costo por unidad.
  - **Inversores**: Registro de tipo (Microinversor, Central, Híbrido), capacidad (kW) y costo.
  - **Baterías**: Capacidad de almacenamiento (kWh), ciclos de vida y costo.
- **Suministros Secundarios**: Estructuras de montaje, cableado AC/DC, protecciones eléctricas.
- **Cálculo de Margen**: Diferencia entre el precio de venta en la cotización y el costo total de los suministros + mano de obra.
- **Control de Inventario**: Stock disponible para asegurar que los componentes cotizados puedan ser instalados.

## 5. App de Campo (Evidencias)
- **Captura Multimodal**: Fotos de la instalación, fotos del medidor, firmas digitales.
- **Reporte de Novedades**: Formulario rápido para reportar retrasos o problemas técnicos (ej. "techo en mal estado").
- **Geolocalización**: Registro del lugar de la evidencia.
