class GameManager {
    constructor() {
        this.defaults = {
            catnip: 0,
            lifetimeCatnip: 0,
            goldenYarn: 0,
            totalGoldenYarn: 0,
            ascensions: 0,
            celestialNip: 0,
            celestialPerks: [],
            goldenUpgrades: [],
            generators: {},
            upgrades: [],
            buyAmount: 1, // Default buy amount
            lastTick: Date.now()
        };

        this.state = this.loadState();
        this.generatorDefs = GENERATORS_DATA;
        this.upgradeDefs = UPGRADES_DATA;
        this.goldenDefs = GOLDEN_UPGRADES_DATA;

        // Calculate offline progress before UI init so CpS is based on saved state
        const offlineResult = this.calculateOfflineProgress();

        this.ui = new UI(this);

        // Show offline popup now that the UI exists
        if (offlineResult) {
            this.ui.showOfflineModal(offlineResult);
        }

        this.lastTime = performance.now();
        this.saveInterval = 5000; // auto save every 5 seconds
        this.timeSinceLastSave = 0;

        // Discord RPC update interval
        this.rpcUpdateInterval = 15000; // update Discord status every 15 seconds
        this.timeSinceLastRPC = 0;

        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    loadState() {
        const saved = localStorage.getItem('adcat_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // merge with defaults to avoid undefined properties
                return { ...this.defaults, ...parsed };
            } catch (e) {
                console.error("Failed to load save", e);
                return { ...this.defaults };
            }
        }
        return { ...this.defaults };
    }

    saveState() {
        this.state.lastTick = Date.now();
        localStorage.setItem('adcat_save', JSON.stringify(this.state));
    }

    calculateOfflineProgress() {
        const now = Date.now();
        const diffInSeconds = (now - this.state.lastTick) / 1000;
        this.state.lastTick = now;

        const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 hour cap
        const cappedSeconds = Math.min(diffInSeconds, MAX_OFFLINE_SECONDS);

        if (cappedSeconds < 60) return null; // less than a minute, don't show popup

        let cps = this.calculateCpS();
        if (this.state.goldenUpgrades.includes('gold_offline')) cps *= 2;

        if (cps <= 0) return null;

        const gained = cps * cappedSeconds;
        this.state.catnip += gained;
        this.state.lifetimeCatnip += gained;

        return {
            gained,
            seconds: cappedSeconds,
            wasCapped: diffInSeconds > MAX_OFFLINE_SECONDS,
        };
    }

    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000; // in seconds
        this.lastTime = currentTime;

        this.tick(deltaTime);

        this.timeSinceLastSave += deltaTime * 1000;
        if (this.timeSinceLastSave >= this.saveInterval) {
            this.saveState();
            this.timeSinceLastSave = 0;
        }

        this.timeSinceLastRPC += deltaTime * 1000;
        if (this.timeSinceLastRPC >= this.rpcUpdateInterval) {
            this.updateDiscordRPC();
            this.timeSinceLastRPC = 0;
        }

        requestAnimationFrame(this.gameLoop);
    }

    updateDiscordRPC() {
        if (window.electronAPI) {
            window.electronAPI.updateRPC({
                catnip: this.ui.formatNumber(this.state.catnip),
                cps: this.ui.formatNumber(this.calculateCpS()),
                ascensions: this.state.ascensions
            });
        }
    }

    tick(deltaTime) {
        const cps = this.calculateCpS();
        const gain = cps * deltaTime;
        this.state.catnip += gain;
        this.state.lifetimeCatnip += gain;

        this.ui.update(this.state);
    }

    calculateCpS() {
        let totalCps = 0;
        let globalMultiplier = 1;

        // Golden Yarn Bonus: 3% per yarn (2% production + 1% CpS bonus)
        globalMultiplier *= 1 + (this.state.goldenYarn * 0.03);

        // Standard Global Multipliers
        this.state.upgrades.forEach(upgId => {
            const def = this.upgradeDefs.find(u => u.id === upgId);
            if (def && def.target === 'global') {
                globalMultiplier *= def.multiplier;
            }
        });

        // Golden global multipliers
        this.state.goldenUpgrades.forEach(upgId => {
            const def = this.goldenDefs.find(u => u.id === upgId);
            if (def && def.type === 'global_multiplier') {
                globalMultiplier *= def.value;
            }
        });

        // Celestial Global Perks
        if (this.state.celestialPerks.includes('perk_nebula_purr')) {
            globalMultiplier *= 25;
        }

        // Calculate production for each generator
        for (const genId in this.state.generators) {
            const owned = this.state.generators[genId];
            if (owned > 0) {
                totalCps += this.getGeneratorProduction(genId) * owned;
            }
        }

        return totalCps * globalMultiplier;
    }

    getGeneratorProduction(genId) {
        const def = this.generatorDefs.find(g => g.id === genId);
        if (!def) return 0;

        let production = def.baseProduction;

        // Apply specific standard multipliers
        this.state.upgrades.forEach(upgId => {
            const upgDef = this.upgradeDefs.find(u => u.id === upgId);
            if (upgDef && upgDef.target === genId) {
                production *= upgDef.multiplier;
            }
        });

        // Apply Golden Synergy
        this.state.goldenUpgrades.forEach(upgId => {
            const upgDef = this.goldenDefs.find(u => u.id === upgId);
            if (upgDef && upgDef.type === 'synergy' && upgDef.target.includes(genId)) {
                production *= upgDef.value;
            }
        });

        return production;
    }

    getGeneratorCost(genId) {
        return this.getBulkCost(genId, this.state.buyAmount || 1);
    }

    getBulkCost(genId, amount) {
        const def = this.generatorDefs.find(g => g.id === genId);
        if (!def) return 0;

        const owned = this.state.generators[genId] || 0;
        const multiplier = def.costMultiplier;
        let basePrice = def.baseCost * Math.pow(multiplier, owned);

        // Apply Golden Discount
        if (this.state.goldenUpgrades.includes('gold_discount')) {
            basePrice *= 0.9;
        }

        if (amount === 'max') {
            amount = this.getMaxAffordable(genId);
            if (amount <= 0) return basePrice; // Show next 1 cost if afford none
        }

        if (amount <= 1) return basePrice;

        // Geometric series sum: a(r^n - 1) / (r - 1)
        const totalCost = basePrice * (Math.pow(multiplier, amount) - 1) / (multiplier - 1);
        return totalCost;
    }

    getMaxAffordable(genId) {
        const def = this.generatorDefs.find(g => g.id === genId);
        if (!def) return 0;

        const owned = this.state.generators[genId] || 0;
        const multiplier = def.costMultiplier;
        let a = def.baseCost * Math.pow(multiplier, owned);

        if (this.state.goldenUpgrades.includes('gold_discount')) {
            a *= 0.9;
        }

        if (this.state.catnip < a) return 0;

        // n = log_r((catnip * (r - 1) / a) + 1)
        const n = Math.floor(Math.log((this.state.catnip * (multiplier - 1) / a) + 1) / Math.log(multiplier));
        return Math.max(0, n);
    }

    getGeneratorDefs() { return this.generatorDefs; }
    getUpgradeDefs() { return this.upgradeDefs; }
    getGoldenDefs() { return this.goldenDefs; }

    getClickPower() {
        let power = 1;

        // Golden Click Bonus (1% of CpS)
        if (this.state.goldenUpgrades.includes('gold_click')) {
            power += this.calculateCpS() * 0.01;
        }

        // Celestial Speed of Light Claws (5% of CpS)
        if (this.state.celestialPerks.includes('perk_speed_claws')) {
            power += this.calculateCpS() * 0.05;
        }

        this.state.upgrades.forEach(upgId => {
            const def = this.upgradeDefs.find(u => u.id === upgId);
            if (def && def.target === 'click') {
                power *= def.multiplier;
            }
        });

        return power;
    }

    manualClick() {
        const power = this.getClickPower();
        this.state.catnip += power;
        this.state.lifetimeCatnip += power;
        this.ui.update(this.state);
    }

    buyGenerator(genId) {
        let amount = this.state.buyAmount || 1;
        if (amount === 'max') {
            amount = this.getMaxAffordable(genId);
        }
        
        const cost = this.getBulkCost(genId, amount);

        if (this.state.catnip >= cost && amount > 0) {
            this.state.catnip -= cost;
            if (!this.state.generators[genId]) {
                this.state.generators[genId] = 0;
            }
            this.state.generators[genId] += amount;
        }
    }

    buyUpgrade(upgId) {
        const def = this.upgradeDefs.find(u => u.id === upgId);

        if (def && this.state.catnip >= def.cost && !this.state.upgrades.includes(upgId)) {
            this.state.catnip -= def.cost;
            this.state.upgrades.push(upgId);
        }
    }

    // Prestige Mechanics

    calculatePendingYarn() {
        // Formula: cube root of (lifetime catnip / 64,000,000)
        if (this.state.lifetimeCatnip < 64000000) return 0;
        let yarn = Math.floor(Math.cbrt(this.state.lifetimeCatnip / 64000000));

        // Celestial Yarn Magnet Perk (+50% Yarn)
        if (this.state.celestialPerks.includes('perk_yarn_magnet')) {
            yarn = Math.floor(yarn * 1.5);
        }

        return yarn;
    }

    getRequiredCatnipForNextYarn() {
        const currentPending = this.calculatePendingYarn();
        const nextYarnTarget = currentPending + 1;
        return Math.pow(nextYarnTarget, 3) * 64000000;
    }

    ascend() {
        const gainedYarn = this.calculatePendingYarn();
        if (gainedYarn > 0) {
            this.state.goldenYarn += gainedYarn;
            this.state.totalGoldenYarn += gainedYarn;
            this.state.ascensions++;

            // Reset standard progress
            this.state.catnip = 0;
            this.state.lifetimeCatnip = 0;
            this.state.generators = {};
            this.state.upgrades = [];

            this.saveState();
            this.ui.init(); // Refresh UI completely
        }
    }

    calculatePendingCelestialNip() {
        // Gain 1 Celestial Nip per 100 Total Golden Yarn
        if (this.state.totalGoldenYarn < 100) return 0;
        return Math.floor(this.state.totalGoldenYarn / 100);
    }

    transcend() {
        const gainedCelestial = this.calculatePendingCelestialNip();
        if (gainedCelestial > 0) {
            this.state.celestialNip += gainedCelestial;
            this.state.totalGoldenYarn = 0; // Reset tracking for next tier

            // Full Reset
            this.state.catnip = 0;
            this.state.lifetimeCatnip = 0;
            this.state.goldenYarn = 0;
            this.state.ascensions = 0;
            this.state.generators = {};
            this.state.upgrades = [];
            this.state.goldenUpgrades = [];

            this.saveState();
            this.ui.init();
        }
    }

    buyCelestialPerk(perkId) {
        const def = CELESTIAL_PERKS_DATA.find(p => p.id === perkId);
        if (def && this.state.celestialNip >= def.cost && !this.state.celestialPerks.includes(perkId)) {
            this.state.celestialNip -= def.cost;
            this.state.celestialPerks.push(perkId);
            this.saveState();
            this.ui.update(this.state);
        }
    }

    buyGoldenUpgrade(upgId) {
        const def = this.goldenDefs.find(u => u.id === upgId);

        if (def && this.state.goldenYarn >= def.cost && !this.state.goldenUpgrades.includes(upgId)) {
            this.state.goldenYarn -= def.cost;
            this.state.goldenUpgrades.push(upgId);
        }
    }

    exportSave() {
        this.saveState();
        const json = JSON.stringify(this.state);
        return btoa(json);
    }

    importSave(str) {
        try {
            const json = atob(str.trim());
            const parsed = JSON.parse(json);
            this.state = { ...this.defaults, ...parsed };
            this.saveState();
            this.ui.init();
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

// Start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameManager(); // expose to window for debugging
});


