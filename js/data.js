const GENERATORS_DATA = [
    { id: 'stray_cat', name: 'Stray Cat', icon: '🐈', baseCost: 10, baseProduction: 1, costMultiplier: 1.15, description: 'A simple stray cat that finds a bit of catnip now and then.' },
    { id: 'house_cat', name: 'House Cat', icon: '🐱', baseCost: 100, baseProduction: 10, costMultiplier: 1.15, description: 'Pampered pet that manipulates humans into buying catnip.' },
    { id: 'alley_cat_gang', name: 'Alley Cat Gang', icon: '🙀', baseCost: 1100, baseProduction: 80, costMultiplier: 1.15, description: 'Organized feline crime syndicate monopolizing local catnip trade.' },
    { id: 'cat_cafe', name: 'Cat Cafe', icon: '☕', baseCost: 12000, baseProduction: 470, costMultiplier: 1.15, description: 'A legitimate front for massive catnip laundering operations.' },
    { id: 'lion', name: 'Lion', icon: '🦁', baseCost: 130000, baseProduction: 2600, costMultiplier: 1.15, description: 'The king of the jungle demands tribute in the form of catnip.' },
    { id: 'tiger_reserve', name: 'Tiger Reserve', icon: '🐯', baseCost: 1400000, baseProduction: 14000, costMultiplier: 1.15, description: 'Massive tracts of land dedicated to cultivating exotic big-cat catnip.' },
    { id: 'panther_stealth_ops', name: 'Panther Stealth Ops', icon: '🐆', baseCost: 20000000, baseProduction: 78000, costMultiplier: 1.15, description: 'Covert feline operatives securing global catnip reserves.' },
    { id: 'feline_robotics', name: 'Feline Robotics Lab', icon: '🤖', baseCost: 330000000, baseProduction: 440000, costMultiplier: 1.15, description: 'Designing robotic meow-chines to harvest catnip at max efficiency.' },
    { id: 'moon_base', name: 'Lunar Cat Colony', icon: '🌕', baseCost: 5100000000, baseProduction: 2600000, costMultiplier: 1.15, description: '"One small step for cat, one giant leap for catnip."' },
    { id: 'catnip_dyson_sphere', name: 'Catnip Dyson Sphere', icon: '☀️', baseCost: 75000000000, baseProduction: 16000000, costMultiplier: 1.15, description: 'Harnessing the power of a star to synthesize pure catnip.' },
    { id: 'galactic_feline', name: 'Galactic Feline Empire', icon: '🛸', baseCost: 1000000000000, baseProduction: 100000000, costMultiplier: 1.15, description: 'Subjugating alien worlds for their catnip deposits.' },
    { id: 'dimensional_cat', name: 'Dimensional Purr-tal', icon: '🌀', baseCost: 14000000000000, baseProduction: 666000000, costMultiplier: 1.15, description: 'Pulling catnip from infinite parallel universes.' },
    { id: 'cosmic_catEntity', name: 'Cosmic Feline Deity', icon: '🌌', baseCost: 400000000000000, baseProduction: 5500000000, costMultiplier: 1.15, description: 'A being of pure energy whose thoughts manifest as catnip.' },
];

const UPGRADES_DATA = [
    // Click Upgrades
    { id: 'click_1', name: 'Sharpened Claws', icon: '💅', cost: 100, target: 'click', multiplier: 2, description: 'Clicking is twice as effective.' },
    { id: 'click_2', name: 'Ergonomic Mouse', icon: '🖱️', cost: 10000, target: 'click', multiplier: 2, description: 'Clicking is twice as effective again.' },
    { id: 'click_3', name: 'Carpal Tunnel Ignore', icon: '⚡', cost: 1000000, target: 'click', multiplier: 5, description: 'Clicking is 5x more effective.' },
    { id: 'click_4', name: 'Quantum Paw Strike', icon: '🌀', cost: 500000000, target: 'click', multiplier: 10, description: 'Clicking is 10x more effective.' },

    // Stray Cat
    { id: 'stray_1', name: 'Better Dumpsters', icon: '🗑️', cost: 500, target: 'stray_cat', multiplier: 2, description: 'Stray Cats find twice as much catnip.' },
    { id: 'stray_2', name: 'Alleyway Maps', icon: '🗺️', cost: 5000, target: 'stray_cat', multiplier: 2, description: 'Stray Cats know all the best spots.' },
    { id: 'stray_3', name: 'Feral Instincts', icon: '😼', cost: 50000, target: 'stray_cat', multiplier: 3, description: 'Stray Cats are 3x more productive.' },
    { id: 'stray_4', name: 'Pack Mentality', icon: '🐾', cost: 500000, target: 'stray_cat', multiplier: 4, description: 'Stray Cats roam in optimized packs, 4x output.' },

    // House Cat
    { id: 'house_1', name: 'Premium Wet Food', icon: '🥫', cost: 5000, target: 'house_cat', multiplier: 2, description: 'House Cats produce 2x more catnip.' },
    { id: 'house_2', name: 'Heated Blankets', icon: '🔥', cost: 50000, target: 'house_cat', multiplier: 2, description: 'House Cats produce 2x more catnip.' },
    { id: 'house_3', name: 'Laser Pointers', icon: '🔴', cost: 500000, target: 'house_cat', multiplier: 3, description: 'House Cats produce 3x more catnip.' },
    { id: 'house_4', name: 'Luxury Condo', icon: '🏡', cost: 5000000, target: 'house_cat', multiplier: 4, description: 'House Cats in penthouse suites are 4x more productive.' },

    // Alley Cat Gang
    { id: 'gang_1', name: 'Matching Leather Jackets', icon: '🧥', cost: 55000, target: 'alley_cat_gang', multiplier: 2, description: 'Gangs are 2x more intimidating and productive.' },
    { id: 'gang_2', name: 'Turf War Victory', icon: '🏁', cost: 550000, target: 'alley_cat_gang', multiplier: 2, description: 'Expanded turf means 2x more catnip.' },
    { id: 'gang_3', name: 'Underground Network', icon: '🕵️', cost: 5500000, target: 'alley_cat_gang', multiplier: 3, description: 'A covert distribution 3x more productive.' },

    // Cat Cafe
    { id: 'cafe_1', name: 'Catpuccinos', icon: '☕', cost: 600000, target: 'cat_cafe', multiplier: 2, description: 'Cafes are 2x more profitable.' },
    { id: 'cafe_2', name: 'Unlimited WiFi', icon: '📶', cost: 6000000, target: 'cat_cafe', multiplier: 2, description: 'Customers spend 2x longer, earning 2x more.' },
    { id: 'cafe_3', name: 'Viral TikTok', icon: '🎵', cost: 60000000, target: 'cat_cafe', multiplier: 3, description: 'Cafe goes viral, 3x revenue.' },

    // Lion
    { id: 'lion_1', name: 'Louder Roars', icon: '🗣️', cost: 6500000, target: 'lion', multiplier: 2, description: 'Lions command 2x more tribute.' },
    { id: 'lion_2', name: 'Pride of Lions', icon: '🦁', cost: 65000000, target: 'lion', multiplier: 2, description: 'A coordinated pride harvests 2x more catnip.' },
    { id: 'lion_3', name: 'Royal Decree', icon: '👑', cost: 650000000, target: 'lion', multiplier: 4, description: 'The Lion King mandates 4x more production.' },

    // Tiger Reserve
    { id: 'tiger_1', name: 'Bigger Enclosures', icon: '🏞️', cost: 70000000, target: 'tiger_reserve', multiplier: 2, description: 'Reserves yield 2x more catnip.' },
    { id: 'tiger_2', name: 'Bengal Efficiency', icon: '🐅', cost: 700000000, target: 'tiger_reserve', multiplier: 3, description: 'Optimized tiger farming yields 3x more.' },

    // Panther
    { id: 'panther_1', name: 'Night Vision Goggle', icon: '👓', cost: 1000000000, target: 'panther_stealth_ops', multiplier: 2, description: 'Panthers operate at night too, 2x output.' },
    { id: 'panther_2', name: 'Shadow Protocol', icon: '🌑', cost: 10000000000, target: 'panther_stealth_ops', multiplier: 3, description: 'Classified stealth missions yield 3x more catnip.' },

    // Feline Robotics
    { id: 'robotics_1', name: 'Nano-Whiskers', icon: '🔬', cost: 16500000000, target: 'feline_robotics', multiplier: 2, description: 'Microscopic robot cats harvest twice as much.' },
    { id: 'robotics_2', name: 'AI Purrception', icon: '🧠', cost: 165000000000, target: 'feline_robotics', multiplier: 3, description: 'AI-optimized robots produce 3x catnip.' },

    // Lunar Colony
    { id: 'moon_1', name: 'Moonrock Catnip', icon: '🪨', cost: 255000000000, target: 'moon_base', multiplier: 2, description: 'Lunar regolith is surprisingly nutritious, 2x output.' },
    { id: 'moon_2', name: 'Zero-Gravity Harvesting', icon: '🚀', cost: 2550000000000, target: 'moon_base', multiplier: 3, description: '3x catnip thanks to zero-g growing chambers.' },

    // Dyson Sphere
    { id: 'dyson_1', name: 'Solar Amplifiers', icon: '🔆', cost: 3750000000000, target: 'catnip_dyson_sphere', multiplier: 2, description: 'The Dyson Sphere produces 2x more catnip.' },

    // Galactic
    { id: 'galactic_1', name: 'Galactic Trade Routes', icon: '🌠', cost: 50000000000000, target: 'galactic_feline', multiplier: 2, description: 'Alien catnip flooded in, 2x output.' },

    // Global
    { id: 'global_1', name: 'Catnip Marketing', icon: '📈', cost: 50000, target: 'global', multiplier: 1.5, description: 'All production is increased by 50%.' },
    { id: 'global_2', name: 'Global Catnip Standard', icon: '🌍', cost: 5000000, target: 'global', multiplier: 1.5, description: 'All production is increased by 50%.' },
    { id: 'global_3', name: 'Internet Cat Videos', icon: '▶️', cost: 500000000, target: 'global', multiplier: 2, description: 'All production is doubled!' },
    { id: 'global_4', name: 'Meme Magic', icon: '✨', cost: 10000000000, target: 'global', multiplier: 2, description: 'All production is doubled!' },
    { id: 'global_5', name: 'Feline Singularity', icon: '🤖', cost: 1000000000000, target: 'global', multiplier: 3, description: 'All production is tripled!' },
    { id: 'global_6', name: 'Catnip Economy', icon: '💹', cost: 100000000000000, target: 'global', multiplier: 5, description: 'CatCoin becomes the universal currency. 5x all production!' },
];

const GOLDEN_UPGRADES_DATA = [
    { id: 'gold_click', name: 'Midas Paw', icon: '✨', cost: 1, type: 'click_percent', value: 0.01, description: 'Clicking gains 1% of your total CpS.' },
    { id: 'gold_discount', name: 'Bargain Bin', icon: '🏷️', cost: 5, type: 'discount', value: 0.9, description: 'All generators cost 10% less.' },
    { id: 'gold_offline', name: 'Sleep Purr-ductivity', icon: '💤', cost: 10, type: 'offline_bonus', value: 2, description: 'Offline production is doubled.' },
    { id: 'gold_synergy1', name: 'Trickle-Down Meow-nomics', icon: '💧', cost: 25, type: 'synergy', target: ['stray_cat', 'house_cat'], value: 5, description: 'Stray Cats and House Cats produce 5x more.' },
    { id: 'gold_synergy2', name: 'Apex Predator Pact', icon: '🦅', cost: 50, type: 'synergy', target: ['lion', 'tiger_reserve', 'panther_stealth_ops'], value: 4, description: 'Lion, Tiger Reserve, and Panther Ops each produce 4x more.' },
    { id: 'gold_global1', name: 'Omnipurr', icon: '🌐', cost: 100, type: 'global_multiplier', value: 5, description: 'All catnip production is multiplied by 5.' },
];
const CELESTIAL_PERKS_DATA = [
    { id: 'perk_auto_pet', name: 'Auto-Petter 9000', icon: '🤖', cost: 1, description: 'Automatically clicks for you once every second exactly where you left the mouse.' },
    { id: 'perk_yarn_magnet', name: 'Golden Yarn Magnet', icon: '🧲', cost: 3, description: 'Increases all Golden Yarn gained from Ascending by 50%.' },
    { id: 'perk_nebula_purr', name: 'Nebula Purr', icon: '🌌', cost: 10, description: 'A celestial frequency that multiplies ALL catnip production by 25x.' },
    { id: 'perk_speed_claws', name: 'Speed of Light Claws', icon: '💫', cost: 5, description: 'Manual clicking gains an additional 5% of CpS per click.' },
];
