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
    }

    static evaluateRemote(hive, remoteData, room) {
        const storagePos = hive.layout.core.storage[0];
        const hiveRoomStoragePosition = new RoomPosition(storagePos.x, storagePos.y, hive.roomName);
        remoteData.sourceDistance = _.map(room.sources,
                s => PathFinder.search(s.pos, hiveRoomStoragePosition, {maxRooms: remoteData.distance + 1}).path.length); // TODO: This ignores potential tunnels

        remoteData.max_early_workers = _.sum(remoteData.sourceDistance, dist => 1 + Math.trunc(dist / 50));
    }
}

module.exports = RemoteScanner;
