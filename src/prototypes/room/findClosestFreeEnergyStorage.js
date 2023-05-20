Room.prototype.findClosestFreeEnergyStorageTo = function(pos, amount) {
    const towersBelowThreshold = this.myTowers.filter(x => x.energy < x.energyCapacity * 0.25);
    if (towersBelowThreshold.length > 0) {
        return Utils.getClosestRoomObjectToPosition(pos, towersBelowThreshold);
    }

    let spawns = this.mySpawns.filter(x => x.energy < x.energyCapacity);
    if (spawns.length > 0) {
        return Utils.getClosestRoomObjectToPosition(pos, spawns);
    }

    const extensions = this.myExtensions.filter(x => x.energy < x.energyCapacity);
    if (extensions.length > 0) {
        return Utils.getClosestRoomObjectToPosition(pos, extensions);
    }

    return null;
};

Room.prototype.getClosestEmptyExtensionToPosition = function(pos, energy = 0) {
    const extensions = this.myExtensions.filter(x => x.energy < x.energyCapacity);

    // if (this.freeExtensions.length === 0) {
    //     return ERR_NOT_FOUND;
    // }
    //
    // let closestExtension = Utils.getClosestRoomObjectToPosition(pos, this.freeExtensions);
    //
    // if (energy > (closestExtension.energyCapacity - closestExtension.energy)) {
    //     _.remove(this._freeExtensions, extension => extension.id === closestExtension.id);
    //     _.remove(freeRoomExtensions[this.name], extensionsId => extensionsId === closestExtension.id);
    // }
    //
    // return closestExtension;
};