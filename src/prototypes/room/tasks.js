/* Tasks a room wants to process eventually.
 * It's a dictionary with TASK keys. Values depend on the individual tasks, but should usually be arrays of task objects.
 *
 * **Make sure the task key you want to access exits.
 * TODO: Once we figure out which tasks we want, maybe initialize those on global reset.**
 */
Object.defineProperty(Room.prototype, "tasks", {
    get: function() {
        if (this.memory.tasks === undefined) {
            this.memory.tasks = {};
        }
        return this.memory.tasks;
    },

    set: function(value) {
        if (value) {
            this.memory.tasks = value;
        } else {
            delete this.memory.tasks;
        }
    },
    configurable: false,
    enumerable: true,
});
