class UI {
    constructor(game) {
        this.game = game;
        this.catnipDisplay = document.getElementById('catnip-amount');
        this.cpsDisplay = document.getElementById('catnip-per-second');
        this.generatorsList = document.getElementById('generators-list');
        this.upgradesList = document.getElementById('upgrades-list');
        this.manualBtn = document.getElementById('manual-click-btn');
        
        // Prestige UI
        this.ascendBtn = document.getElementById('ascend-btn');
        this.transcendBtn = document.getElementById('transcend-btn');
        this.celestialNipContainer = document.getElementById('celestial-nip-container');
        this.celestialNipAmount = document.getElementById('celestial-nip-amount');
        this.celestialTabBtn = document.getElementById('celestial-tab-btn');
        
        this.goldenYarnContainer = document.getElementById('golden-yarn-container');
        this.goldenYarnAmount = document.getElementById('golden-yarn-amount');
        this.yarnProgressContainer = document.getElementById('yarn-progress-container');
        this.yarnProgressAmount = document.getElementById('yarn-progress-amount');
        this.goldenUpgradesContainer = document.getElementById('golden-upgrades-container');
        this.goldenUpgradesList = document.getElementById('golden-upgrades-list');
        this.toggleGoldenBtn = document.getElementById('toggle-golden-btn');
        this.goldenCollapseIcon = document.getElementById('golden-collapse-icon');
        
        this.toggleOwnedBtn = document.getElementById('toggle-owned-btn');
        this.ownedCollapseIcon = document.getElementById('owned-collapse-icon');
        
        this.goldenCollapsed = false;
        this.ownedCollapsed = false;
        
        // Modals
        this.modal = document.getElementById('ascension-modal');
        this.pendingYarnDisplay = document.getElementById('pending-yarn');
        this.confirmAscend = document.getElementById('confirm-ascend-btn');
        this.cancelAscend = document.getElementById('cancel-ascend-btn');

        this.transcendModal = document.getElementById('transcendence-modal');
        this.pendingCelestialDisplay = document.getElementById('pending-celestial');
        this.confirmTranscend = document.getElementById('confirm-transcend-btn');
        this.cancelTranscend = document.getElementById('cancel-transcend-btn');
        
        this.generatorButtons = {};
        this.upgradeButtons = {};
        this.goldenButtons = {};
        this.perkButtons = {};

        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');

        // Celestial
        this.celestialPerksList = document.getElementById('celestial-perks-list');

        // Save/Load modal
        this.saveModal = document.getElementById('save-modal');
        this.saveStringBox = document.getElementById('save-string-box');
        this.saveStatusMsg = document.getElementById('save-status-msg');

        // Owned upgrades display
        this.ownedUpgradesList = document.getElementById('owned-upgrades-container'); // Wait, check ID
        this.ownedUpgradesList = document.getElementById('owned-upgrades-list');
        
        this.init();
    }
    
    init() {
        // Clear all lists in case of an ascension reset
        this.generatorsList.innerHTML = '';
        this.upgradesList.innerHTML = '';
        this.goldenUpgradesList.innerHTML = '';
        this.celestialPerksList.innerHTML = '';
        this.generatorButtons = {};
        this.upgradeButtons = {};
        this.goldenButtons = {};
        this.perkButtons = {};
        
        this.multButtons = document.querySelectorAll('.mult-btn');
        
        if (!document.querySelector('.particle')) {
            this.createBackgroundParticles();
        }
        
        this.setupGenerators();
        this.setupUpgrades();
        this.setupGoldenUpgrades();
        this.setupCelestialPerks();
        this.setupTabs();
        
        // Setup Auto-Petter timer if perk owned
        if (this.game.state.celestialPerks.includes('perk_auto_pet')) {
            this.startAutoPetter();
        }
        
        // Re-bind click event only if not already bound (prevent duplicates)
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
    }
    
    bindEvents() {
        this.manualBtn.addEventListener('click', (e) => {
            this.game.manualClick();
            this.createFloatingText(e.clientX, e.clientY, `+${this.formatNumber(this.game.getClickPower())}`);
        });

        this.ascendBtn.addEventListener('click', () => {
            if (this.game.calculatePendingYarn() > 0) {
                this.pendingYarnDisplay.textContent = this.formatNumber(this.game.calculatePendingYarn());
                this.modal.style.display = 'flex';
            }
        });

        this.confirmAscend.addEventListener('click', () => {
            this.game.ascend();
            this.modal.style.display = 'none';
        });

        this.cancelAscend.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        // Transcendence events
        if (this.transcendBtn) {
            this.transcendBtn.addEventListener('click', () => {
                const gained = this.game.calculatePendingCelestialNip();
                if (gained > 0) {
                    this.pendingCelestialDisplay.textContent = this.formatNumber(gained);
                    this.transcendModal.style.display = 'flex';
                }
            });
        }

        if (this.confirmTranscend) {
            this.confirmTranscend.addEventListener('click', () => {
                this.game.transcend();
                this.transcendModal.style.display = 'none';
            });
        }

        if (this.cancelTranscend) {
            this.cancelTranscend.addEventListener('click', () => {
                this.transcendModal.style.display = 'none';
            });
        }

        if (this.toggleGoldenBtn) {
            this.toggleGoldenBtn.addEventListener('click', () => {
                this.goldenCollapsed = !this.goldenCollapsed;
                this.goldenUpgradesList.classList.toggle('hidden', this.goldenCollapsed);
                this.goldenCollapseIcon.classList.toggle('collapsed', this.goldenCollapsed);
            });
        }

        if (this.toggleOwnedBtn) {
            this.toggleOwnedBtn.addEventListener('click', () => {
                this.ownedCollapsed = !this.ownedCollapsed;
                this.ownedUpgradesList.classList.toggle('hidden', this.ownedCollapsed);
                this.ownedCollapseIcon.classList.toggle('collapsed', this.ownedCollapsed);
            });
        }

        // Safety net: hide tooltip if mouse leaves the window
        document.addEventListener('mouseleave', () => this.hideTooltip());
        document.addEventListener('click', () => this.hideTooltip());

        // Multiplier buttons
        this.multButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                let val = btn.dataset.mult;
                if (val !== 'max') val = parseInt(val);
                this.game.state.buyAmount = val;
                
                // Update active state
                this.multButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.update(this.game.state);
            });
        });

        // Save / Load modal
        document.getElementById('save-export-btn').addEventListener('click', () => {
            this.saveStringBox.value = this.game.exportSave();
            this.saveStatusMsg.textContent = '';
            this.saveModal.style.display = 'flex';
        });
        document.getElementById('copy-save-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(this.saveStringBox.value).then(() => {
                this.saveStatusMsg.style.color = '#6fcf97';
                this.saveStatusMsg.textContent = '✅ Copied to clipboard!';
            }).catch(() => {
                this.saveStringBox.select();
                this.saveStatusMsg.style.color = '#ffea00';
                this.saveStatusMsg.textContent = 'Select all and copy manually (Ctrl+A, Ctrl+C).';
            });
        });
        document.getElementById('import-save-btn').addEventListener('click', () => {
            const str = this.saveStringBox.value.trim();
            if (!str) {
                this.saveStatusMsg.style.color = '#ff6b6b';
                this.saveStatusMsg.textContent = 'Paste a save string first.';
                return;
            }
            const ok = this.game.importSave(str);
            if (ok) {
                this.saveStatusMsg.style.color = '#6fcf97';
                this.saveStatusMsg.textContent = '✅ Save imported successfully!';
                setTimeout(() => { this.saveModal.style.display = 'none'; }, 1200);
            } else {
                this.saveStatusMsg.style.color = '#ff6b6b';
                this.saveStatusMsg.textContent = '❌ Invalid save string.';
            }
        });
        document.getElementById('close-save-btn').addEventListener('click', () => {
            this.saveModal.style.display = 'none';
        });
    }

    showOfflineModal({ gained, seconds, wasCapped }) {
        const modal = document.getElementById('offline-modal');
        const timeEl = document.getElementById('offline-time-msg');
        const amountEl = document.getElementById('offline-earned-amount');
        const capMsg = document.getElementById('offline-cap-msg');

        // Format elapsed time
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const parts = [];
        if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
        if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
        timeEl.textContent = `You were away for ${parts.join(' and ')}.`;

        amountEl.textContent = this.formatNumber(gained);
        capMsg.style.display = wasCapped ? 'block' : 'none';

        modal.style.display = 'flex';

        document.getElementById('offline-ok-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // ... Background particles ...
    createBackgroundParticles() {
        const container = document.getElementById('bg-particles');
        if (!container) return;
        
        const count = 30; // Number of particles
        for(let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            
            // Random properties
            const size = Math.random() * 40 + 10;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;
            
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${left}%`;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `-${delay}s`;
            
            container.appendChild(p);
        }
    }
    
    setupGenerators() {
        const defs = this.game.getGeneratorDefs();
        
        defs.forEach(def => {
            const el = document.createElement('div');
            el.className = 'generator-item';
            el.innerHTML = `
                <div class="generator-icon">${def.icon}</div>
                <div class="generator-info">
                    <h3>${def.name}</h3>
                    <div class="generator-stats">
                        <span class="prod-val" id="gen-prod-${def.id}">0</span> CpS each
                    </div>
                </div>
                <button class="buy-btn" id="buy-gen-${def.id}">
                    <span class="buy-label" id="gen-label-${def.id}">Buy x1</span>
                    <span class="cost" id="gen-cost-${def.id}">0</span>
                    <span class="owned">Owned: <span id="gen-owned-${def.id}">0</span></span>
                </button>
            `;
            this.generatorsList.appendChild(el);
            
            const btn = document.getElementById(`buy-gen-${def.id}`);
            btn.addEventListener('click', () => {
                this.game.buyGenerator(def.id);
            });
            this.generatorButtons[def.id] = btn;
        });
    }
    
    setupUpgrades() {
        // Sort by cost ascending so cheapest upgrades appear first
        const defs = [...this.game.getUpgradeDefs()].sort((a, b) => a.cost - b.cost);
        
        defs.forEach(def => {
            const el = document.createElement('div');
            el.className = 'upgrade-item';
            el.id = `upgrade-item-${def.id}`;
            el.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-icon">${def.icon}</div>
                    <div class="upgrade-title">${def.name}</div>
                </div>
                <div class="upgrade-desc">${def.description}</div>
                <button class="upgrade-buy-btn" id="buy-upg-${def.id}">
                    Cost: ${this.formatNumber(def.cost)}
                </button>
            `;
            this.upgradesList.appendChild(el);
            
            const btn = document.getElementById(`buy-upg-${def.id}`);
            btn.addEventListener('click', () => {
                this.game.buyUpgrade(def.id);
            });
            this.upgradeButtons[def.id] = btn;
        });
    }

    setupTabs() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                
                // Update buttons
                this.tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update panes
                this.tabPanes.forEach(pane => {
                    if (pane.id === `${target}-tab`) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
            });
        });
    }

    startAutoPetter() {
        if (this._autoPetTimer) clearInterval(this._autoPetTimer);
        this._autoPetTimer = setInterval(() => {
            this.game.manualClick();
            // Optional: visual feedback at a random spot near center or last click
            // For now, silent click is better for performance
        }, 1000);
    }

    setupCelestialPerks() {
        const defs = CELESTIAL_PERKS_DATA;
        
        defs.forEach(def => {
            const el = document.createElement('div');
            el.className = 'upgrade-item';
            el.id = `celestial-perk-item-${def.id}`;
            el.style.borderColor = '#b197fc';
            el.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-icon" style="background: rgba(177, 151, 252, 0.2);">${def.icon}</div>
                    <div class="upgrade-title" style="color: #b197fc;">${def.name}</div>
                </div>
                <div class="upgrade-desc">${def.description}</div>
                <button class="upgrade-buy-btn" id="buy-perk-${def.id}" style="background: linear-gradient(135deg, #5a189a, #b197fc); color: white;">
                    Cost: ${this.formatNumber(def.cost)} Nip
                </button>
            `;
            this.celestialPerksList.appendChild(el);
            
            const btn = document.getElementById(`buy-perk-${def.id}`);
            btn.addEventListener('click', () => {
                this.game.buyCelestialPerk(def.id);
                if (def.id === 'perk_auto_pet') this.startAutoPetter();
            });
            this.perkButtons[def.id] = btn;
        });
    }

    setupGoldenUpgrades() {
        const defs = this.game.getGoldenDefs();
        
        defs.forEach(def => {
            const el = document.createElement('div');
            el.className = 'upgrade-item';
            el.id = `golden-item-${def.id}`;
            el.style.borderColor = '#ff9100';
            el.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-icon" style="background: rgba(255, 145, 0, 0.2);">${def.icon}</div>
                    <div class="upgrade-title" style="color: #ffea00;">${def.name}</div>
                </div>
                <div class="upgrade-desc">${def.description}</div>
                <button class="upgrade-buy-btn" id="buy-gold-${def.id}" style="background: linear-gradient(135deg, #ff9100, #ffea00); color: black;">
                    Cost: ${this.formatNumber(def.cost)} Yarn
                </button>
            `;
            this.goldenUpgradesList.appendChild(el);
            
            const btn = document.getElementById(`buy-gold-${def.id}`);
            btn.addEventListener('click', () => {
                this.game.buyGoldenUpgrade(def.id);
            });
            this.goldenButtons[def.id] = btn;
        });
    }
    
    update(state) {
        // High-frequency number updates (Catnip and CPS)
        const catnipText = this.formatNumber(state.catnip);
        if (this.catnipDisplay.textContent !== catnipText) {
            this.catnipDisplay.textContent = catnipText;
        }
        
        const cpsText = this.formatNumber(this.game.calculateCpS());
        if (this.cpsDisplay.textContent !== cpsText) {
            this.cpsDisplay.textContent = cpsText;
        }
        
        // Cache heavy display checks to avoid frequent DOM toggles
        if (!this._lastYarnCheck || Date.now() - this._lastYarnCheck > 250) {
            this._lastYarnCheck = Date.now();
            this.updatePrestigeVisibility(state);
        }

        // Update generators
        const defs = this.game.getGeneratorDefs();
        defs.forEach(def => {
            const owned = state.generators[def.id] || 0;
            const buyAmount = state.buyAmount || 1;
            
            let displayAmount = buyAmount;
            if (buyAmount === 'max') {
                displayAmount = this.game.getMaxAffordable(def.id);
                if (displayAmount === 0) displayAmount = 1;
            }

            const cost = this.game.getBulkCost(def.id, displayAmount);
            const production = this.game.getGeneratorProduction(def.id);
            
            // Cached DOM updates
            const ownedEl = document.getElementById(`gen-owned-${def.id}`);
            if (ownedEl.textContent !== owned.toString()) ownedEl.textContent = owned;

            const costEl = document.getElementById(`gen-cost-${def.id}`);
            const costText = this.formatNumber(cost);
            if (costEl.textContent !== costText) costEl.textContent = costText;

            const prodEl = document.getElementById(`gen-prod-${def.id}`);
            const prodText = this.formatNumber(production);
            if (prodEl.textContent !== prodText) prodEl.textContent = prodText;
            
            const labelEl = document.getElementById(`gen-label-${def.id}`);
            const labelText = `Buy x${displayAmount}`;
            if (labelEl && labelEl.textContent !== labelText) labelEl.textContent = labelText;

            const btn = this.generatorButtons[def.id];
            const canAfford = state.catnip >= cost && displayAmount > 0;
            if (canAfford && btn.hasAttribute('disabled')) {
                btn.removeAttribute('disabled');
            } else if (!canAfford && !btn.hasAttribute('disabled')) {
                btn.setAttribute('disabled', 'true');
            }
        });
        
        // Update regular upgrades
        const upgDefs = this.game.getUpgradeDefs();
        upgDefs.forEach(def => {
            const item = document.getElementById(`upgrade-item-${def.id}`);
            if (state.upgrades.includes(def.id)) {
                if (item.style.display !== 'none') item.style.display = 'none';
            } else {
                const canAfford = state.catnip >= def.cost;
                const btn = this.upgradeButtons[def.id];
                if (canAfford && btn.hasAttribute('disabled')) {
                    btn.removeAttribute('disabled');
                } else if (!canAfford && !btn.hasAttribute('disabled')) {
                    btn.setAttribute('disabled', 'true');
                }
            }
        });

        // Update golden upgrades
        const goldDefs = this.game.getGoldenDefs();
        goldDefs.forEach(def => {
            const item = document.getElementById(`golden-item-${def.id}`);
            if (!item) return;

            if (state.goldenUpgrades.includes(def.id)) {
                item.style.display = 'none';
            } else {
                if (state.goldenYarn >= def.cost) {
                    this.goldenButtons[def.id].removeAttribute('disabled');
                } else {
                    this.goldenButtons[def.id].setAttribute('disabled', 'true');
                }
            }
        });

        // Update celestial perks
        const celestialDefs = CELESTIAL_PERKS_DATA;
        celestialDefs.forEach(def => {
            const item = document.getElementById(`celestial-perk-item-${def.id}`);
            if (!item) return;

            if (state.celestialPerks.includes(def.id)) {
                item.style.display = 'none';
            } else {
                if (state.celestialNip >= def.cost) {
                    this.perkButtons[def.id].removeAttribute('disabled');
                } else {
                    this.perkButtons[def.id].setAttribute('disabled', 'true');
                }
            }
        });

        this.updateOwnedUpgrades(state);
    }
    
    updatePrestigeVisibility(state) {
        // Celestial Display Logic
        if (state.totalGoldenYarn >= 10 || state.celestialNip > 0) {
            this.celestialNipContainer.style.display = 'block';
            this.celestialNipAmount.textContent = this.formatNumber(state.celestialNip);
            this.celestialTabBtn.style.display = 'block';
            
            const pendingCelestial = this.game.calculatePendingCelestialNip();
            this.transcendBtn.style.display = (pendingCelestial > 0) ? 'flex' : 'none';
        } else {
            this.celestialNipContainer.style.display = 'none';
            this.transcendBtn.style.display = 'none';
            this.celestialTabBtn.style.display = 'none';
        }

        // Prestige Display Logic
        if (state.goldenYarn > 0 || state.lifetimeCatnip >= 64000000 || state.ascensions > 0) {
            this.goldenYarnContainer.style.display = 'block';
            this.goldenYarnAmount.textContent = this.formatNumber(state.goldenYarn);
            this.goldenUpgradesContainer.style.display = 'block';
            
            const pendingYarn = this.game.calculatePendingYarn();
            this.ascendBtn.style.display = (pendingYarn > 0) ? 'flex' : 'none';
        } else {
            this.goldenYarnContainer.style.display = 'none';
            this.ascendBtn.style.display = 'none';
            this.goldenUpgradesContainer.style.display = 'none';
        }

        // Yarn Progress tracker
        if (state.lifetimeCatnip >= 1000 || state.ascensions > 0) {
            if (this.yarnProgressContainer) {
                this.yarnProgressContainer.style.display = 'block';
                this.yarnProgressAmount.textContent = this.formatNumber(this.game.getRequiredCatnipForNextYarn());
            }
        } else {
            if (this.yarnProgressContainer) this.yarnProgressContainer.style.display = 'none';
        }
    }
    
    updateOwnedUpgrades(state) {
        if (!this.ownedUpgradesList) return;

        // Build a cache key from current owned lists — only re-render when something changes
        const key = state.upgrades.join(',') + '|' + state.goldenYarn + '|' + state.goldenUpgrades.join(',') + '|' + state.celestialPerks.join(',');
        if (this._ownedKey === key) return;
        this._ownedKey = key;

        this.ownedUpgradesList.innerHTML = '';
        this.hideTooltip(); // hide any stuck tooltip after re-render

        const allOwned = [];

        // Collect owned standard upgrades
        state.upgrades.forEach(id => {
            const def = this.game.getUpgradeDefs().find(u => u.id === id);
            if (def) allOwned.push({ def, golden: false, type: 'standard' });
        });

        // Collect owned golden upgrades
        state.goldenUpgrades.forEach(id => {
            const def = this.game.getGoldenDefs().find(u => u.id === id);
            if (def) allOwned.push({ def, golden: true, type: 'golden' });
        });

        // Collect owned celestial perks
        state.celestialPerks.forEach(id => {
            const def = CELESTIAL_PERKS_DATA.find(p => p.id === id);
            if (def) allOwned.push({ def, golden: false, type: 'celestial' });
        });

        if (allOwned.length === 0) {
            this.ownedUpgradesContainer.style.display = 'none';
            return;
        }

        this.ownedUpgradesContainer.style.display = 'block';

        allOwned.forEach(({ def, type }) => {
            const badge = document.createElement('div');
            let badgeClass = 'owned-badge';
            if (type === 'golden') badgeClass += ' owned-badge-golden';
            if (type === 'celestial') badgeClass += ' owned-badge-celestial';
            badge.className = badgeClass;
            badge.innerHTML = `<span class="owned-badge-icon">${def.icon}</span>`;

            badge.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.clientX, e.clientY, def.name, def.description, type !== 'standard');
            });
            badge.addEventListener('mousemove', (e) => {
                this.moveTooltip(e.clientX, e.clientY);
            });
            badge.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            this.ownedUpgradesList.appendChild(badge);
        });
    }

    showTooltip(x, y, name, desc, golden) {
        if (!this._tooltip) {
            this._tooltip = document.createElement('div');
            this._tooltip.id = 'upgrade-tooltip';
            document.body.appendChild(this._tooltip);
        }
        this._tooltip.innerHTML = `<strong>${name}</strong><span>${desc}</span>`;
        this._tooltip.className = golden ? 'golden' : '';
        this._tooltip.style.display = 'block';
        this.moveTooltip(x, y);
    }

    moveTooltip(x, y) {
        if (!this._tooltip) return;
        const offset = 14;
        let left = x + offset;
        let top = y - this._tooltip.offsetHeight - offset;
        // Keep within viewport
        if (left + this._tooltip.offsetWidth > window.innerWidth - 8) {
            left = x - this._tooltip.offsetWidth - offset;
        }
        if (top < 8) top = y + offset;
        this._tooltip.style.left = left + 'px';
        this._tooltip.style.top = top + 'px';
    }

    hideTooltip() {
        if (this._tooltip) this._tooltip.style.display = 'none';
    }

    createFloatingText(x, y, text) {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        // Random angle and distance for a "burst" effect
        const angle = -Math.PI / 2 + (Math.random() - 0.5); // mostly upwards
        const distance = 80 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        el.style.setProperty('--tx', `${tx}px`);
        el.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(el);
        
        setTimeout(() => {
            el.remove();
        }, 1000);
    }
    
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        
        const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
        const suffixNum = Math.floor(Math.log10(Math.max(1, num)) / 3);
        
        if (suffixNum >= suffixes.length) {
            return num.toExponential(2);
        }
        
        let shortValue = num / Math.pow(1000, suffixNum);
        
        // Format to 1 decimal place max (e.g. 100.5K, not 100.55K)
        shortValue = Math.floor(shortValue * 10) / 10;
        
        return shortValue.toString() + suffixes[suffixNum];
    }
}
