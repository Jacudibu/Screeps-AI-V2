/* Posted March 10th, 2018 by @semperrabbit*/
/**
 Module: prototype.Room.structures v1.8
 Author: SemperRabbit
 Date:   20180309-13,20180411,20200524
 Usage:  require('prototype.Room.structures');

 This module will provide structure caching and extends the Room
 class' prototype to provide `room.controller`-like properties
 for all structure types. It will cache the object IDs of a
 room.find() grouped by type as IDs in global. Once the property
 is requested, it will chech the cache (and refresh if required),
 then return the appropriate objects by maping the cache's IDs
 into game objects for that tick.

 Changelog:
 1.0: Initial publish
 1.1: Changed multipleList empty results from `null` to `[]`
 Bugfix: changed singleList returns from arrays to single objects or undefined
 1.2: Added intra-tick caching in addition to inter-tick caching
 1.3: Multiple bugfixes
 1.4: Moved STRUCTURE_POWER_BANK to `multipleList` due to proof of *possibility* of multiple
 in same room.
 1.5: Added CPU Profiling information for Room.prototype._checkRoomCache() starting on line 47
 1.6: Added tick check for per-tick caching, in preperation for the potential "persistent Game
 object" update. Edits on lines 73, 77-83, 95, 99-105
 1.7: Added Factory support (line 46)
 1.8: Made Factory support permanant and cleaner

 Additional Changes:
 - Autocompletion magic
 - Cache for My & Hostile structures
 - Function to force cache updates
 */

Room.prototype.observer = null;
Room.prototype.powerSpawn = null;
Room.prototype.extractor = null;
Room.prototype.nuker = null;
Room.prototype.factory = null;
Room.prototype.spawns = null;
Room.prototype.extensions = null;
Room.prototype.roads = null;
Room.prototype.walls = null;
Room.prototype.ramparts = null;
Room.prototype.keeperLairs = null;
Room.prototype.portals = null;
Room.prototype.links = null;
Room.prototype.towers = null;
Room.prototype.labs = null;
Room.prototype.containers = null;
Room.prototype.powerBanks = null;
let roomStructures           = {};
let roomStructuresExpiration = {};

Room.prototype.myObserver = null;
Room.prototype.myPowerSpawn = null;
Room.prototype.myExtractor = null;
Room.prototype.myNuker = null;
Room.prototype.myFactory = null;
Room.prototype.mySpawns = null;
Room.prototype.myExtensions = null;
Room.prototype.myRamparts = null;
Room.prototype.myLinks = null;
Room.prototype.myTowers = null;
Room.prototype.myLabs = null;
Room.prototype.myContainers = null;
let myRoomStructures           = {};
let myRoomStructuresExpiration = {};

Room.prototype.hostileObserver = null;
Room.prototype.hostilePowerSpawn = null;
Room.prototype.hostileExtractor = null;
Room.prototype.hostileNuker = null;
Room.prototype.hostileFactory = null;
Room.prototype.hostileSpawns = null;
Room.prototype.hostileExtensions = null;
Room.prototype.hostileRamparts = null;
Room.prototype.hostileLinks = null;
Room.prototype.hostileTowers = null;
Room.prototype.hostileLabs = null;
Room.prototype.hostileContainers = null;
let hostileRoomStructures           = {};
let hostileRoomStructuresExpiration = {};

const CACHE_TIMEOUT = 50;
const CACHE_OFFSET  = 4;

const multipleList = [
    STRUCTURE_SPAWN,        STRUCTURE_EXTENSION,    STRUCTURE_ROAD,         STRUCTURE_WALL,
    STRUCTURE_RAMPART,      STRUCTURE_KEEPER_LAIR,  STRUCTURE_PORTAL,       STRUCTURE_LINK,
    STRUCTURE_TOWER,        STRUCTURE_LAB,          STRUCTURE_CONTAINER,	STRUCTURE_POWER_BANK,
];

const singleList = [
    STRUCTURE_OBSERVER,     STRUCTURE_POWER_SPAWN,  STRUCTURE_EXTRACTOR,	STRUCTURE_NUKER,
    STRUCTURE_FACTORY,		//STRUCTURE_TERMINAL,   STRUCTURE_CONTROLLER,   STRUCTURE_STORAGE,
];

const ownedMultipleList = [
    STRUCTURE_SPAWN,        STRUCTURE_EXTENSION,    STRUCTURE_RAMPART,      STRUCTURE_LINK,
    STRUCTURE_TOWER,        STRUCTURE_LAB,
];

const ownedSingleList = [
    STRUCTURE_OBSERVER,     STRUCTURE_POWER_SPAWN,  STRUCTURE_EXTRACTOR,	STRUCTURE_NUKER,
    STRUCTURE_FACTORY,		STRUCTURE_TERMINAL,     STRUCTURE_STORAGE,
];

function getCacheExpiration(){
    return CACHE_TIMEOUT + Math.round((Math.random()*CACHE_OFFSET*2)-CACHE_OFFSET);
}

/********* CPU Profiling stats for Room.prototype._checkRoomCache **********
 calls         time      avg        function
 550106        5581.762  0.01015    Room._checkRoomCache

 calls with cache reset: 4085
 avg for cache reset:    0.137165
 calls without reset:    270968
 avg without reset:      0.003262
 ****************************************************************************/
Room.prototype._checkRoomCache = function _checkRoomCache(){
    // if cache is expired or doesn't exist
    if(!roomStructuresExpiration[this.name] || !roomStructures[this.name] || roomStructuresExpiration[this.name] < Game.time){
        roomStructuresExpiration[this.name] = Game.time + getCacheExpiration();
        roomStructures[this.name] = _.groupBy(this.find(FIND_STRUCTURES), s=>s.structureType);
        let i;
        for(i in roomStructures[this.name]){
            roomStructures[this.name][i] = _.map(roomStructures[this.name][i], s=>s.id);
        }
    }
};

multipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type+'s', {
        get: function(){
            if(this['_'+type+'s'] && this['_'+type+'s_ts'] === Game.time){
                return this['_'+type+'s'];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
                    this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = roomStructures[this.name][type].map(Game.getObjectById);
                } else {
                    this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = [];
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

singleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type, {
        get: function(){
            if(this['_'+type] && this['_'+type+'_ts'] === Game.time){
                return this['_'+type];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
                    this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = Game.getObjectById(roomStructures[this.name][type][0]);
                } else {
                    this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = undefined;
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

Room.prototype._checkMyRoomCache = function _checkMyRoomCache(){
    // if cache is expired or doesn't exist
    if(!myRoomStructuresExpiration[this.name] || !myRoomStructures[this.name] || myRoomStructuresExpiration[this.name] < Game.time){
        myRoomStructuresExpiration[this.name] = Game.time + getCacheExpiration();
        myRoomStructures[this.name] = _.groupBy(this.find(FIND_MY_STRUCTURES), s=>s.structureType);
        let i;
        for(i in myRoomStructures[this.name]){
            myRoomStructures[this.name][i] = _.map(myRoomStructures[this.name][i], s=>s.id);
        }
    }
};

Room.prototype._checkHostileRoomCache = function _checkHostileRoomCache(){
    // if cache is expired or doesn't exist
    if(!hostileRoomStructuresExpiration[this.name] || !hostileRoomStructures[this.name] || hostileRoomStructuresExpiration[this.name] < Game.time){
        hostileRoomStructuresExpiration[this.name] = Game.time + getCacheExpiration();
        hostileRoomStructures[this.name] = _.groupBy(this.find(FIND_HOSTILE_STRUCTURES), s=>s.structureType);
        let i;
        for(i in hostileRoomStructures[this.name]){
            hostileRoomStructures[this.name][i] = _.map(hostileRoomStructures[this.name][i], s=>s.id);
        }
    }
};

ownedMultipleList.forEach(function(type){
    const propName = "my" + _.capitalize(type) +'s';

    Object.defineProperty(Room.prototype, propName, {
        get: function(){
            if(this['_'+propName] && this['_'+propName+'_ts'] === Game.time){
                return this['_'+propName+'s'];
            } else {
                this._checkMyRoomCache();
                if(myRoomStructures[this.name][type]) {
                    this['_'+propName+'s_ts'] = Game.time;
                    return this['_'+propName+'s'] = myRoomStructures[this.name][type].map(Game.getObjectById);
                } else {
                    this['_'+propName+'s_ts'] = Game.time;
                    return this['_'+propName+'s'] = [];
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

ownedSingleList.forEach(function(type){
    const propName = "my" + _.capitalize(type);

    Object.defineProperty(Room.prototype, propName, {
        get: function(){
            if(this['_'+propName] && this['_'+propName+'_ts'] === Game.time){
                return this['_'+propName];
            } else {
                this._checkMyRoomCache();
                if(myRoomStructures[this.name][propName]) {
                    this['_'+propName+'_ts'] = Game.time;
                    return this['_'+propName] = Game.getObjectById(myRoomStructures[this.name][propName][0]);
                } else {
                    this['_'+propName+'_ts'] = Game.time;
                    return this['_'+propName] = undefined;
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

ownedMultipleList.forEach(function(type){
    const propName = "hostile" + _.capitalize(type) +'s';

    Object.defineProperty(Room.prototype, propName, {
        get: function(){
            if(this['_'+propName] && this['_'+propName+'_ts'] === Game.time){
                return this['_'+propName+'s'];
            } else {
                this._checkHostileRoomCache();
                if(hostileRoomStructures[this.name][type]) {
                    this['_'+propName+'s_ts'] = Game.time;
                    return this['_'+propName+'s'] = hostileRoomStructures[this.name][type].map(Game.getObjectById);
                } else {
                    this['_'+propName+'s_ts'] = Game.time;
                    return this['_'+propName+'s'] = [];
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

ownedSingleList.forEach(function(type){
    const propName = "hostile" + _.capitalize(type);

    Object.defineProperty(Room.prototype, propName, {
        get: function(){
            if(this['_'+propName] && this['_'+propName+'_ts'] === Game.time){
                return this['_'+propName];
            } else {
                this._checkHostileRoomCache();
                if(hostileRoomStructures[this.name][propName]) {
                    this['_'+propName+'_ts'] = Game.time;
                    return this['_'+propName] = Game.getObjectById(hostileRoomStructures[this.name][propName][0]);
                } else {
                    this['_'+propName+'_ts'] = Game.time;
                    return this['_'+propName] = undefined;
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

Room.prototype.forceStructureCacheUpdate = function() {
    roomStructuresExpiration[this.name] = 0;
    myRoomStructuresExpiration[this.name] = 0;
    hostileRoomStructuresExpiration[this.name] = 0;
};