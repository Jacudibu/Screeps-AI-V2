// TODO: Make this work for any prototype, not just for creeps.

const cachedValues = [
    "role",
];

// noinspection ConstantIfStatementJS,PointlessBooleanExpressionJS
if (false) {
    // for autocompletion in IDE

    // noinspection UnreachableCodeJS
    Creep.prototype.role = undefined;
}

const caches = {};
const addCachedProperty = function(propertyName) {
    caches[propertyName] = {};
    Object.defineProperty(Creep.prototype, propertyName, {
        get: function() {
            if (caches[propertyName][this.name]) {
                return caches[propertyName][this.name];
            }

            if (this.memory[propertyName]) {
                caches[propertyName][this.name] = this.memory[propertyName];
                return caches[propertyName][this.name];
            }

            return caches[propertyName][this.name] = null;
        },

        set: function(value) {
            caches[propertyName][this.name] = value;

            if (value) {
                this.memory[propertyName] = value;
            } else {
                delete this.memory[propertyName];
            }
        },
        configurable: false,
        enumerable: false,
    });
};

for (const cachedValue of cachedValues) {
    addCachedProperty(cachedValue);
}

utility.deleteCreepCacheOnDeath = function(creepName) {
    for (const cachedValue of cachedValues) {
        delete caches[cachedValue][creepName];
    }
};