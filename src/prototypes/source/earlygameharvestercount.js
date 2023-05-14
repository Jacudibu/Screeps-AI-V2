const cache = {};
Object.defineProperty(Source.prototype, "earlyGameHarvesterCount", {
    get: function() {
        if (cache[this.id]) {
            return cache[this.id];
        } else {
            return cache[this.id] = 1 + utils.countFreeTilesAroundRoomObject(this) * (this.distanceToSpawn + 1) / 15;
        }
    }
});