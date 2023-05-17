const scoutData = {
    initializePermanentRoomData(room) {
        if (room.find(FIND_SOURCES).length > 0) {
            room.memory.sourceCount = room.find(FIND_SOURCES).length;
        }

        if (room.find(FIND_MINERALS).length > 0) {
            room.memory.mineralType = room.find(FIND_MINERALS)[0].mineralType;
        }

        // TODO: Store permanent portal data
    },

    setupDataForOwnedRoom(room) {
        const scoutData = {};
        scoutData.owner = room.controller.owner.username;
        scoutData.rcl = room.controller.level;

        if (scoutData.owner !== PLAYER_NAME) {
            scoutData.towers = room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length;
        }

        if (room.controller.safeMode) {
            scoutData.safeMode = room.controller.safeMode;
        }

        if (room.controller.safeModeCooldown) {
            scoutData.safeModeCooldown = room.controller.safeModeCooldown;
        }

        return scoutData;
    },

    setupDataForReservedRoom(room) {
        const scoutData = {};

        scoutData.owner = room.controller.reservation.username;

        return scoutData;
    },

    setupDataForUnownedRoom(room) {
        const scoutData = {};

        scoutData.claimable = true;

        return scoutData;
    },

    handleDataChanges(room, oldData, newData) {
        if (oldData && oldData.owner) {
            if (newData.owner) {
                if (oldData.owner === newData.owner) {
                    // Nothing Changed
                } else {
                    // owned Room changed its owner
                    Players.removeOwnedRoomFromPlayer(room, oldData.owner);
                    Players.addOwnedRoomToPlayer(room, newData.owner);
                }
            } else {
                // owned Room lost its owner
                Players.removeOwnedRoomFromPlayer(room, oldData.owner);
            }
        } else if (newData.owner) {
            // empty Room got claimed
            Players.addOwnedRoomToPlayer(room, newData.owner);
        }
    },
};

Room.prototype.updateScoutData = function() {
    delete this.memory.isScoutOnRoute;

    const oldScoutData = this.memory.scoutData;
    let newScoutData;

    if (!oldScoutData) {
        scoutData.initializePermanentRoomData(this);
    }

    if (this.controller) {
        if (this.controller.owner) {
            newScoutData = scoutData.setupDataForOwnedRoom(this);
        } else if (this.controller.reservation) {
            newScoutData = scoutData.setupDataForReservedRoom(this);
        } else {
            newScoutData = scoutData.setupDataForUnownedRoom(this);
        }
    }

    this.memory.lastScouted = Game.time;
    this.memory.scoutData = newScoutData;
    scoutData.handleDataChanges(this, oldScoutData, newScoutData);
};