# Setup Guide

Guía detallada para configurar y ejecutar el BO3 Zombies Server Manager desde cero.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Node.js](#instalación-de-nodejs)
3. [Configuración de Black Ops 3](#configuración-de-black-ops-3)
4. [Instalación del Proyecto](#instalación-del-proyecto)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Verificación del Sistema](#verificación-del-sistema)
7. [Primera Ejecución](#primera-ejecución)
8. [Configuración Avanzada](#configuración-avanzada)
9. [Troubleshooting](#troubleshooting)

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

### Sistema Operativo
- Windows 10 o superior (requerido para ejecutar BO3 Server)
- Permisos de administrador

### Software Base
- Git instalado
- Editor de código (VS Code recomendado)
- Terminal (PowerShell o CMD)

### Call of Duty: Black Ops 3
- Juego instalado y actualizado
- CustomClient instalado y funcional
- Suficiente espacio en disco (al menos 5GB libres)

## Instalación de Node.js

### Paso 1: Descargar Node.js

1. Visita https://nodejs.org/
2. Descarga la versión LTS (Long Term Support)
3. Recomendado: Node.js 18.x o superior

### Paso 2: Instalar Node.js

1. Ejecuta el instalador descargado
2. Sigue el asistente de instalación
3. Asegúrate de marcar la opción "Add to PATH"
4. Instala las herramientas adicionales si se solicita

### Paso 3: Verificar Instalación

Abre una terminal nueva y ejecuta:

```bash
node --version
# Debería mostrar algo como: v18.17.0

npm --version
# Debería mostrar algo como: 9.6.7
```

Si ves los números de versión, Node.js está correctamente instalado.

## Configuración de Black Ops 3

### Paso 1: Ubicar Instalación

Encuentra la carpeta de instalación de BO3. Ubicaciones comunes:

**Steam:**
```
C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III
```

**Otra unidad:**
```
D:\Games\Steam\steamapps\common\Call of Duty Black Ops III
```

### Paso 2: Verificar CustomClient

Dentro de la carpeta de BO3, debe existir:

```
CustomClient_Server.bat
```

Si no existe:

1. Descarga e instala CustomClient/T7x
2. Sigue las instrucciones de instalación del cliente
3. Verifica que el archivo BAT se haya creado

### Paso 3: Probar Ejecución Manual

Antes de usar el manager, prueba ejecutar el servidor manualmente:

```bash
cd "C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
CustomClient_Server.bat t7x +map zm_zod +gametype zclassic
```

Si el servidor arranca correctamente, estás listo para continuar.

## Instalación del Proyecto

### Paso 1: Clonar Repositorio

```bash
git clone <repository-url>
cd backend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- express: Framework web
- cors: Manejo de CORS
- morgan: Logger HTTP
- nodemon: Auto-reload en desarrollo

### Paso 3: Verificar package.json

El archivo debe contener:

```json
{
  "type": "module",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "morgan": "^1.10.1",
    "nodemon": "^3.1.11"
  }
}
```

## Configuración de Variables de Entorno

### Paso 1: Crear Archivo .env

En la raíz del proyecto, crea un archivo llamado `.env`:

```bash
# Windows PowerShell
New-Item .env

# Windows CMD
type nul > .env

# O usa tu editor de código
code .env
```

### Paso 2: Configurar Variables

Edita `.env` y agrega:

```env
PORT=3000
BO3_PATH="C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
```

**IMPORTANTE:**

1. Usa comillas dobles alrededor de la ruta
2. La ruta debe ser ABSOLUTA (completa)
3. NO uses barras invertidas dobles (\\)
4. Usa la ruta exacta de tu instalación

### Paso 3: Ejemplo de .env Completo

```env
# Puerto del servidor API
PORT=3000

# Ruta absoluta a la instalación de Black Ops 3
# NOTA: Asegúrate de que esta ruta es correcta para tu sistema
BO3_PATH="C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"

# Alternativa si está en otra unidad:
# BO3_PATH="D:\Games\Steam\steamapps\common\Call of Duty Black Ops III"
```

### Paso 4: Verificar .gitignore

Asegúrate de que `.env` esté en `.gitignore` para no subir tus configuraciones:

```
node_modules
.env
tests
guia_git.md
```

## Verificación del Sistema

### Paso 1: Health Check Manual

Ejecuta el script de prueba:

```bash
npm run test:config
```

Este script debería:
1. Cargar las variables de entorno
2. Mostrar la configuración actual
3. No mostrar errores

### Paso 2: Iniciar Servidor

```bash
npm run dev
```

Deberías ver:

```
Server running on port: 3000
```

### Paso 3: Probar Health Endpoint

En otra terminal:

```bash
curl http://localhost:3000/api/health
```

O abre en tu navegador:
```
http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "message": "Sistema listo para operar",
    "checks": {
      "envVar": { "valid": true },
      "directory": { "valid": true },
      "executable": { "valid": true },
      "configFile": { "valid": true }
    }
  }
}
```

## Primera Ejecución

### Paso 1: Obtener Mapas Disponibles

```bash
curl http://localhost:3000/api/server/available-options
```

Esto te mostrará todos los mapas y modos disponibles.

### Paso 2: Iniciar Servidor de Prueba

```bash
curl -X POST http://localhost:3000/api/server/start \
  -H "Content-Type: application/json" \
  -d "{\"mapCode\": \"zm_zod\", \"gameType\": \"zclassic\"}"
```

O usando PowerShell:

```powershell
$body = @{
    mapCode = "zm_zod"
    gameType = "zclassic"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/server/start" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Paso 3: Monitorear Logs

```bash
curl "http://localhost:3000/api/server/logs?lines=50"
```

### Paso 4: Verificar Estado

```bash
curl http://localhost:3000/api/server/status
```

### Paso 5: Detener Servidor

```bash
curl -X POST http://localhost:3000/api/server/stop
```

## Configuración Avanzada

### Puerto Personalizado

Si el puerto 3000 está ocupado:

1. Edita `.env`:
```env
PORT=8080
```

2. Reinicia el servidor
3. Usa la nueva URL: `http://localhost:8080`

### Múltiples Configuraciones

Puedes crear archivos `.env` específicos:

`.env.development`:
```env
PORT=3000
BO3_PATH="C:\Games\BO3"
```

`.env.production`:
```env
PORT=8080
BO3_PATH="C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
```

Cargar configuración específica:

```bash
node --env-file=.env.production src/server.js
```

### Firewall de Windows

El servidor necesita acceso a red. Agrega excepciones:

1. Abre "Windows Defender Firewall"
2. Click en "Configuración avanzada"
3. "Reglas de entrada" > "Nueva regla"
4. Tipo: Puerto
5. Puerto TCP específico: 27017 (o tu puerto configurado)
6. Permitir la conexión
7. Aplica a todos los perfiles
8. Nombre: "BO3 Server Manager"

### Logging Avanzado

Por defecto, Morgan registra todas las peticiones HTTP. Para personalizar:

Edita `src/index.js`:

```javascript
// Modo development (detallado)
app.use(morgan('dev'))

// Modo production (mínimo)
app.use(morgan('combined'))

// Personalizado
app.use(morgan(':method :url :status :response-time ms'))
```

## Troubleshooting

### Error: Cannot find module

**Síntoma:**
```
Error: Cannot find module 'express'
```

**Solución:**
```bash
# Elimina node_modules y reinstala
rm -rf node_modules
npm install
```

### Error: Puerto en uso

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**

Opción 1 - Cambiar puerto:
```env
PORT=3001
```

Opción 2 - Matar proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: BO3_PATH no válido

**Síntoma:**
```json
{
  "status": "error",
  "message": "La ruta BO3_PATH no existe"
}
```

**Solución:**

1. Verifica que la ruta existe:
```bash
dir "C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III"
```

2. Corrige en `.env` si es necesario
3. Usa comillas dobles
4. Asegúrate de que sea ruta ABSOLUTA

### Error: CustomClient_Server.bat no encontrado

**Síntoma:**
```json
{
  "status": "error",
  "message": "No se encontró CustomClient_Server.bat"
}
```

**Solución:**

1. Verifica instalación de CustomClient
2. Reinstala CustomClient si es necesario
3. Verifica que el BAT está en la carpeta raíz de BO3

### Servidor no aparece en lista de servidores

**Posibles causas y soluciones:**

1. **Puerto bloqueado por firewall:**
   - Agrega excepción en Windows Firewall
   - Verifica router si es servidor público

2. **Puerto ya en uso:**
   - Cambia a otro puerto en server.cfg
   - Verifica con `netstat -ano | findstr :27017`

3. **live_steam_client incorrecto:**
   - Debe estar en `1` en server.cfg
   - Regenera config con `POST /server/config`

### Logs no aparecen

**Síntoma:**
```json
{
  "results": 0,
  "data": []
}
```

**Causas:**

1. Servidor recién iniciado (espera 10-15 segundos)
2. Servidor no está corriendo
3. Buffer se limpió al reiniciar

**Solución:**

Verifica estado primero:
```bash
curl http://localhost:3000/api/server/status
```

### Health check retorna "warning"

**Síntoma:**
```json
{
  "status": "warning",
  "message": "Falta configuración (se generará automáticamente)"
}
```

**Causa:** Falta `server.cfg`

**Solución:** No es crítico. Se generará automáticamente al iniciar el servidor.

### Permission Denied al escribir server.cfg

**Síntoma:**
```
Error: EPERM: operation not permitted
```

**Solución:**

1. Ejecuta terminal como administrador
2. Verifica permisos de la carpeta BO3
3. Desactiva temporalmente antivirus
4. Verifica que BO3 no esté corriendo

## Recursos Adicionales

### Documentación de Referencia

- [API Documentation](./API.md)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Comunidad

- GitHub Issues: Para reportar bugs
- Pull Requests: Para contribuir mejoras

### Scripts Útiles

**Limpiar y reinstalar:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Verificar versiones:**
```bash
node --version
npm --version
npm list
```

**Modo debug:**
```bash
NODE_ENV=development npm run dev
```

## Checklist Final

Antes de considerar el setup completo:

- [ ] Node.js instalado y verificado
- [ ] BO3 instalado con CustomClient funcional
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado y configurado
- [ ] `BO3_PATH` apunta a instalación correcta
- [ ] Health check retorna "healthy" o "warning"
- [ ] Servidor inicia correctamente (`npm run dev`)
- [ ] Puedes iniciar un servidor de BO3
- [ ] Logs se muestran correctamente
- [ ] Puedes detener el servidor

Si todos los checks están completos, tu instalación está lista para producción.

## Próximos Pasos

1. Lee la [documentación de API](./API.md)
2. Prueba todos los endpoints
3. Configura tu firewall para acceso remoto
4. Considera implementar autenticación
5. Configura rate limiting para producción
6. Implementa logging persistente si es necesario