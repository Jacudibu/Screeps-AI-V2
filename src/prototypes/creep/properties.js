const propertyStrings = [
    "role",
    "task",
    "taskTargetId"
];

Creep.prototype.role = undefined;
Creep.prototype.task = undefined;
Creep.prototype.taskTargetId = undefined;

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