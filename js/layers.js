addLayer("p", {
    name: "skill", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "sk", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "skill", // Name of prestige currency
    baseResource: "time", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('p', 12)) mult = mult.times(upgradeEffect('p', 12))
        if (hasUpgrade('p', 14)) mult = mult.add(upgradeEffect('p', 14)) 
        if (hasUpgrade('p', 15)) mult = mult.add(upgradeEffect('p', 15))     
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for skill", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
        if (hasMilestone("q", 11)) layerDataReset("p", ["upgrades"])
    },
    passiveGeneration() {
        let mult = new Decimal(0)
        if (hasMilestone("p", 0)) mult = mult.add(0.1)
        return mult
    },
    upgrades: {
        11: {
            title: "Bro, what is OI?",
            description: "You got interested. You can now get time.",
            cost: new Decimal(0),
        },
        12: {
            title: "Start Learning",
            description: "You use your time to get more skill.",
            cost: new Decimal(1),
            effect() {
                return 1.5
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "Taking class",
            description: "You feel like time slows. Skill now boost time.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Good class",
            description: "The class was effective. Time boost skill.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).times(0.1)
            },
            effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) },
        },
        15: {
            title: "Online judge",
            description: "You signed up for an OJ. Time boost skill more.",
            cost: new Decimal(20),
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
    milestones: {
        0: {
            requirementDescription: "100 skill",
            effectDescription: "You learn by yourself. Gain 10% of skill on reset per second.",
            done() { return player.p.points.gte(100) }
        },
        
    }
    
    
})

addLayer("q", {
    name: "problem", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "pr", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#117891",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "problem", // Name of prestige currency
    baseResource: "skill", // Name of resource prestige is based on
    baseAmount() {return player["p"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)   
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for problem", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasAchievement("A", 11)},
    upgrades: {
    },
    milestones: {
        10: {
            requirementDescription: "1 problem",
            effectDescription: "Your first problem solved. You gain 1.5x time.",
            done() { return player.q.points.gte(1) }
        },
        11: {
            requirementDescription: "2 problem",
            effectDescription: "Doing problems no longer resets the Skill layer.",
            done() { return player.q.points.gte(2) }
        },
        
    }
    
    
})

addLayer("A", {
    name: "achievement", // 成就系统层
    symbol: "ac", // 图标
    position: 0, // 侧边栏位置
    startData() { 
        return {
            unlocked: true, // 默认解锁
            points: new Decimal(0), // 初始化点数
            achievements: [] // 初始化空成就存储
        }
    },
    color: "#bb960e",
    type: "none", // 只显示成就
    row: "side", // 属于侧边栏
    layerShown() { return true; },
    achievements: {
        11: {
            name: "Skillful",
            tooltip: "Get 1000 skill. Unlock Problem layer.",
            done() { return player.p.points.gte(1000); }, // 成就完成条件
            unlocked() { return true; },                  // 始终显示
        },
    },
    tabFormat: [
        "blank",
        ["display-text", function() { 
            return `Complete achievements to unlock bonuses!<br><br>
                    Achievements won't be shown unless you finish them. (def not a bug)
                    Achievements Completed: ${player.A.achievements.length}`;
        }],
        "blank",
        "achievements", // 加载成就网格
    ],
});