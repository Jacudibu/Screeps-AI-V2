Object.defineProperty(Source.prototype, "nearbyContainerPosition", {
    get: function() {
        if (this._nearbyContainerPosition) {
            return this._nearbyContainerPosition;
        } else {
            const container = this._findNearbyContainer();
            if (container) {
                return this._nearbyContainerPosition = container.pos;
            }
            const constructionSite = this._findNearbyContainerConstructionSite();
            if (constructionSite) {
                return this._nearbyContainerPosition = constructionSite.pos;
            }

            return undefined
        }
    },
    enumerable: false,
    configurable: true,
});

Source.prototype._findNearbyContainer = function() {
    let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (containers.length === 0) {
        return undefined;
    }

    return containers[0];
};

Source.prototype._findNearbyContainerConstructionSite = function() {
    let constructionSites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (constructionSites.length === 0) {
        return undefined;
    }

    return constructionSites[0];
};