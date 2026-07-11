function getqBoost(points) {
    let mult = new Decimal(1)
    let scap = new Decimal(1000)
    if (points.lt(scap)) mult = mult.times(points.add(1).pow(0.3))
    else {
        let capped = scap.pow(0.3)
        let overflow = Decimal.max(0, points.minus(scap.add(-1)))
        mult = mult.times(capped.add(overflow.pow(0.1)))
    }
    return mult
}
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
        
        //Problem layer points effect
        mult = mult.times(getqBoost(player.q.points))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        var keepList = new Array()
        if(resettingLayer == "p") keepList.push("upgrades","points","total","milestones","best")
        layerDataReset("p", keepList)
    },
    passiveGeneration() {
        let mult = new Decimal(0)
        if (hasMilestone("p", 110)) mult = mult.add(0.1)
        if (hasUpgrade("q", 21)) mult = mult.add(upgradeEffect("q", 21))
        return mult
    },
    autoUpgrade() {
        return hasMilestone("q", 221)
    },
    tabFormat: {
        "Overview": { // 第一个标签：显示基本信息和重置按钮
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
            ],
        },
        "Upgrades": { // 第二个标签：显示升级模块
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
                "blank", // 空白行
                "upgrades", // 显示升级模块
            ],
        },
        "Milestones": { // 第三个标签：显示里程碑
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
                "blank", // 空白行
                "milestones", // 显示里程碑模块
            ],
        },
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
            tooltip: "Formula: (x+1)^0.5",
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Good class",
            description: "The class was effective. Time boost skill.",
            cost: new Decimal(5),
            tooltip: "Formula: (x+1)*0.05",
            effect() {
                return player.points.add(1).times(0.05)
            },
            effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) },
        },
        15: {
            title: "Online judge",
            description: "You signed up for an OJ. Time boost skill more.",
            cost: new Decimal(20),
            tooltip: "Formula: (x+1)^0.15",
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        16: {
            title: "Discussion section",
            description: "A good place to spend your time. Time boost itself.",
            cost: new Decimal(100),
            tooltip: "Formula: (x+1)^0.1",
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
    milestones: {
        110: {
            requirementDescription: "50 skill",
            effectDescription: "You learn by yourself. Gain 10% of skill on reset per second.",
            done() { return player.p.points.gte(50) },
        },
        
    }
    
    
})
// 如果 Math.tanh 不存在时的替代写法
function sigmoidVariantPolyfill(x, k = 1) {
    const arg = (k * x) / 2;
    // 利用 tanh(z) = (e^z - e^-z) / (e^z + e^-z) 计算
    // 也可以写成 1 - 2 / (e^(2z) + 1)
    if (arg > 20) return 0.3; // 防止 e^(2z) 溢出 Infinity
    const e2z = Math.exp(2 * arg);
    return 0.3 * ((e2z - 1) / (e2z + 1));
}

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
    exponent() { // Prestige currency exponent
        let exp = new Decimal(0.1)
        if(hasUpgrade("q", 22)) exp = new Decimal(0.3)
        if(hasUpgrade("q", 23)) exp = new Decimal(0.5)
        return exp
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)   
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasAchievement("A", 11)},
    tabFormat: {
        "Overview": { // 第一个标签：显示基本信息和重置按钮
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
                "blank",
                ["display-text", function() { 
                    return `Problem boosts skill gain.<br><br>
                            Use this formula: (x+1)^0.3<br><br>
                            Has softcap at 1000 problem, after that it will be 1000^0.3+(x-999)^0.1<br><br>
                            Current boost: ${format(getqBoost(player.q.points))}x`;
                }],
            ],
        },
        "Upgrades": { // 第二个标签：显示升级模块
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
                "blank", // 空白行
                "upgrades", // 显示升级模块
            ],
        },
        "Milestones": { // 第三个标签：显示里程碑
            content: [
                "main-display", // 显示主资源数量和相关说明
                "resource-display", // 显示基础资源信息
                "blank", // 空白行
                ["prestige-button", {}], // 显示重置按钮
                "blank", // 空白行
                "milestones", // 显示里程碑模块
            ],
        },
    },
    upgrades: {
        21: {
            title: "Memorization",
            description: "You learn from the problems. Best problem passively generates skill.",
            cost: new Decimal(1),
            tooltip: "Formula: 0.3*tanh(best/2).(capped at 0.3 in case you cant do math)",
            effect() {
                return sigmoidVariantPolyfill(player[this.layer].best)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id) * 100)+"%" },
        },
        22: {
            title: "More...",
            description: "Problem exponent increases to .3",
            cost: new Decimal(5),
        },
        23: {
            title: "More!",
            description: "Problem exponent increases to .5",
            cost: new Decimal(20),
        },
    },
    milestones: {
        220: {
            requirementDescription: "1 problem",
            effectDescription: "Your first problem solved. You gain 1.5x time.",
            done() { return player.q.points.gte(1) }
        },
        221: {
            requirementDescription: "2 problem",
            effectDescription: "You know what to do. Auto buy skill upgrades.",
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
    color: "#ebb800",
    type: "none", // 只显示成就
    row: "side", // 属于侧边栏
    layerShown() { return true; },
    tabFormat: [
        "blank",
        ["display-text", function() { 
            return `Complete achievements to unlock bonuses!<br><br>
                    Achievements won't be shown unless you finish them. (def not a bug)<br><br>
                    Achievements Completed: ${player.A.achievements.length}`;
        }],
        "blank",
        "achievements", // 加载成就网格
    ],
    achievements: {
        11: {
            name: "Skillful",
            tooltip: "Get 1000 skill. Unlock Problem layer.",
            done() { return player.p.points.gte(1000); }, // 成就完成条件
            unlocked() { return true; },                  // 始终显示
        },
    },
});