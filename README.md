# BO3 Zombies Server Manager

API REST para gestionar servidores dedicados de Call of Duty: Black Ops 3 Zombies. Permite iniciar, detener y configurar servidores de forma programática con soporte para todos los mapas oficiales y DLCs.

## Características

- Gestión completa del ciclo de vida del servidor (start/stop)
- Configuración dinámica de parámetros del servidor
- Soporte para todos los mapas de BO3 Zombies (Base Game, DLCs y Zombies Chronicles)
- Monitoreo de logs en tiempo real
- Sistema de health checks
- Validación exhaustiva de inputs
- Buffer de logs con límite configurable

## Requisitos del Sistema

- Node.js 18.x o superior
- Windows (requerido para ejecutar BO3 Server)
- Call of Duty: Black Ops 3 instalado
- CustomClient_Server.bat configurado en la instalación de BO3

## Instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=3000
BO3_PATH="C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
```

**Importante:** `BO3_PATH` debe ser una ruta absoluta hacia la carpeta raíz de tu instalación de Black Ops 3.

4. Verificar la instalación:

```bash
npm run test:config
```

## Uso

### Modo Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000` (o el puerto configurado en `.env`).

### Modo Producción

```bash
npm start
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── bo3-metadata.js       # Mapas y modos de juego disponibles
│   ├── controllers/
│   │   ├── configServer.controller.js
│   │   ├── health.controller.js
│   │   ├── metadata.controller.js
│   │   └── statusServer.controller.js
│   ├── middleware/
│   │   └── errorHandler.js       # Manejador global de errores
│   ├── routes/
│   │   ├── configServer.route.js
│   │   ├── health.routes.js
│   │   ├── metadata.route.js
│   │   └── statusServer.route.js
│   ├── services/
│   │   ├── bo3-process-service.js      # Gestión del proceso del servidor
│   │   ├── config-file-service.js      # Generación de server.cfg
│   │   └── system-validation-services.js
│   ├── utils/
│   │   ├── AppError.js           # Clase para errores operacionales
│   │   ├── log-buffer.js         # Buffer circular de logs
│   │   └── validator.js          # Validadores de input
│   ├── index.js                  # Configuración de Express
│   └── server.js                 # Punto de entrada
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Health Check

**GET** `/api/health`

Verifica el estado del sistema y la validez de la configuración.

```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "message": "Sistema listo para operar",
    "system": {
      "platform": "win32",
      "nodeVersion": "v18.x.x"
    },
    "checks": {
      "envVar": { "valid": true, "path": "C:\\..." },
      "directory": { "valid": true, "message": "Accesible" },
      "executable": { "valid": true, "message": "Listo" },
      "configFile": { "valid": true, "message": "Listo" }
    }
  }
}
```

### Metadata

**GET** `/api/server/available-options`

Obtiene todos los mapas y modos de juego disponibles.

```json
{
  "status": "success",
  "data": {
    "maps": [
      { "code": "zm_zod", "name": "Shadows of Evil", "dlc": "Base Game" },
      { "code": "zm_factory", "name": "The Giant", "dlc": "The Giant" }
    ],
    "gameModes": [
      { "code": "zclassic", "name": "Classic" },
      { "code": "zstandard", "name": "Standard" }
    ]
  }
}
```

### Iniciar Servidor

**POST** `/api/server/start`

Inicia un servidor con la configuración especificada.

**Body:**
```json
{
  "mapCode": "zm_zod",
  "gameType": "zclassic",
  "serverName": "Mi Servidor Zombies",
  "password": "",
  "rconPassword": "admin123",
  "port": 27017,
  "maxPlayers": 4
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Servidor iniciado correctamente en zm_zod",
  "data": {
    "process": {
      "success": true,
      "pid": 12345,
      "message": "Servidor iniciado con éxito"
    },
    "config": "C:\\...\\server.cfg"
  }
}
```

**Valores por defecto:**
- `mapCode`: "zm_zod"
- `gameType`: "zclassic"
- `serverName`: "BO3 Zombies Server"
- `password`: "" (servidor público)
- `rconPassword`: "admin"
- `port`: 27017
- `maxPlayers`: 4

### Detener Servidor

**POST** `/api/server/stop`

Detiene el servidor en ejecución.

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

### Estado del Servidor

**GET** `/api/server/status`

Consulta si el servidor está en ejecución.

```json
{
  "status": "success",
  "message": "Estado del servidor obtenido",
  "data": {
    "online": true,
    "pid": 12345
  }
}
```

### Logs del Servidor

**GET** `/api/server/logs?lines=50`

Obtiene los últimos logs del servidor.

**Query Parameters:**
- `lines`: Número de líneas a retornar (1-500, default: 50)

```json
{
  "status": "success",
  "requestedLines": 50,
  "results": 10,
  "data": [
    {
      "timestamp": "2024-12-16T10:30:00.000Z",
      "level": "stdout",
      "message": "Iniciando proceso: zm_zod (zclassic)"
    }
  ]
}
```

### Configuración del Servidor

**GET** `/api/server/config`

Obtiene la configuración actual del server.cfg.

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

**POST** `/api/server/config`

Actualiza la configuración del server.cfg sin iniciar el servidor.

**Body:**
```json
{
  "serverName": "Nuevo Nombre",
  "password": "mipassword",
  "rconPassword": "nuevoadmin",
  "port": 27018,
  "maxPlayers": 2
}
```

Todos los campos son opcionales. Solo se actualizarán los campos enviados.

## Mapas Disponibles

### Base Game & The Giant
- `zm_zod` - Shadows of Evil
- `zm_factory` - The Giant

### DLC Season
- `zm_castle` - Der Eisendrache (Awakening)
- `zm_island` - Zetsubou No Shima (Eclipse)
- `zm_stalingrad` - Gorod Krovi (Descent)
- `zm_genesis` - Revelations (Salvation)

### Zombies Chronicles
- `zm_prototype` - Nacht der Untoten
- `zm_asylum` - Verrückt
- `zm_sumpf` - Shi No Numa
- `zm_theater` - Kino der Toten
- `zm_cosmodrome` - Ascension
- `zm_temple` - Shangri-La
- `zm_moon` - Moon
- `zm_tomb` - Origins

## Modos de Juego

- `zclassic` - Classic
- `zstandard` - Standard

## Validaciones

### Seguridad de Inputs
- Caracteres especiales bloqueados: `; & | \` $ ( ) { } [ ] < > \`
- Longitud máxima de strings: 50 caracteres
- Validación estricta de códigos de mapa contra lista blanca
- Validación de tipos de juego permitidos

### Rangos Válidos
- **Puerto:** 1024-65535
- **Jugadores máximos:** 1-4
- **Líneas de log:** 1-500

## Troubleshooting

### Error: "La variable de entorno BO3_PATH no está definida"

**Solución:** Verifica que tu archivo `.env` contenga la variable `BO3_PATH` con la ruta correcta:

```env
BO3_PATH="C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
```

### Error: "No se encontró CustomClient_Server.bat"

**Solución:** Asegúrate de que:
1. La ruta en `BO3_PATH` apunta a la carpeta raíz de BO3
2. El archivo `CustomClient_Server.bat` existe en esa carpeta
3. CustomClient está correctamente instalado

### Error: "El servidor ya está corriendo"

**Solución:** Detén el servidor actual antes de iniciar uno nuevo:

```bash
curl -X POST http://localhost:3000/api/server/stop
```

### El servidor se inicia pero no aparece en la lista de servidores

**Posibles causas:**
1. **Puerto bloqueado:** Verifica que el puerto configurado no esté siendo usado por otra aplicación
2. **Firewall:** Asegúrate de que Windows Firewall permita conexiones en el puerto configurado
3. **live_steam_client:** Verifica que esté configurado en `1` en el server.cfg

### Los logs no muestran información

**Solución:** El buffer de logs se limpia cada vez que se inicia el servidor. Si acabas de iniciar el servidor, espera unos segundos para que se generen logs.

### Error 409: "El servidor ya está corriendo"

Este error ocurre cuando intentas iniciar un servidor mientras ya hay uno en ejecución. El sistema solo permite una instancia del servidor a la vez.

**Solución:**
1. Detén el servidor actual: `POST /api/server/stop`
2. Verifica el estado: `GET /api/server/status`
3. Inicia el nuevo servidor: `POST /api/server/start`

### Warnings en health check

Si el health check retorna status "warning", significa que falta el archivo `server.cfg`. Esto no es crítico, ya que el archivo se generará automáticamente al iniciar el servidor por primera vez.

## Manejo de Errores

Todos los errores siguen el siguiente formato:

```json
{
  "success": false,
  "status": "fail",
  "message": "Descripción del error"
}
```

Códigos de estado HTTP:
- **200:** Operación exitosa
- **400:** Error de validación o parámetros inválidos
- **404:** Ruta no encontrada
- **409:** Conflicto (ej: servidor ya iniciado)
- **500:** Error interno del servidor

## Arquitectura

### Servicios Principales

**Bo3ProcessService**
- Gestiona el ciclo de vida del proceso del servidor BO3
- Maneja spawn de procesos y señales de terminación
- Captura stdout/stderr y los envía al LogBuffer

**ConfigFileService**
- Genera y parsea el archivo `server.cfg`
- Mantiene valores por defecto
- Valida y sanitiza configuraciones

**SystemValidationServices**
- Realiza health checks del sistema
- Verifica existencia de archivos críticos
- Valida configuración del entorno

### Utilidades

**LogBuffer**
- Buffer circular de 1000 logs máximo
- Almacena timestamp, nivel y mensaje
- Permite consulta de logs históricos

**AppError**
- Clase personalizada para errores operacionales
- Diferencia entre errores 4xx (fail) y 5xx (error)
- Integrado con el manejador global de errores

## Seguridad

- Validación exhaustiva de todos los inputs
- Sanitización de strings para prevenir inyección de comandos
- Lista blanca de mapas y modos de juego
- Límites estrictos de longitud y rangos numéricos
- No se exponen detalles internos en mensajes de error de producción

## Licencia

ISC

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request