    import fs from "fs/promises"
    import path from "path"
    import AppError from "../utils/AppError.js"

    class ConfigFileService {
        /**
         * Genera archivo server.cfg basado en configuración
         * @param {Object} config - Configuración del servidor
         * @param {string} config.serverName - Nombre del servidor
         * @param {string} [config.password] - Contraseña del juego (vacío = público)
         * @param {string} [config.rconPassword] - Contraseña RCON
         * @param {string} [config.map] - Mapa inicial
         * @param {number} [config.maxPlayers] - Jugadores máximos
         * @param {number} [config.port] - Puerto del servidor
         * @returns {Promise<{success: boolean, filePath: string}>}
         */
        static async generateConfig(config) {
            const bo3path = process.env.BO3_PATH;

            if (!bo3path) {
                throw new AppError("La variable BO3_PATH no está configurada en el .env", 500);
            }

            if (!path.isAbsolute(bo3path)) {
                throw new AppError(`BO3_PATH debe ser una ruta absoluta. Actual: ${bo3path}`, 500);
            }

            try {
                await fs.access(bo3path);
            } catch (error) {
                throw new AppError(`La ruta BO3_PATH no existe: ${bo3path}`, 500);
            }

            const port = config.port || 27017;
            const rconPass = config.rconPassword || "admin123";
            const serverName = config.serverName || "BO3 Server";
            const maxPlayers = config.maxPlayers || 4;
            const map = config.map || "zm_zod";

            const gamePassword = config.password && config.password.trim()
                ? `g_password "${config.password}"`
                : '// g_password "" (Servidor Público)';

            const fileContent = `// Configuración generada por BO3 Server Manager
    // NO EDITAR MANUALMENTE

    // --- Identidad ---
    sv_hostname "${serverName}"
    ${gamePassword}

    // --- Administración ---
    // Necesario para que el Manager controle el servidor
    rcon_password "${rconPass}"

    // --- Red ---
    // Es informativo, ya que el puerto real se define al lanzar el .exe
    // net_port "${port}" 

    // --- Juego ---
    map "${map}"
    com_maxclients "${maxPlayers}"
    lobby_animationSpeed "4"

    // --- Ajustes ---
    ds_kz "1"
    `;

            //const targetFolder = path.join(bo3path, "zone")
            const targetFile = path.join(bo3path, "server.cfg");

            try {
                await fs.writeFile(targetFile, fileContent, "utf-8");

                return {
                    success: true,
                    filePath: targetFile
                };
            } catch (error) {
                throw new AppError(
                    `Falló al escribir el archivo de configuración: ${error.message}`,
                    500
                );
            }
        }
    }

    export default ConfigFileService;