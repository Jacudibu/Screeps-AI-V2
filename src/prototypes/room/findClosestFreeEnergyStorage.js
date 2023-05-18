Room.prototype.findClosestFreeEnergyStorageTo = function(pos, amount) {
    const towersBelowThreshold = this.myTowers.filter(tower => tower.energy < tower.energyCapacity * 0.25);
    if (towersBelowThreshold.length > 0) {
        return Utils.getClosestRoomObjectToPosition(pos, towersBelowThreshold);
    }

    let spawns = this.mySpawns.filter(spawn => spawn.energy < spawn.energyCapacity);
    if (spawns.length > 0) {
        return Utils.getClosestRoomObjectToPosition(pos, spawns);
    }

    let extension = this.getClosestEmptyExtensionToPosition(this, amount);
    if (extension !== ERR_NOT_FOUND) {
        return extension;
    }
};

Room.prototype.getClosestEmptyExtensionToPosition = function(pos, energy = 0) {
    if (this.freeExtensions.length === 0) {
        return ERR_NOT_FOUND;
    }

    let closestExtension = Utils.getClosestRoomObjectToPosition(pos, this.freeExtensions);

    if (energy > (closestExtension.energyCapacity - closestExtension.energy)) {
        _.remove(this._freeExtensions, extension => extension.id === closestExtension.id);
        _.remove(freeRoomExtensions[this.name], extensionsId => extensionsId === closestExtension.id);
    }

    return closestExtension;
};