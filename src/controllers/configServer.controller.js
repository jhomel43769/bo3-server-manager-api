import ConfigFileService from "../services/config-file-service.js";
import AppError from "../utils/AppError.js";
import { isValidMaxPlayers, isValidPort, sanitizeInput } from "../utils/validator.js";

class ConfigServerController {

    static async getConfig(req, res, next) {
        try {
            const config = await ConfigFileService.getConfig()

            return res.status(200).json({
                status: "success",
                data: config
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateConfig(req, res, next) {
        try {
            const serverName = sanitizeInput(req.body.serverName);
            let password = sanitizeInput(req.body.password);
            const rconPassword = sanitizeInput(req.body.rconPassword);

            if (req.body.serverName !== undefined && serverName === null) {
                throw new AppError('serverName inválido: contiene caracteres no permitidos, es muy largo o está vacío', 400);
            }

            if (req.body.password !== undefined) {

                if (typeof req.body.password !== 'string') {
                    throw new AppError('El formato del password es inválido', 400);
                }

                const rawPass = req.body.password.trim();

                if (rawPass === "") {
                    password = ""; 
                } else {
                    const cleanPass = sanitizeInput(rawPass);

                    if (!cleanPass) {
                        throw new AppError('Password contiene caracteres no permitidos', 400);
                    }
                    password = cleanPass;
                }
            }

            if (req.body.rconPassword !== undefined && rconPassword === null) {
                throw new AppError('rconPassword inválido: contiene caracteres no permitidos o es muy largo', 400);
            }

            const port = req.body.port;
            const maxPlayers = req.body.maxPlayers;

            if (port !== undefined && !isValidPort(port)) {
                throw new AppError(`Puerto inválido: ${port}. Use un rango entre 1024 y 65535.`, 400);
            }

            if (maxPlayers !== undefined && !isValidMaxPlayers(maxPlayers)) {
                throw new AppError(`Max players inválido: ${maxPlayers}. (Mín 1, Máx 4).`, 400);
            }

            const result = await ConfigFileService.generateConfig({
                serverName,
                password,
                rconPassword,
                port,
                maxPlayers
            });

            res.status(200).json({
                status: "success",
                message: "Configuración actualizada con éxito",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ConfigServerController 