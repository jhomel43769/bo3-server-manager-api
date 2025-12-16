# API Documentation

Documentación detallada de todos los endpoints disponibles en el BO3 Zombies Server Manager API.

## Base URL

```
http://localhost:3000/api
```

## Formato de Respuesta

Todas las respuestas exitosas siguen este formato:

```json
{
  "status": "success",
  "message": "Mensaje descriptivo (opcional)",
  "data": {}
}
```

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "status": "fail | error",
  "message": "Descripción del error"
}
```

## Endpoints

### 1. Health Check

Verifica el estado del sistema y valida la configuración necesaria para ejecutar servidores.

**Endpoint:** `GET /health`

**Headers:** Ninguno requerido

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "status": "healthy | warning | error",
    "message": "Descripción del estado",
    "system": {
      "platform": "win32",
      "nodeVersion": "v18.17.0"
    },
    "checks": {
      "envVar": {
        "valid": true,
        "path": "C:\\Games\\Call of Duty Black Ops III"
      },
      "directory": {
        "valid": true,
        "message": "Accesible"
      },
      "executable": {
        "valid": true,
        "message": "Listo"
      },
      "configFile": {
        "valid": true,
        "message": "Listo"
      }
    }
  }
}
```

**Posibles estados:**

- `healthy`: Todo correcto, sistema listo para operar
- `warning`: Falta server.cfg pero se generará automáticamente
- `error`: Falta configuración crítica (BO3_PATH o CustomClient_Server.bat)

**Ejemplo curl:**

```bash
curl http://localhost:3000/api/health
```

---

### 2. Obtener Opciones Disponibles

Retorna todos los mapas y modos de juego disponibles en el sistema.

**Endpoint:** `GET /server/available-options`

**Headers:** Ninguno requerido

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "maps": [
      {
        "code": "zm_zod",
        "name": "Shadows of Evil",
        "dlc": "Base Game"
      },
      {
        "code": "zm_factory",
        "name": "The Giant",
        "dlc": "The Giant"
      }
    ],
    "gameModes": [
      {
        "code": "zclassic",
        "name": "Classic"
      },
      {
        "code": "zstandard",
        "name": "Standard"
      }
    ]
  }
}
```

**Ejemplo curl:**

```bash
curl http://localhost:3000/api/server/available-options
```

---

### 3. Iniciar Servidor

Inicia un nuevo servidor de BO3 Zombies con la configuración especificada. Solo se puede ejecutar una instancia a la vez.

**Endpoint:** `POST /server/start`

**Headers:**
```
Content-Type: application/json
```

**Body (todos opcionales):**

```json
{
  "mapCode": "zm_zod",
  "gameType": "zclassic",
  "serverName": "Mi Servidor de Zombies",
  "password": "",
  "rconPassword": "admin123",
  "port": 27017,
  "maxPlayers": 4
}
```

**Parámetros:**

| Campo | Tipo | Default | Validación | Descripción |
|-------|------|---------|------------|-------------|
| mapCode | string | "zm_zod" | Debe estar en lista de mapas válidos | Código del mapa a cargar |
| gameType | string | "zclassic" | "zclassic" o "zstandard" | Modo de juego |
| serverName | string | "BO3 Zombies Server" | Max 50 chars, sin caracteres especiales | Nombre del servidor |
| password | string | "" | Max 50 chars | Contraseña del juego (vacío = público) |
| rconPassword | string | "admin" | Max 50 chars | Contraseña RCON para administración |
| port | number | 27017 | 1024-65535 | Puerto del servidor |
| maxPlayers | number | 4 | 1-4 | Jugadores máximos |

**Response 200:**

```json
{
  "status": "success",
  "message": "Servidor iniciado correctamente en zm_zod",
  "data": {
    "process": {
      "success": true,
      "pid": 15234,
      "message": "Servidor iniciado con éxito"
    },
    "config": "C:\\Games\\BO3\\server.cfg"
  }
}
```

**Response 400 - Validación:**

```json
{
  "success": false,
  "status": "fail",
  "message": "El mapa \"zm_invalid\" no es válido"
}
```

**Response 409 - Conflicto:**

```json
{
  "success": false,
  "status": "fail",
  "message": "El servidor ya está corriendo (PID: 15234)"
}
```

**Response 500 - Error del sistema:**

```json
{
  "success": false,
  "status": "error",
  "message": "La variable de entorno BO3_PATH no está definida"
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/server/start \
  -H "Content-Type: application/json" \
  -d '{
    "mapCode": "zm_castle",
    "gameType": "zclassic",
    "serverName": "Der Eisendrache Server",
    "maxPlayers": 4,
    "port": 27017
  }'
```

---

### 4. Detener Servidor

Detiene el servidor en ejecución de forma forzada.

**Endpoint:** `POST /server/stop`

**Headers:** Ninguno requerido

**Response 200:**

```json
{
  "status": "success",
  "message": "Servidor detenido correctamente",
  "data": {
    "success": true,
    "message": "Servidor detenido correctamente"
  }
}
```

**Response 409 - No hay servidor:**

```json
{
  "success": false,
  "status": "fail",
  "message": "No hay ningún servidor corriendo para detener"
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/server/stop
```

---

### 5. Estado del Servidor

Consulta el estado actual del servidor.

**Endpoint:** `GET /server/status`

**Headers:** Ninguno requerido

**Response 200:**

```json
{
  "status": "success",
  "message": "Estado del servidor obtenido",
  "data": {
    "online": true,
    "pid": 15234
  }
}
```

**Cuando no hay servidor activo:**

```json
{
  "status": "success",
  "message": "Estado del servidor obtenido",
  "data": {
    "online": false,
    "pid": null
  }
}
```

**Ejemplo curl:**

```bash
curl http://localhost:3000/api/server/status
```

---

### 6. Obtener Logs

Retorna los últimos logs del servidor desde el buffer en memoria.

**Endpoint:** `GET /server/logs`

**Headers:** Ninguno requerido

**Query Parameters:**

| Parámetro | Tipo | Default | Validación | Descripción |
|-----------|------|---------|------------|-------------|
| lines | number | 50 | 1-500 | Número de líneas a retornar |

**Response 200:**

```json
{
  "status": "success",
  "requestedLines": 50,
  "results": 15,
  "data": [
    {
      "timestamp": "2024-12-16T10:30:15.123Z",
      "level": "stdout",
      "message": "Iniciando proceso: zm_zod (zclassic)"
    },
    {
      "timestamp": "2024-12-16T10:30:16.456Z",
      "level": "stdout",
      "message": "Loading map zm_zod..."
    },
    {
      "timestamp": "2024-12-16T10:30:20.789Z",
      "level": "stderr",
      "message": "Warning: Missing texture file"
    }
  ]
}
```

**Campos de log:**

- `timestamp`: ISO 8601 timestamp
- `level`: "stdout" o "stderr"
- `message`: Mensaje del log

**Ejemplo curl:**

```bash
# Obtener últimas 100 líneas
curl "http://localhost:3000/api/server/logs?lines=100"

# Usar default (50 líneas)
curl http://localhost:3000/api/server/logs
```

---

### 7. Obtener Configuración

Lee la configuración actual del archivo server.cfg.

**Endpoint:** `GET /server/config`

**Headers:** Ninguno requerido

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "serverName": "BO3 Server",
    "port": 27017,
    "maxPlayers": 4,
    "rconPassword": "admin123",
    "password": ""
  }
}
```

**Nota:** Si el archivo server.cfg no existe, retorna valores por defecto.

**Ejemplo curl:**

```bash
curl http://localhost:3000/api/server/config
```

---

### 8. Actualizar Configuración

Actualiza el archivo server.cfg sin iniciar el servidor. Útil para pre-configurar antes de iniciar.

**Endpoint:** `POST /server/config`

**Headers:**
```
Content-Type: application/json
```

**Body (todos opcionales):**

```json
{
  "serverName": "Nuevo Nombre del Servidor",
  "password": "mipassword123",
  "rconPassword": "nuevoadmin",
  "port": 27018,
  "maxPlayers": 2
}
```

**Parámetros:**

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-------------|
| serverName | string | Max 50 chars, sin caracteres especiales | Nombre del servidor |
| password | string | Max 50 chars o vacío | Contraseña del juego |
| rconPassword | string | Max 50 chars | Contraseña RCON |
| port | number | 1024-65535 | Puerto del servidor |
| maxPlayers | number | 1-4 | Jugadores máximos |

**Nota:** Todos los campos son opcionales. Solo se actualizarán los campos enviados.

**Response 200:**

```json
{
  "status": "success",
  "message": "Configuración actualizada con éxito",
  "data": {
    "success": true,
    "filePath": "C:\\Games\\BO3\\server.cfg"
  }
}
```

**Response 400 - Validación:**

```json
{
  "success": false,
  "status": "fail",
  "message": "Puerto inválido: 70000. Use un rango entre 1024 y 65535."
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/server/config \
  -H "Content-Type: application/json" \
  -d '{
    "serverName": "Mi Servidor Pro",
    "maxPlayers": 3,
    "port": 27020
  }'
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 400 | Error de validación o parámetros inválidos |
| 404 | Ruta no encontrada |
| 409 | Conflicto (servidor ya iniciado/no hay servidor para detener) |
| 500 | Error interno del servidor |

## Caracteres No Permitidos

Los siguientes caracteres están bloqueados en todos los inputs de texto para prevenir inyección de comandos:

```
; & | ` $ ( ) { } [ ] < > \
```

## Rate Limiting

Actualmente no hay rate limiting implementado. Se recomienda implementarlo en producción.

## Autenticación

Actualmente no hay autenticación implementada. Todos los endpoints son públicos. Se recomienda implementar autenticación antes de exponer la API públicamente.

## CORS

CORS está habilitado para todos los orígenes. Configura según tus necesidades en producción.

## WebSocket Support

No hay soporte para WebSocket actualmente. Los logs deben consultarse mediante polling del endpoint `/server/logs`.

## Ejemplos de Flujos Completos

### Flujo: Iniciar servidor desde cero

```bash
# 1. Verificar health
curl http://localhost:3000/api/health

# 2. Consultar mapas disponibles
curl http://localhost:3000/api/server/available-options

# 3. Iniciar servidor
curl -X POST http://localhost:3000/api/server/start \
  -H "Content-Type: application/json" \
  -d '{"mapCode": "zm_castle", "maxPlayers": 4}'

# 4. Verificar estado
curl http://localhost:3000/api/server/status

# 5. Monitorear logs
curl "http://localhost:3000/api/server/logs?lines=50"
```

### Flujo: Cambiar configuración y reiniciar

```bash
# 1. Detener servidor actual
curl -X POST http://localhost:3000/api/server/stop

# 2. Actualizar configuración
curl -X POST http://localhost:3000/api/server/config \
  -H "Content-Type: application/json" \
  -d '{"serverName": "Nuevo Nombre", "port": 27018}'

# 3. Iniciar con nuevo mapa
curl -X POST http://localhost:3000/api/server/start \
  -H "Content-Type: application/json" \
  -d '{"mapCode": "zm_moon"}'
```

### Flujo: Pre-configurar sin iniciar

```bash
# 1. Configurar server.cfg
curl -X POST http://localhost:3000/api/server/config \
  -H "Content-Type: application/json" \
  -d '{
    "serverName": "Origins 24/7",
    "password": "secreto",
    "rconPassword": "admin456",
    "maxPlayers": 4,
    "port": 27017
  }'

# 2. Verificar configuración
curl http://localhost:3000/api/server/config

# 3. Iniciar cuando estés listo
curl -X POST http://localhost:3000/api/server/start \
  -H "Content-Type: application/json" \
  -d '{"mapCode": "zm_tomb"}'
```