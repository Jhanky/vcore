# Laravel AI SDK en Vcore

Este proyecto utiliza el **Laravel AI SDK** para integrar funcionalidades de Inteligencia Artificial.

## Configuración de OpenRouter

Para utilizar OpenRouter como proveedor predeterminado, se han realizado los siguientes ajustes:

1.  **Instalación**: Se instaló el paquete `laravel/ai`.
2.  **Configuración**: El archivo `config/ai.php` ya incluye el driver `openrouter`.
3.  **Variables de Entorno**: En el archivo `.env` se agregaron las siguientes variables:
    ```env
    AI_DEFAULT_PROVIDER=openrouter
    OPENROUTER_API_KEY=tu_clave_aqui
    ```

## Comandos Útiles

### Crear un Agente
Para generar un nuevo agente (clase que encapsula la lógica de IA):
```bash
php artisan make:agent MiNuevoAgente
```
O si necesitas salida estructurada (JSON):
```bash
php artisan make:agent MiNuevoAgente --structured
```

### Ejemplo de Uso en Código

```php
use App\Ai\Agents\MiNuevoAgente;

// Instanciar y enviar un prompt
$respuesta = MiNuevoAgente::make()
    ->prompt('¿Cuál es la capacidad instalada ideal para un hogar promedio?');

echo $respuesta;
```

## Proveedores Soportados
Puedes cambiar el proveedor en tiempo de ejecución o en el `.env`:
- `openai`
- `anthropic`
- `gemini`
- `openrouter` (configurado actualmente)
- `ollama` (local)

## Almacenamiento de Conversaciones
El SDK está configurado para almacenar el historial en la base de datos (SQLite en este proyecto). Las tablas creadas son:
- `agent_conversations`
- `agent_conversation_messages`
