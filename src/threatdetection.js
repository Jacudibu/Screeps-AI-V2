export class ThreatDetection {
    static threat = {};
    static THREAT_TYPES = {
        HARMLESS: 0,
        WORK: 1,
        MELEE: 2,
        RANGED: 3
    };

    static run() {
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const hostiles = room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length === 0) {
                // TODO: notify hives that threat is gone
                this.threat[room] = undefined;
            }

            let threat = {
                players: [],
                onlyNPCs: false,         // will be set later
                canHarmCreeps: false,    // ^
                canHarmBuildings: false, // ^
                creepCount: 0,

                attack: 0,
                ranged_attack: 0,
                heal: 0,
                tough: 0,
                work: 0,
                claim: 0,
                move: 0,
                carry: 0,
                total: 0,

                timestamp: Game.time,
            };

            for (let creep of hostiles) {
                if (!threat.players.includes(creep.owner.username)) {
                    threat.players.push(creep.owner.username);
                }

                const partCounts = creep.countActiveBodyPartsAndApplyBoostWeighting();
                for (const partName in partCounts) {
                    threat[partName] += partCounts[partCounts];
                }
                threat.total += creep.body.length;
            }

            threat.onlyNPCs = threat.players.length === 1
                && (threat.players[0] === INVADER_PLAYER_NAME || threat.players[0] === SOURCE_KEEPER_PLAYER_NAME);

            threat.canHarmCreeps = threat.attack > 0 || threat.ranged_attack > 0;
            threat.canHarmBuildings = threat.canHarmCreeps || threat.work > 0;

            if (this.threat[room] === undefined) {
                // TODO: notify hives that a new threat was detected
            }

            this.threat = threat;
        }
    }
}

global.ThreatDetection = ThreatDetection;
profiler.registerClass(ThreatDetection, "ThreatDetection");