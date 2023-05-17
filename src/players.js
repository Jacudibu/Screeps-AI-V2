/* Wrapper for the data stored in Memory.players.
 */
global.Players = {
    getAll() {
        return Memory.players;
    },

    get(playerName) {
        return Memory.players[playerName]
    },

    addOwnedRoomToPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        Memory.players[playerName].ownedRooms.push(room.name);
    },

    removeOwnedRoomFromPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        _.remove(Memory.players[playerName].ownedRooms, roomName => roomName === room.name);
    },

    _ensurePlayerEntryExists(playerName) {
        if (!Memory.players[playerName]) {
            Memory.players[playerName] = {
                ownedRooms: [],
                reservedRooms: [],
                LOVE: 0,
            };
        }
    },
};