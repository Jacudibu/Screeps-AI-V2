class RemoteScanner {
    static setupRemoteData(hive) {
        const mainRoomNeighbors = Game.map.describeExits(hive.roomName);
        let neighborRooms = [];

        // This currently hardcodes remote distance to 2, but that shouldn't be a problem...
        for (const dir in mainRoomNeighbors) {
            const roomName = mainRoomNeighbors[dir];

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

                neighborRooms.push({name: neighborName, distance: 2});
            }
        }

        hive.remotes = {};
        for (const r of neighborRooms) {
            if (utils.isRoomHighway(r.name)) {
                continue;
            }

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

    static orderRemotesByValue(hive) {
        const oldData = hive.remotes;
        const values = [];

        for (const name in oldData) {
            values.push({name: name, data: oldData[name]})
        }

        _.sortBy(values, v => _.min(v.data.sources));

        const newData = {};
        for (const value of values) {
            newData[value.name] = value.data;
        }

        return newData;
    }
}

global.resetHiveRemotes = function() {
    for (const hiveName in Hives) {
        RemoteScanner.setupRemoteData(Hives[hiveName]);
    }
}

global.debugOrdering = function() {
    for (const hiveName in Hives) {
        log.info(JSON.stringify(RemoteScanner.orderRemotesByValue(Hives[hiveName]), null,  2));
    }
}

module.exports = RemoteScanner;
