import { spawn, exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import AppError from "../utils/AppError.js";

let currentProcess = null;


class Bo3ProcessService {

    static async start() {
        if (currentProcess) {
            throw new AppError(`El servidor ya está corriendo (PID: ${currentProcess.pid})`, 409);
        }

        const bo3Path = process.env.BO3_PATH;
        if (!bo3Path) {
            throw new AppError('La variable de entorno BO3_PATH no está definida', 500);
        }

        if (!path.isAbsolute(bo3Path)) {
            throw new AppError(`BO3_PATH debe ser una ruta absoluta. Actual: ${bo3Path}`, 500);
        }

        try {
            await fs.access(bo3Path);
        } catch (error) {
            throw new AppError(`La ruta BO3_PATH no existe: ${bo3Path}`, 500);
        }

        const batPath = path.join(bo3Path, 'CustomClient_Server.bat');
        try {
            await fs.access(batPath);
        } catch (error) {
            throw new AppError(`No se encontró CustomClient_Server.bat en: ${batPath}`, 500);
        }

        console.log(`Intentando iniciar servidor en: ${bo3Path}`);

        return new Promise((resolve, reject) => {
            const subprocess = spawn('cmd.exe', ['/c', 'CustomClient_Server.bat', 't7x'], {
                cwd: bo3Path,
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            currentProcess = subprocess;
            subprocess.on('error', (err) => {
                console.error("Error al intentar ejecutar el proceso:", err);
                currentProcess = null;
                reject(new AppError(`Error al iniciar servidor: ${err.message}`, 500));
            });

            subprocess.on('exit', (code, signal) => {
                console.log(`Proceso terminado. Código: ${code}, Señal: ${signal}`);
                currentProcess = null;
            });

            subprocess.stdout.on('data', (data) => {
                console.log(`[BO3 Server]: ${data.toString().trim()}`);
            });

            subprocess.stderr.on('data', (data) => {
                console.error(`[BO3 Error]: ${data.toString().trim()}`);
            });

            console.log(`Servidor iniciado correctamente. PID: ${subprocess.pid}`);

            resolve({
                success: true,
                pid: subprocess.pid,
                message: "Servidor iniciado con éxito"
            });
        });
    }

    static async stop() {
        if (!currentProcess) {
            throw new AppError('No hay ningún servidor corriendo para detener', 409);
        }

        const pid = currentProcess.pid;
        console.log(`Enviando señal de apagado al PID: ${pid}`);

        return new Promise((resolve, reject) => {
            exec(`taskkill /PID ${pid} /F /T`, (error, stdout, stderr) => {
                if (error) {
                    console.warn(`Aviso al detener el proceso: ${error.message}`);
                }

                currentProcess = null;
                console.log('Servidor detenido y memoria liberada');

                resolve({
                    success: true,
                    message: 'Servidor detenido correctamente'
                });
            });
        });
    }

    static getStatus() {
        return {
            online: !!currentProcess,
            pid: currentProcess ? currentProcess.pid : null
        };
    }
}

export default Bo3ProcessService;