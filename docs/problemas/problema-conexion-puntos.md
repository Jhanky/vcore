# Problema: Integración API Puntos de Conexión (Air-e / Afinia)

## Estado Actual
**Fecha:** 2026-05-07
**Estado:** ✅ RESUELTO

---

## Solución Implementada

Se creó un **servicio proxy local** (FastAPI) en puerto 8002 que usa `curl` del sistema para hacer las llamadas a las APIs externas, evitando el problema de SSL legacy.

### Archivos Creados

1. **`services/connection-proxy/main.py`** - Servicio FastAPI
2. **`services/connection-proxy/requirements.txt`** - Dependencias Python

### Cómo Funciona

```
Laravel → localhost:8002 → curl sistema → Air-e/Afinia APIs
```

### Iniciar el Proxy

```bash
cd services/connection-proxy
pip install -r requirements.txt
python main.py
# o
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

### Verificar

```bash
curl http://localhost:8002/health
# Respuesta: {"status":"ok"}
```

---

## Descripción del Problema Original

El problema era que las APIs externas de Air-e y Afinia usan configuración SSL antigua que no es compatible con PHP/Laravel, causando errores como:

```
cURL error 35: TLS connect error: error:0A000152:SSL routines::unsafe legacy renegotiation disabled
```

El curl del sistema funciona porque tiene configuración SSL diferente.

---

## Síntomas Originales

1. El NIC del cliente se guarda correctamente en la tabla `clients`
2. El `ClientObserver` se ejecuta correctamente después de crear el cliente
3. La consulta a las APIs de Air-e y Afinia falla con errores SSL

---

## Errores Observados (Antes)

### Error 1: SSL Legacy Renegotiation
```
cURL error 35: TLS connect error: error:0A000152:SSL routines::unsafe legacy renegotiation disabled
```

**Causa:** El servidor de Air-e utiliza una configuración SSL antigua que requiere renegociación legacy, pero las versiones recientes de curl/PHP bloquean esto por seguridad.

**Entorno donde funciona:** El comando curl directo desde terminal sí funciona con los mismos parámetros.

### Error 2: localhost:8002 (Obsoleto)
```
cURL error 7: Failed to connect to localhost port 8002
```

**Causa:** El código original apuntaba a un servicio proxy local en puerto 8002 que ya no existía.

---

## APIs Externas

### Air-e
- **URL:** `https://servicios.air-e.com/creg030/WFConsulta.aspx/ListaPuntoConexion`
- **Región:** Costa Caribe (Atlántico, Magdalena, Cesar, La Guajira)

### Afinia
- **URL:** `https://servicios.energiacaribemar.co/Autogeneracion/WFConsulta.aspx/ListaPuntoConexion`
- **Región:** Costa Caribe

---

## Integración con Laravel (Vcore)

### Archivos Involucrados

1. **`app/Services/ConnectionPointService.php`** - Servicio que consulta el proxy
2. **`app/Observers/ClientObserver.php`** - Observer que detecta creación de clientes
3. **`app/Providers/AppServiceProvider.php`** - Registra el observer
4. **`app/Models/ConnectionPoint.php`** - Modelo del punto de conexión
5. **`app/Models/Client.php`** - Modelo del cliente

### Flujo

```
Client::create()
    ↓
ClientObserver::created()
    ↓
ConnectionPointService::syncForClient()
    ↓
POST http://localhost:8002/puntos-conexion
    ↓
Proxy (curl del sistema)
    ↓
Air-e / Afinia API
    ↓
Filtrar AMARADO = "1"
    ↓
connectionPoint()->updateOrCreate()
```

---

## Mantenimiento

### Verificar Proceso Corriendo

```bash
netstat -ano | findstr "8002"
```

### Detener Servicio

```bash
taskkill //F //IM python.exe
```

### Ver Logs

```bash
tail -50 storage/logs/laravel.log | grep -i "ConnectionPoint\|ClientObserver"
```

### Verificar Connection Point

```sql
SELECT * FROM connection_points WHERE client_id = <id_cliente>;
```

---

*Última actualización: 2026-05-07*
