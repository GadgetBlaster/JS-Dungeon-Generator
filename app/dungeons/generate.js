
import { generateMap } from './map.js';
import { generateRooms } from '../rooms/generate.js';
import { knobs } from '../knobs.js';
import { roll, rollArrayItem } from '../utility/roll.js';
import { getRoomDoor } from '../rooms/door.js';
import trapList from '../rooms/trap.js';

const complexityRoomCountMultiplier = 10;
const complexityMultiplierMinXY     = 5;
const complexityMultiplierMaxXY     = 6;
const trapCountMultiplier           = 5;

const getMxRoomCount = (complexity) => {
    return complexity * complexityRoomCountMultiplier;
};

const getMapDimensions = (complexity) => {
    let dimensionMin = complexity * complexityMultiplierMinXY;
    let dimensionMax = complexity * complexityMultiplierMaxXY;

    let gridWidth  = roll(dimensionMin, dimensionMax);
    let gridHeight = roll(dimensionMin, dimensionMax);

    return {
        gridWidth,
        gridHeight,
    };
};

const generateTraps = (trapMin) => {
    let traps = [];

    if (trapMin < 1) {
        return traps;
    }

    let max   = trapMin * trapCountMultiplier;
    let min   = Math.max(1, (max - trapCountMultiplier - trapMin));
    let count = roll(min, max);


    for (let i = 0; i < count; i++) {
        traps.push(rollArrayItem(trapList));
    }

    return traps;
};

export const generateDungeon = (settings) => {
    let {
        [knobs.dungeonComplexity]: complexity,
        [knobs.dungeonMaps]      : maps,
        [knobs.dungeonTraps]     : trapMin,
    } = settings;

    settings[knobs.roomCount] = getMxRoomCount(complexity);

    let rooms = generateRooms(settings);
    let traps = generateTraps(trapMin);

    traps.length && traps.forEach((trap) => {
        let room = rollArrayItem(rooms);

        if (!room.traps) {
            room.traps = [];
        }

        room.traps.push(trap);
    });

    let mapDimensions = getMapDimensions(complexity);

    let mapSettings = {
        ...mapDimensions,
        rooms,
    };

    let dungeon         = generateMap(mapSettings);
    let { doors, keys } = getRoomDoor(dungeon.doors);

    keys.length && keys.forEach((key) => {
        let room = rollArrayItem(dungeon.rooms);

        if (!room.keys) {
            room.keys = [];
        }

        room.keys.push(key);
    });

    if (maps) {
        for (let i = 0; i < maps; i++) {
            let room = rollArrayItem(dungeon.rooms);
            room.map = true;
        }
    }

    return {
        map  : dungeon.map,
        rooms: dungeon.rooms,
        doors: doors,
        mapDimensions,
    };
};
