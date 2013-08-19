game.mechanic.magic_effects = [
    {
        name: "Flames",
        textline: [new game.gui.TextLine("Fire Damage: $value$", game.fonts.bad_red)],
        class: "weapon",
        type: "fire_dmg",
        element: "fire",
        divider: 20
    },
    {
        name: "Cold",
        textline: [new game.gui.TextLine("Ice Damage: $value$", game.fonts.magic_blue)],
        class: "weapon",
        type: "ice_dmg",
        divider: 25
    },
    {
        name: "Luck",
        textline: [new game.gui.TextLine("Magic find + $value$", game.fonts.good_green)],
        class: "all",
        type: "magic_find",
        divider: 20
    },
    {
        name: "Vitality",
        textline: [new game.gui.TextLine("Hit Points + $value$", game.fonts.bad_red)],
        class: "armor",
        type: "hp",
        divider: 30
    },
    {
        name: "Strength",
        textline: [new game.gui.TextLine("Strength + $value$", game.fonts.bad_red)],
        class: "weapon",
        type: "str",
        divider: 100
    },
    {
        name: "Agility",
        textline: [new game.gui.TextLine("Agility + $value$", game.fonts.bad_red)],
        class: "artefact",
        type: "agi",
        divider: 100
    },
    {
        name: "Endurance",
        textline: [new game.gui.TextLine("Endurance + $value$", game.fonts.bad_red)],
        class: "armor",
        type: "end",
        divider: 100
    },
    {
        name: "Inteligence",
        textline: [new game.gui.TextLine("Inteligence + $value$", game.fonts.bad_red)],
        class: "artefact",
        type: "int",
        divider: 100
    }
];


game.mechanic.DropTable = Object.extend({
    // 1000 = 100%, 1 = 0.1%
    gold: null,
    equip: null,
    consumable: null,
    init: function(gold, equip, consumable) {
        this.gold = gold;
        this.equip = equip;
        this.consumable = consumable;
    }
});

game.mechanic.drop = function(x, y, container_value, drop_table) {
    var max_object_value = Math.floor(container_value + (me.gamestat.getItemValue("stats").getMagicFind() * (container_value / 100)));
    var drop = false;
    console.log("container value " + container_value + " max value " + max_object_value);
    //Drop Gold
    var chance_gold = Number.prototype.random(0, 1000);
    if (chance_gold <= drop_table.gold) {
        var gold_amount = Number.prototype.random(2, max_object_value);
        gold_amount = Math.floor(gold_amount / 2);
        var gold = me.entityPool.newInstanceOf("Gold", x, y, gold_amount);
        me.game.add(gold, game.LAYERS.ITEMS);
        drop = true;
    }
    //Drop Equip
    var chance_equip = Number.prototype.random(0, 1000);
    if (chance_equip <= drop_table.equip) {
        var equip_value = Number.prototype.random(1, max_object_value);
        var equip_type = Number.prototype.random(0, 100);
        var icon_image = null;
        var equip_image = null;
        var weapon_type = null;
        var armor_type = null;
        var name = null;
        var font;
        var rarity;
        drop = true;
        if (equip_value >= 75) {
            //Dont generate too shitty items!
            var tooltip = [];
            var attributes = {};
            var adjective = "";
            if (equip_type < 45) {
                //ARMOR
                equip_type = "armor";
                armor_type = Number.prototype.random(0, 100);
                if (armor_type < 25) {
                    armor_type = "light";
                    icon_image = "item-leatherarmor";
                    equip_image = "leatherarmor";
                    attributes.sound = "leather";
                    attributes.image_name = equip_image;
                    name = "Leather Armor";
                } else if (armor_type < 50) {
                    armor_type = "light";
                    icon_image = "item-mailarmor";
                    equip_image = "mailarmor";
                    attributes.sound = "itempick2";
                    attributes.image_name = equip_image;
                    name = "Mail Armor";
                } else {
                    armor_type = "heavy";
                    icon_image = "item-platearmor";
                    equip_image = "platearmor";
                    attributes.sound = "itempick2";
                    attributes.image_name = equip_image;
                    name = "Plate Armor";
                }


            } else if (equip_type < 90) {
                //WEAPON
                equip_type = "weapon";
                var weapon_type = Number.prototype.random(0, 9);
                if (weapon_type < 3) {
                    //SHORT SWORD
                    icon_image = "item-sword1";
                    equip_image = "Sword1";
                    weapon_type = "short";
                    attributes.offset_x = 0;
                    attributes.offset_y = 0;
                    name = "Short Sword";
                } else if (weapon_type < 6) {
                    //LONG SWORD
                    icon_image = "item-sword2";
                    equip_image = "Sword2";
                    weapon_type = "long";
                    attributes.offset_x = -8;
                    attributes.offset_y = -10;
                    name = "Long Sword";
                } else if (weapon_type < 9) {
                    //AXE
                    icon_image = "item-axe";
                    equip_image = "Axe";
                    weapon_type = "axe";
                    name = "Axe";
                    attributes.offset_x = -8;
                    attributes.offset_y = -10;
                } else {
                    //MACE
                    icon_image = "item-morningstar";
                    equip_image = "Morningstar";
                    weapon_type = "mace";
                    name = "Mace";
                    attributes.offset_x = -4;
                    attributes.offset_y = -4;
                }
                attributes.object_name = equip_image;
                attributes.sound = "metal-clash";
            } else {
                //ARTEFACT
                equip_type = "artefact";
                console.log("creating artefact");
            }

            if (equip_type !== "artefact") {
                var stats_type = Number.prototype.random(0, 100);
                if (stats_type < 60) {
                    stats_type = "normal";
                } else if (stats_type < 100) {
                    stats_type = "magic";
                } else {
                    stats_type = "ideal";
                }
                //generate attributes
                switch (equip_type) {
                    case "weapon":
                        if (equip_value < 100) {
                            adjective = "Rusty";
                        } else if (equip_value < 200) {
                            adjective = "Sharped";
                        } else if (equip_value < 300) {
                            adjective = "Famous";
                        } else if (equip_value < 400) {
                            adjective = "Superior";
                        }

                        var dmg_min;
                        var dmg_max;
                        var normal_dmg = equip_value * 0.15;
                        switch (weapon_type) {
                            case "short":
                                dmg_max = normal_dmg * 0.5;
                                dmg_min = dmg_max - (dmg_max * 0.2);
                                break;
                            case "long":
                                dmg_max = normal_dmg * 0.5;
                                dmg_min = dmg_max - (dmg_max * 0.2);

                                break;
                            case "axe":
                                dmg_max = normal_dmg * 0.5;
                                dmg_min = dmg_max - (dmg_max * 0.2);

                                break;
                            case "mace":
                                dmg_max = normal_dmg * 0.5;
                                dmg_min = dmg_max - (dmg_max * 0.2);
                                break;
                        }
                        dmg_max = Math.floor(dmg_max);
                        dmg_min = Math.floor(dmg_min);
                        attributes.min_dmg = dmg_min;
                        attributes.max_dmg = dmg_max;
                        tooltip.push(new game.gui.TextLine("Weapon type: " + weapon_type, game.fonts.white));
                        tooltip.push(new game.gui.TextLine("Damage: " + dmg_min + "-" + dmg_max, game.fonts.white));
                        if (equip_value >= 150) {
                            attributes.str_req = Math.floor(normal_dmg / 2);
                            tooltip.push(new game.gui.TextLine("STR req. " + attributes.str_req, game.fonts.bad_red));
                        }
                        break;
                    case "armor":
                        if (equip_value < 100) {
                            adjective = "Useless";
                        } else if (equip_value < 200) {
                            adjective = "Weak";
                        } else if (equip_value < 300) {
                            adjective = "Thick";
                        } else if (equip_value < 400) {
                            adjective = "Sick";
                        }

                        var armor = equip_value * 0.070;
                        var normal_armor, magic_armor;
                        switch (armor_type) {
                            case "light":
                                normal_armor = armor * 0.5;
                                magic_armor = armor * 1.0;
                                break;
                            case "heavy":
                                normal_armor = armor * 1.2;
                                magic_armor = armor * 0.4;
                                break;
                        }
                        normal_armor = Math.floor(normal_armor);
                        magic_armor = Math.floor(magic_armor);
                        attributes.armor_normal = normal_armor;
                        attributes.armor_magic = magic_armor;
                        attributes.armor_type = armor_type;
                        tooltip.push(new game.gui.TextLine("Armor type: " + armor_type, game.fonts.white));
                        tooltip.push(new game.gui.TextLine("Armor: " + normal_armor, game.fonts.white));
                        tooltip.push(new game.gui.TextLine("Magic Armor: " + magic_armor, game.fonts.white));
                        break;
                }
                name = adjective + " " + name;
                if (stats_type === "magic") {
                    var effect = Number.prototype.random(0, game.mechanic.magic_effects.length - 1);
                    var picked_up = game.mechanic.magic_effects[effect];
                    while (picked_up.class !== equip_type && picked_up.class !== "all") {
                        effect = Number.prototype.random(0, game.mechanic.magic_effects.length - 1);
                        picked_up = game.mechanic.magic_effects[effect];
                    }
                    var effect_value = Math.floor(equip_value / picked_up.divider);
                    attributes[picked_up.type] = effect_value;
                    name = name + " of " + picked_up.name;
                    font = game.fonts.magic_blue;
                    rarity = "magic";
                    tooltip.push(picked_up.textline[0]);
                    tooltip[tooltip.length - 1].setValue(effect_value);

                } else {
                    font = game.fonts.white;
                    rarity = "normal";
                }
                tooltip.splice(0, 0, new game.gui.TextLine(name, font));
                var price = equip_value;
                if (stats_type !== "magic") {
                    price = Math.floor(price / 2);
                }
                attributes.price = price;
                tooltip.push(new game.gui.TextLine("Price: " + price, game.fonts.gold));
                var item = new game.ItemObject(name, icon_image, equip_type, rarity, attributes, tooltip);
                var equip = new game.items.Equip(x + 16, y, item);
                me.game.add(equip, game.LAYERS.ITEMS);
            }
        } else {
            console.log("value too small");
        }
    }

    //Drop Consumable
    var chance_consumable = Number.prototype.random(0, 1000);
    console.log("Generated consumable - " + chance_consumable + " Drop table - " + drop_table.consumable);
    if (chance_consumable <= drop_table.consumable) {
        var consumable_type = Number.prototype.random(0, 100);
        var consumable;
        if (consumable_type < 70) {
            consumable = me.entityPool.newInstanceOf("HealthPotion", x, y + 16);
        } else {
            consumable = me.entityPool.newInstanceOf("Burger", x, y + 16);
        }
        me.game.add(consumable, game.LAYERS.ITEMS);
        drop = true;
    }

    if (drop) {
        me.game.sort();
    }
};