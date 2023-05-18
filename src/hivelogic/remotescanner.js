class RemoteScanner {
    static setupRemoteData(hive) {
        const mainRoomNeighbors = Game.map.describeExits(hive.roomName);
        let neighborRooms = [];

        // This currently hardcodes remote distance to 2, but that shouldn't be a problem...
        for (const dir in mainRoomNeighbors) {
            const roomName = mainRoomNeighbors[dir];
            if (utils.isRoomHighway(roomName)) {
                continue;
            }

            neighborRooms.push({name: roomName, distance: 1});
            const neighborNeighbors = Game.map.describeExits(roomName);
            for (const dirdir in neighborNeighbors) {
                const neighborName = neighborNeighbors[dirdir];
                if (neighborName === hive.roomName) {
                    continue;
                }

                if (_.contains(neighborRooms, neighborName)) {
                    continue;
                }

                if (utils.isRoomHighway(neighborName)) {
                    continue;
                }

                neighborRooms.push({name: neighborName, distance: 2});
            }
        }

        hive.remotes = {};
        for (const r of neighborRooms) {
            hive.remotes[r.name] = {
                distance: r.distance,
            };
        }

        const storagePos = hive.layout.core.storage[0];
        const hiveRoomStoragePosition = new RoomPosition(storagePos.x, storagePos.y, hive.roomName);
        for (const remoteName in hive.remotes) {
            const remoteData = hive.remotes[remoteName];
            this._evaluateRemote(hiveRoomStoragePosition, remoteData, remoteName);
        }
    }

    // Technically we don't really wanna evaluate at rcl1 or rcl2 anyway and just go at it
    static _evaluateRemote(hiveRoomStoragePosition, remoteData, remoteName) {
        const room = Game.rooms[remoteName];
        if (room === undefined) {
            return;
        }

        const sourceDistance = _.sum(room.sources, s => s.pos.findPathTo(hiveRoomStoragePosition)); // TODO: This ignores potential tunnels
        remoteData.value = room.sources.length * 20 - (sourceDistance / room.sources.length);
    }
}

module.exports = RemoteScanner;
