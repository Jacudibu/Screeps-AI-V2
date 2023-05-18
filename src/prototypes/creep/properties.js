const propertyStrings = [
    "origin",
    "role",
    "task",
    "taskTargetId",
    "targetRoomName"
];

// This creep's spawn location.
Creep.prototype.origin = undefined;
Creep.prototype.role = undefined;
Creep.prototype.task = undefined;
Creep.prototype.taskTargetId = undefined;
Creep.prototype.targetRoomName = undefined;

const addProperty = function(propertyName) {
    Object.defineProperty(Creep.prototype, propertyName, {
        get: function() {
            return this.memory[propertyName];
        },

        set: function(value) {
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

for (const prop of propertyStrings) {
    addProperty(prop);
}