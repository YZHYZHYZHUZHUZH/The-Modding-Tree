addLayer("m", {
    name: "mod.js", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "md", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "mod.js", // Name of prestige currency
    baseResource: "inspiration", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
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
        return mult
    },
    autoUpgrade() {
        return false
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
            title: "canGenPoints()",
            description: "function canGenPoints() {return true}. You can now get inspiration.",
            cost: new Decimal(0),
        },
        12: {
            title: "modInfo",
            description: "let modInfo = { ... }. You get more inspiration",
            cost: new Decimal(1),
            
        }
    },
    milestones: {
        110: {
            requirementDescription: "50 skill",
            effectDescription: "You learn by yourself. Gain 10% of skill on reset per second.",
            done() { return player.p.points.gte(50) },
        },
        
    }
    
    
})