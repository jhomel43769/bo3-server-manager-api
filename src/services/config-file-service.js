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
        //const map = config.map || "zm_zod";

        const gamePassword = config.password && config.password.trim()
            ? `g_password "${config.password}"`
            : '// g_password "" (Servidor Público)';

        const fileContent = `// Configuración generada por BO3 Server Manager
// NO EDITAR MANUALMENTE

// --- Conectividad (CRÍTICO PARA ZOMBIES) ---
live_steam_client 1
net_port "${port}"

// --- Identidad ---
sv_hostname "${serverName}"
${gamePassword}

// --- Administración ---
rcon_password "${rconPass}"

// --- Juego y Lobby ---
// Importante: En zombies, party_maxplayers debe coincidir para la sala de espera
com_maxclients "${maxPlayers}"
party_maxplayers "${maxPlayers}"
lobby_animationSpeed "2"

// --- Ajustes Técnicos ---
ds_kz "1"
`;

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

    static async getConfig() {
        const bo3path = process.env.BO3_PATH

        if (!bo3path || !path.isAbsolute(bo3path)) {
            return this._getDefaults()
        }

        const targetFile = path.join(bo3path, "server.cfg")

        try {
            const content = await fs.readFile(targetFile, 'utf-8')
            return this._parseConfigContent(content)
        } catch (error) {
            
            if (error.code === 'ENOENT') {
                return this._getDefaults();
            }
            throw new AppError(`Error al leer la configuracion: ${error.message}`, 500)
        }
    }

    static _getDefaults() {
        return {
            serverName: "BO3 Server",
            port: 27017,
            maxPlayers: 4,
            rconPassword: "admin123",
            password: ""
        };
    }

    static _parseConfigContent(content) {
        const config = this._getDefaults();
        const lines = content.split('\n');

        for (const line of lines) {
            const l = line.trim();

            if (!l || l.startsWith('//')) continue;

            if (l.startsWith('sv_hostname')) config.serverName = this._extractValue(l, 'sv_hostname');
            else if (l.startsWith('net_port')) config.port = parseInt(this._extractValue(l, 'net_port')) || 27017;
            else if (l.startsWith('rcon_password')) config.rconPassword = this._extractValue(l, 'rcon_password');
            else if (l.startsWith('g_password')) config.password = this._extractValue(l, 'g_password');
            else if (l.startsWith('com_maxclients')) config.maxPlayers = parseInt(this._extractValue(l, 'com_maxclients')) || 4;
        }

        return config;
    }

    static _extractValue(line, key) {
        let value = line.replace(key, '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }

        return value;
    }


}

export default ConfigFileService;