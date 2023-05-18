const distanceToSpawns = {};
Object.defineProperty(Source.prototype, "distanceToSpawn", {
    get: function() {
        if (distanceToSpawns[this.id]) {
            return distanceToSpawns[this.id];
        } else {
            return distanceToSpawns[this.id] = this._calculateDistanceToSpawn();
        }
    }
});

Source.prototype._calculateDistanceToSpawn = function() {
    if (this.room.mySpawns.length === 0) {
        const spawnConstructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: cs => cs.structureType === STRUCTURE_SPAWN});
        if (spawnConstructionSites.length > 0) {
            const travelPath = traveler.Traveler.findTravelPath(this, spawnConstructionSites[0]);
            return travelPath.path.length;
        }

        log.warning(this.room + "Distance to spawn was called, but there is no spawn in room!");
        return;
    }

    let travelPath = traveler.Traveler.findTravelPath(this, this.room.mySpawns[0]);
    return travelPath.path.length;
};