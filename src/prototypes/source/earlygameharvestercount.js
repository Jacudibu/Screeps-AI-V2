const cache = {};
Object.defineProperty(Source.prototype, "earlyGameHarvesterCount", {
    get: function() {
        if (cache[this.id]) {
            return cache[this.id];
        } else {
            return cache[this.id] = Math.trunc(1 + Utils.countFreeTilesAroundRoomObject(this) * (this.distanceToSpawn + 1) / 20);
        }
    }
});