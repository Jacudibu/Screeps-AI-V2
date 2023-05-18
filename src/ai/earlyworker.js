const earlyWorker = {
    run(creep) {
        switch (creep.task) {
            case TASK.MOVE_TO_ROOM:
                if (creep.moveToRoom() === TASK_RESULT.TARGET_REACHED) {
                    if (creep.room.name === creep.origin) {
                        this._figureOutHowToUseEnergy(creep);
                    } else {
                        creep.setTask(TASK.HARVEST_REMOTE_ENERGY);
                        this._harvestRemoteEnergy(creep);
                    }
                    this.run();
                }
                return;
            case TASK.HARVEST_ENERGY: return this._harvestEnergy(creep);
            case TASK.HARVEST_REMOTE_ENERGY: return this._harvestRemoteEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this._depositEnergy(creep);
            case TASK.BUILD: return this._build(creep)
            case TASK.UPGRADE_CONTROLLER: return this._upgradeController(creep)
            case TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES: return this._upgradeControllerButLookOutForConstructionSites(creep)
            default: {
                // TODO: error handling
                this._getMoreEnergy(creep);
            }
        }
    },

    _harvestEnergy(creep) {
        if(creep.store.getFreeCapacity() === 0) {
            this._figureOutHowToUseEnergy(creep);
            this.run(creep);
            return;
        }

        this._goHarvesting(creep);
    },

    _harvestRemoteEnergy(creep) {
        if(creep.store.getFreeCapacity() === 0) {
            creep.setTask(TASK.MOVE_TO_ROOM);
            creep.targetRoomName = creep.origin;
            const remoteData = Hives[creep.origin].remotes[creep.room];
            if (remoteData.current_early_workers) {
                remoteData.current_early_workers -= 1;
            }
            this.run(creep);
            return;
        }

        this._goHarvesting(creep);
    },

    _goHarvesting(creep) {
        const source = Game.getObjectById(creep.taskTargetId);
        if (source === null) {
            return this._getMoreEnergy(creep);
        }

        if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.travelTo(source, {stuckValue: 1});
        }
    },

    _figureOutHowToUseEnergy(creep, didJustFinishConstructingSomething = false) {
        let target = this._findDepositEnergyTarget(creep);
        if (target !== undefined) {
            creep.setTask(TASK.DEPOSIT_ENERGY, target.id);
            return;
        }

        target = this._findConstructionSite(creep)
        if (target !== undefined) {
            creep.setTask(TASK.BUILD, target.id);
            return;
        }

        if (didJustFinishConstructingSomething) {
            creep.setTask(TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES, undefined);
        } else {
            creep.setTask(TASK.UPGRADE_CONTROLLER, undefined);
        }
    },

    _findConstructionSite(creep) {
        const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            return constructionSites[0];
        }

        return undefined;
    },

    _findDepositEnergyTarget(creep) {
        const spawn = creep.room.mySpawns[0];
        if (spawn.canStillStoreEnergy()) {
            return spawn;
        }

        const extensions = _.filter(creep.room.myExtensions, extension => extension.canStillStoreEnergy());
        if (extensions.length > 0) {
            return extensions[0];
        }

        const towers = _.filter(creep.room.myTowers, tower => tower.canStillStoreEnergy());
        if (towers.length > 0) {
            return towers[0];
        }

        return undefined;
    },

    _depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._getMoreEnergy(creep);
        }

        const target = Game.getObjectById(creep.taskTargetId);
        const result = creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                return;
            case ERR_FULL:
                this._figureOutHowToUseEnergy(creep);
                this.run(creep);
                return;
            case ERR_NOT_IN_RANGE:
                creep.travelTo(target);
                return;
        }

        this.run(creep);
    },

    _getMoreEnergy(creep) {
        // TODO: Search for drops or containers / tombstones / storage to pick up instead of mining

        const source = creep.roomName === creep.origin
            ? this._findFreeHarvestableSource(creep)
            : this._findHarvestableRemoteSource(creep);
        creep.setTask(TASK.HARVEST_ENERGY, source.id);

        this.run(creep);
    },

    _findHarvestableRemoteSource(creep) {
        const allEarlyWorkers = creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.role === ROLE.EARLY_WORKER});
        // TODO: source distance should be cached in hive.remotes, sort by that. If it is not, this means the remote hasn't been evaluated yet. Do that now!~
        // ...issue with that: We wouldn't want to cache the source id in remote memory, right? Just the source distance
        // oh, but room.sources should always have the same order, so this is fiiine (tm) Nyehehehehe!
        const sources = creep.room.sources;

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const creepsAssignedToSource = utils.count(allEarlyWorkers, creep => creep.taskTargetId === source.id);

            if (creepsAssignedToSource < utils.countFreeTilesAroundRoomObject(source)) { // TODO: source.remoteWorkerCount(hive) or something like that
                return source;
            }
        }

        log.warning(creep + "Unable to determine which source to pick, choosing the first one instead...")
        return sources[0];
    },

    _findFreeHarvestableSource(creep) {
        const allEarlyWorkers = creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.role === ROLE.EARLY_WORKER});
        const sources = _.sortBy(creep.room.sources, source => source.distanceToSpawn);

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const creepsAssignedToSource = utils.count(allEarlyWorkers, creep => creep.taskTargetId === source.id);

            if (creepsAssignedToSource < source.earlyGameHarvesterCount){
                return source;
            }
        }

        const hive = Hives[creep.room.name]
        if (hive === undefined) {
            log.warning(creep + "Unable to determine which source to pick, choosing the first one instead...")
            return sources[0];
        }

        for (const remoteName in hive.remotes) { // TODO: this expects hives.remotes to be sorted by value to work efficiently, but will also allow us to get vision to calculate that fairly easily.
            const remote = hive.remotes[remoteName];
            if (remote.max_early_workers === undefined) {
                remote.max_early_workers = 1;
                remote.current_early_workers = 1;
            } else if (remote.current_early_workers < remote.max_early_workers) {
                remote.current_early_workers += 1;
            } else {
                continue;
            }

            creep.targetRoomName = remoteName;
            creep.setTask(TASK.MOVE_TO_ROOM);
            this.run();
            return;
        }

        log.warning(creep + "Unable to determine which source to pick, choosing the first one instead...")
        return sources[0];
    },

    _build(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._getMoreEnergy(creep);
        }

        const target = Game.getObjectById(creep.taskTargetId);
        if (target === undefined) {
            this._figureOutHowToUseEnergy(creep, true);
            this.run(creep);
            return;
        }

        switch (creep.build(target)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                return creep.travelTo(target, {maxRooms: 1, range: 2, stuckValue: 1});
            case ERR_NOT_ENOUGH_RESOURCES:
                this._getMoreEnergy(creep);
                break;
            case ERR_INVALID_TARGET:
                // Probably finished building or so
                this._figureOutHowToUseEnergy(creep, true);
                this.run(creep);
                return;
            default:
                log.warning(creep + "building " + target + " " + creep.build(creep.taskTargetId));
                break;
        }
    },

    _upgradeController(creep) {
        switch (creep.upgradeController(creep.room.controller)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                return creep.travelTo(creep.room.controller, {maxRooms: 1, range: 2, stuckValue: 1});
            case ERR_NOT_ENOUGH_RESOURCES:
                this._getMoreEnergy(creep);
                this.run(creep);
                break;
            default:
                log.warning(creep + "upgrading controller" + " " + creep.upgradeController(creep.room.controller));
                creep.setTask(TASK.DEPOSIT_ENERGY, undefined)
                break;
        }
    },

    _upgradeControllerButLookOutForConstructionSites(creep) {
        const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            creep.setTask(TASK.BUILD, constructionSites[0].id);
            creep.say(creepTalk.surpriseTargetChange);
            this.run(creep);
            return;
        }

        this._upgradeController(creep);
    }
};

module.exports = earlyWorker;
profiler.registerObject(earlyWorker, "earlyWorker")