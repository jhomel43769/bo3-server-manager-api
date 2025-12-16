
export const MAPS_DETAILS = [
    
    // Base Game & The Giant
    { code: "zm_zod", name: "Shadows of Evil", dlc: "Base Game" },
    { code: "zm_factory", name: "The Giant", dlc: "The Giant" },
    
    // DLC Season
    { code: "zm_castle", name: "Der Eisendrache", dlc: "Awakening" },
    { code: "zm_island", name: "Zetsubou No Shima", dlc: "Eclipse" },
    { code: "zm_stalingrad", name: "Gorod Krovi", dlc: "Descent" },
    { code: "zm_genesis", name: "Revelations", dlc: "Salvation" },

    // Zombies Chronicles
    { code: "zm_prototype", name: "Nacht der Untoten", dlc: "Zombies Chronicles" },
    { code: "zm_asylum", name: "Verrückt", dlc: "Zombies Chronicles" },
    { code: "zm_sumpf", name: "Shi No Numa", dlc: "Zombies Chronicles" },
    { code: "zm_theater", name: "Kino der Toten", dlc: "Zombies Chronicles" },
    { code: "zm_cosmodrome", name: "Ascension", dlc: "Zombies Chronicles" },
    { code: "zm_temple", name: "Shangri-La", dlc: "Zombies Chronicles" },
    { code: "zm_moon", name: "Moon", dlc: "Zombies Chronicles" },
    { code: "zm_tomb", name: "Origins", dlc: "Zombies Chronicles" }
];

export const GAMETYPES_DETAILS = [
    { code: 'zclassic', name: 'Classic' },
    { code: 'zstandard', name: 'Standard' } 
];

export const ALLOWED_MAPS = MAPS_DETAILS.map(map => map.code);
export const ALLOWED_GAMETYPES = GAMETYPES_DETAILS.map(mode => mode.code);