import Bo3ProcessService from "../services/bo3-process-service.js";
import ConfigFileService from "../services/config-file-service.js";
import AppError from "../utils/AppError.js";
import { isValidGameType, isValidMapName, isValidPort, isValidMaxPlayers, sanitizeInput } from "../utils/validator.js";

class ServerActionController {

    static async startServer(req, res, next) {
        try {
            const serverName = sanitizeInput(req.body.serverName) || "BO3 Zombies Server";
            const password = sanitizeInput(req.body.password) || ""; 
            const rconPassword = sanitizeInput(req.body.rconPassword) || "admin";
            
            let { mapCode, gameType } = req.body;
            mapCode = mapCode?.trim() || 'zm_zod';
            gameType = gameType?.trim() || 'zclassic';

            const port = req.body.port || 27017;
            const maxPlayers = req.body.maxPlayers || 4;

            if (mapCode.length > 50) throw new AppError('mapCode es demasiado largo', 400);
            if (gameType.length > 50) throw new AppError('gameType es demasiado largo', 400);

            if (!isValidMapName(mapCode)) {
                throw new AppError(`El mapa "${mapCode}" no es válido`, 400);
            }

            if (!isValidGameType(gameType)) {
                throw new AppError(`El modo de juego "${gameType}" no es válido`, 400);
            }

            if (!isValidPort(port)) {
                throw new AppError(`Puerto inválido: ${port}. Use un rango entre 1024 y 65535.`, 400);
            }

            if (!isValidMaxPlayers(maxPlayers)) {
                throw new AppError(`Cantidad de jugadores inválida: ${maxPlayers}. (Mín 1, Máx 4).`, 400);
            }

            if (/[;&|`$(){}[\]<>\\]/.test(serverName)) throw new AppError('Caracteres inválidos en el nombre del servidor', 400);

            const configResult = await ConfigFileService.generateConfig({
                serverName,
                password,
                rconPassword,
                maxPlayers,
                port
            });
            
            console.log(`Configuración generada en: ${configResult.filePath}`);

            const processResult = await Bo3ProcessService.start(mapCode, gameType);

            res.status(200).json({
                status: "success",
                message: `Servidor iniciado correctamente en ${mapCode}`,
                data: {
                    process: processResult,
                    config: configResult.filePath
                }
            });

        } catch (error) {
            next(error);
        }
    }

    static async stopServer(req, res, next) {
        try {
            const result = await Bo3ProcessService.stop();
            res.status(200).json({
                status: "success",
                message: "Servidor detenido correctamente",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStatusServer(req, res, next) {
        try {
            const status = Bo3ProcessService.getStatus();
            res.status(200).json({
                status: "success",
                message: "Estado del servidor obtenido",
                data: status
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ServerActionController;