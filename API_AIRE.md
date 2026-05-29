# API Puntos de Conexión

Servicio para consultar puntos de conexión de empresas de energía eléctrica en Colombia.

---

## Arquitectura

```
Laravel (Vcore) → localhost:8002 (Proxy) → curl del sistema → Air-e/Afinia APIs
```

El servicio proxy (FastAPI) corre en puerto 8002 y usa `curl` del sistema para hacer las llamadas a las APIs externas, evitando problemas de SSL que ocurren cuando PHP hace las llamadas directamente.

---

## Servicio Proxy

### Ubicación
```
services/connection-proxy/
├── main.py           # Aplicación FastAPI
└── requirements.txt  # Dependencias Python
```

### Iniciar el Proxy

```bash
cd services/connection-proxy
pip install -r requirements.txt
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

### Verificar que está Corriendo

```bash
curl http://localhost:8002/health
# Respuesta: {"status":"ok"}
```

---

## Endpoints del Proxy

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/puntos-conexion` | Consulta puntos de conexión |
| GET | `/health` | Estado del servicio |

---

## POST `/puntos-conexion`

### Request

```json
{
  "P_CODIGO": "7515988",
  "empresa": "aire"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `P_CODIGO` | string | Código NIC a consultar |
| `empresa` | string | `"aire"` o `"afinia"` (default: `"aire"`) |

### Response

```json
{
  "d": [
    {
      "__type": "BUSINESS_CREG_030.PuntoConexion",
      "codigo": 65761270,
      "matricula": "0202R",
      "localizacion": "CRA 1 # 27A - 98 EDIFICIO AQUARELLA",
      "potencia_nominal": "300",
      "AMARADO": "1",
      "latitud": 11.2374976,
      "longitud": -74.2190352,
      ...
    }
  ]
}
```

> Solo devuelve puntos con `AMARADO: "1"` (puntos amarados/conectados)

---

## Empresas

### Air-e
- **URL:** `https://servicios.air-e.com/creg030/WFConsulta.aspx/ListaPuntoConexion`
- **Región:** Costa Caribe (Atlántico, Magdalena, Cesar, La Guajira)

### Afinia
- **URL:** `https://servicios.energiacaribemar.co/Autogeneracion/WFConsulta.aspx/ListaPuntoConexion`
- **Región:** Costa Caribe

---

## Consumo Directo (Sin Proxy)

Solo usar si PHP/Laravel puede hacer las llamadas directamente. Si hay errores SSL, usar el proxy.

### Air-e (curl directo Windows)

```bash
curl --tlsv1.2 --tls-max 1.2 -X POST "https://servicios.air-e.com/creg030/WFConsulta.aspx/ListaPuntoConexion" ^
  -H "Content-Type: application/json; charset=UTF-8" ^
  -H "Accept: application/json, text/javascript, */*; q=0.01" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: https://servicios.air-e.com" ^
  -H "Referer: https://servicios.air-e.com/creg030/" ^
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" ^
  -d "{\"ObjPuntoConexion\":{\"P_TIPO_CONSULTA\":1,\"P_CODIGO\":\"7515988\"}}"
```

### Afinia (curl directo Windows)

```bash
curl --tlsv1.2 --tls-max 1.2 -X POST "https://servicios.energiacaribemar.co/Autogeneracion/WFConsulta.aspx/ListaPuntoConexion" ^
  -H "Content-Type: application/json; charset=UTF-8" ^
  -H "Accept: application/json, text/javascript, */*; q=0.01" ^
  -H "X-Requested-With: XMLHttpRequest" ^
  -H "Origin: https://servicios.energiacaribemar.co" ^
  -H "Referer: https://servicios.energiacaribemar.co/Autogeneracion/" ^
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" ^
  -d "{\"ObjPuntoConexion\":{\"P_TIPO_CONSULTA\":1,\"P_CODIGO\":\"1234567\"}}"
```

### Headers Requeridos

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json; charset=UTF-8` |
| `Accept` | `application/json, text/javascript, */*; q=0.01` |
| `X-Requested-With` | `XMLHttpRequest` |
| `Origin` | URL base del servicio |
| `Referer` | URL base del servicio + ruta |
| `User-Agent` | Mozilla/5.0... |

### Body del Request

```json
{
  "ObjPuntoConexion": {
    "P_TIPO_CONSULTA": 1,
    "P_CODIGO": "7515988"
  }
}
```

> `P_TIPO_CONSULTA` siempre debe ser `1`

### Nota SSL

Usar `--tlsv1.2 --tls-max 1.2` para evitar error:
```
SSL: UNSAFE_LEGACY_RENEGOTIATION_DISABLED
```

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

### Verificar Guardado

```sql
SELECT * FROM connection_points WHERE client_id = <id_cliente>;
```

### Ver Logs

```bash
tail -50 storage/logs/laravel.log | grep -i "ConnectionPoint\|ClientObserver"
```

---

## Problemas Conocidos

### SSL Legacy Renegotiation Disabled

**Síntoma:** Error `cURL error 35: TLS connect error: error:0A000152:SSL routines::unsafe legacy renegotiation disabled`

**Solución:** Usar el servicio proxy en puerto 8002, que usa curl del sistema (no PHP) y funciona correctamente.

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

O en Linux:
```bash
pkill -f "uvicorn main:app"
```

---

*Última actualización: 2026-05-07*
