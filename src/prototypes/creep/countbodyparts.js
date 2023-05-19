Creep.prototype.countActiveBodyPartsAndApplyBoostWeighting = function() {
    const result = {};
    for (const part of this.body) {
        if (part.hits === 0) {
            continue;
        }

        if (result[part.type] === undefined) {
            result[part.type] = 0;
        }

        if (part.boost === undefined) {
            result[part.type] += 1;
        } else {
            result[part.type] += 1 + boostTiers[part.boost];
        }
    }

    return result;
};
