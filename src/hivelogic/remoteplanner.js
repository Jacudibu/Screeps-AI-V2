const maxDistance = 3;

class RemotePlanner {
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
                    hive.lairs[potentialRemote.name] = {route: potentialRemote.route};
                }
                continue;
            }

            hive.remotes[potentialRemote.name] = {
                route: potentialRemote.route,
                max_early_workers: 1,
                current_early_workers: 0,
            };
        }
    }

    static _discoverPotentialRemoteRooms(hive, maxDistance) {
        let discoveredRooms = [];
        let queue = [{name: hive.roomName, distance: 0}];

        while (queue.length > 0) {
            const current = queue.shift();
            discoveredRooms.push(current);

            const neighbors = Game.map.describeExits(current.name);
            for (const x in neighbors) {
                const neighborName = neighbors[x];
                if (_.any(discoveredRooms, x => x.name === neighborName)) {
                    continue;
                }

                const obj = {
                    name: neighborName,
                    distance: current.distance + 1,
                };

                if (current.route === undefined || current.name === hive.roomName) {
                    obj.route = [];
                } else {
                    obj.route = [current.name, ...current.route]
                }

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
                s => PathFinder.search(s.pos, hive.pos).path.length); // TODO: This ignores potential tunnels

        remoteData.max_early_workers = _.sum(remoteData.sourceDistance, dist => 1 + Math.trunc(dist / 50));
        this.orderRemotesByValue(hive);
    }

    static orderRemotesByValue(hive) {
        const oldData = hive.remotes;
        let dataAsArray = [];

        for (const name in oldData) {
            dataAsArray.push({name: name, data: oldData[name]})
        }

        dataAsArray = _.sortBy(dataAsArray, v => _.min(v.data.sourceDistance));

        const newData = {};
        for (const value of dataAsArray) {
            newData[value.name] = value.data;
        }

        hive.remotes = newData;
    }
}

global.resetHiveRemotes = function() {
    for (const hiveName in Hives) {
        RemotePlanner.setupRemoteData(Hives[hiveName]);
        log.info(JSON.stringify(Hives[hiveName].remotes, null,  2));
        log.info(JSON.stringify(Hives[hiveName].lairs, null,  2));
    }
};

module.exports = RemotePlanner;
profiler.registerClass(RemotePlanner, "RemotePlanner");