    import fs from "fs/promises"
    import os from "node:os"
    import path, { join } from "node:path";

    class SystemValidationServices {

        static async performHealthCheck() {
            const bo3path = process.env.BO3_PATH;

            const checks = {
                envVar: { valid: false, message: "No definido" },
                directory: { valid: false, message: "No accesible" },
                executable: { valid: false, message: "No encontrado" },
                configFile: { valid: false, message: "No encontrado" }
            };

            const buildResponse = (status, message) => ({
                status,
                message,
                system: { platform: os.platform(), nodeVersion: process.version },
                checks
            });

            if (!bo3path) return buildResponse("error", "Variable BO3_PATH no definida");
            checks.envVar = { valid: true, path: bo3path };

            if (!path.isAbsolute(bo3path)) return buildResponse("error", "BO3_PATH debe ser absoluta");

            try {
                await fs.access(bo3path);
                checks.directory = { valid: true, message: "Accesible" };
            } catch {
                return buildResponse("error", "La ruta BO3_PATH no existe");
            }
            
            const batPath = path.join(bo3path, 'CustomClient_Server.bat');
            const cfgPath = path.join(bo3path, 'server.cfg');

            const hasBat = await fs.access(batPath).then(() => true).catch(() => false);
            const hasCfg = await fs.access(cfgPath).then(() => true).catch(() => false);

            checks.executable = hasBat 
                ? { valid: true, message: "Listo" } 
                : { valid: false, message: "Falta CustomClient_Server.bat" };
                
            checks.configFile = hasCfg 
                ? { valid: true, message: "Listo" } 
                : { valid: false, message: "Falta server.cfg" };

            const finalStatus = !hasBat ? "error" : (!hasCfg ? "warning" : "healthy");

            const finalMessage = !hasBat 
                ? "Falta el ejecutable crítico del servidor" 
                : (!hasCfg ? "Falta configuración (se generará automáticamente)" : "Sistema listo para operar");

            return buildResponse(finalStatus, finalMessage);
        }
    }

    export default SystemValidationServices;