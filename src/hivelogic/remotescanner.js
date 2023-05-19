const maxDistance = 3;

class RemoteScanner {
    static setupRemoteData(hive) {
        let discoveredRooms = this._discoverPotentialRemoteRooms(hive, maxDistance);

        hive.remotes = {};
        hive.lairs = {};
        for (const potentialRemote of discoveredRooms) {
            if (Utils.isRoomHighway(potentialRemote.name)) {
                continue;
            }

            if (Utils.isRoomCenterRoom(potentialRemote.name)) {
                if (Utils.isRoomSourceKeeperLair(potentialRemote.name)) {
                    hive.lairs[potentialRemote.name] = {distance: potentialRemote.distance};
                }
                continue;
            }

            hive.remotes[potentialRemote.name] = {
                distance: potentialRemote.distance,
                max_early_workers: 1,
            };
        }
    }

    static _discoverPotentialRemoteRooms(hive, maxDistance) {
        let discoveredRooms = [];
        let queue = [{name: hive.roomName, distance: 0}];

        while (queue.length > 0) {
            const current = queue.shift()
            discoveredRooms.push(current);

            const neighbors = Game.map.describeExits(current.name);
            for (const x in neighbors) {
                const neighborName = neighbors[x];
                if (_.any(discoveredRooms, x => x.name === neighborName)) {
                    continue;
                }

                const obj = {name: neighborName, distance: current.distance + 1}
                discoveredRooms.push(obj);

                if (obj.distance < maxDistance) {
                    queue.push(obj);
                }
            }
        }

        discoveredRooms.shift(); // getting rid of the hive room itself which was added in the first step
        return discoveredRooms;
    }

    static evaluateRemote(hive, remoteData, room) {
        remoteData.sourceDistance = _.map(room.sources,
                s => PathFinder.search(s.pos, hive.pos, {maxRooms: remoteData.distance + 1}).path.length); // TODO: This ignores potential tunnels

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
        log.info(JSON.stringify(Hives[hiveName].remotes, null,  2));
        log.info(JSON.stringify(Hives[hiveName].lairs, null,  2));
    }
}

global.debugOrdering = function() {
    for (const hiveName in Hives) {
        log.info(JSON.stringify(RemoteScanner.orderRemotesByValue(Hives[hiveName]), null,  2));
    }
}

module.exports = RemoteScanner;
