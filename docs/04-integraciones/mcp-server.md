# MCP Server - Vcore

Servidor MCP (Model Context Protocol) para el proyecto Vcore.

## Setup

### 1. Generar Token desde la Web

1. Inicia sesión en Vcore
2. Ve a **Configuración** → **Token MCP**
3. Haz clic en **"Generar Token"**
4. Copia el token generado (solo se muestra una vez)

### 2. Configurar en Claude Code

Crear/editar `claude_desktop_config.json` según tu SO:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vcore": {
      "command": "php",
      "args": ["app/Mcp/Transport/StdioServer.php"],
      "env": {
        "MCP_TOKEN": "tu_token_aqui"
      },
      "cwd": "C:\\Users\\abc\\Documents\\Desarrollos\\Energy\\Vcore"
    }
  }
}
```

### 3. Reiniciar Claude Code

Reinicia Claude Code para que cargue la nueva configuración.

## Verificar Funcionamiento

```
/claude — Try asking "List all available tools"
```

Luego prueba:
```
/claude — Use the vcore tool to list all clients
```

## Herramientas de Clientes

| Herramienta | Descripción |
|------------|-------------|
| `list_clients` | Lista clientes con filtros |
| `get_client` | Detalles por ID |
| `create_client` | Crea cliente |
| `update_client` | Actualiza por ID |
| `delete_client` | Elimina por ID |

## Inicio Manual

```bash
php artisan mcp:serve
```

## Estructura

```
app/Mcp/
├── McpServer.php
└── Transport/
    └── StdioServer.php
app/Console/Commands/
├── McpServerCommand.php
└── GenerateMcpTokenCommand.php
```
