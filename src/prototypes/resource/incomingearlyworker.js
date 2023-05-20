Object.defineProperty(Resource.prototype, 'incomingEarlyWorkerTick', {
    get: function() {
        if (this._incomingEarlyWorkerTick !== undefined) {
            return this._incomingEarlyWorkerTick;
        }

        return 0;
    },
    set: function(value) {
        this._incomingEarlyWorkerTick = value;
    },
    enumerable: false,
    configurable: true
});