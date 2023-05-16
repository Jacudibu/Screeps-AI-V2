/* Stores a room's layout.
 * Keys include all existing STRUCTURE_TYPEs as well as some extra custom stuff.
 */
Object.defineProperty(Room.prototype, "layout", {
    get: function() {
        if (this.memory.layout === undefined) {
            this.memory.layout = {};
        }
        return this.memory.layout;
    },

    set: function(value) {
        if (value) {
            this.memory.layout = value;
        } else {
            delete this.memory.layout;
        }
    },
    configurable: false,
    enumerable: true,
});
