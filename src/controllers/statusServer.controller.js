import Bo3ProcessService from "../services/bo3-process-service.js"
import AppError from "../utils/AppError.js";
import { isValidGameType, isValidMapName } from "../utils/validator.js"

class ServerActionController {

    static async startServer(req, res, next) {
        try {
            let { mapCode, gameType } = req.body;

            if (mapCode !== undefined && typeof mapCode !== 'string') {
                throw new AppError('mapCode debe ser un string', 400);
            }
            
            if (gameType !== undefined && typeof gameType !== 'string') {
                throw new AppError('gameType debe ser un string', 400);
            }

            mapCode = mapCode?.trim() || 'zm_zod';
            gameType = gameType?.trim() || 'zclassic';

            if (mapCode.length > 50) {
                throw new AppError('mapCode es demasiado largo', 400);
            }
            
            if (gameType.length > 50) {
                throw new AppError('gameType es demasiado largo', 400);
            }

            if (!isValidMapName(mapCode)) {
                throw new AppError(`El mapa "${mapCode}" no es válido`, 400);
            }

            if (!isValidGameType(gameType)) {
                throw new AppError(`El modo de juego "${gameType}" no es válido`, 400);
            }

            if (/[;&|`$(){}[\]<>\\]/.test(mapCode) || /[;&|`$(){}[\]<>\\]/.test(gameType)) {
                throw new AppError('Caracteres no permitidos detectados', 400);
            }

            const result = await Bo3ProcessService.start(mapCode, gameType);

            res.status(200).json({
                status: "success",
                message: "Servidor iniciado correctamente",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async stopServer(req, res, next) {
        try {
            const result = await Bo3ProcessService.stop()

            res.status(200).json({
                status: "success",
                message: "Servidor detenido correctamente",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async getStatusServer(req, res, next) {
        try {
            const status = Bo3ProcessService.getStatus()

            res.status(200).json({
                status: "success",
                message: "Estado del servidor obtenido",
                data: status
            })
        } catch (error) {
            next(error)
        }
    }
}

export default ServerActionController;