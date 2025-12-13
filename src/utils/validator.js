import { ALLOWED_MAPS, ALLOWED_GAMETYPES } from '../config/bo3-constants.js';

export const isValidMapName = (mapCode) => {
    if (!mapCode || typeof mapCode !== 'string') return false;
    
    const sanitized = mapCode.trim();
    if (sanitized.length === 0 || sanitized.length > 50) return false;
    
    return ALLOWED_MAPS.includes(sanitized);
};

export const isValidGameType = (gameType) => {
    if (gameType === undefined || gameType === null) return true;
    
    if (typeof gameType !== 'string') return false; 
    
    const sanitized = gameType.trim();
    if (sanitized.length === 0 || sanitized.length > 50) return false;
    
    return ALLOWED_GAMETYPES.includes(sanitized);
};

export const sanitizeInput = (input, maxLength = 50) => {
    if (typeof input !== 'string') return null;
    
    const trimmed = input.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return null;
    
    if (/[;&|`$(){}[\]<>\\]/.test(trimmed)) return null;
    
    return trimmed;
};

export const isValidPort = (port) => {
    const p = parseInt(port);
    return !isNaN(p) && p >= 1024 && p <= 65535;
};

export const isValidMaxPlayers = (maxPlayers) => {
    const mp = parseInt(maxPlayers);
    return !isNaN(mp) && mp >= 1 && mp <= 18;
};