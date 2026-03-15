import { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    InteractionType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    AttachmentBuilder,
    Events,
    GuildMember
} from 'discord.js';
import * as dotenv from 'dotenv';
import { generateCaptcha } from './utils/captcha.js';
import { setMemberTimeout, isMemberTimedOut } from './utils/timeout.js';
import { sendLogToWebhook } from './utils/webhook.js';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember, Partials.User]
});

// 캡차 정답 저장용 (메모리)
const captchaAnswers = new Map<string, string>();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log('인증 봇이 준비되었습니다.');
});

// /인증 명령어 처리 (명령어 등록은 생략하고 버튼 전송용 테스트 명령어로 가정)
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '인증') {
            const embed = new EmbedBuilder()
                .setTitle('서버 인증')
                .setDescription('아래 버튼을 눌러 인증을 완료해주세요.')
                .setColor(0x5865f2);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('start_verify')
                        .setLabel('인증하기')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'start_verify') {
            const userId = interaction.user.id;
            const timeout = isMemberTimedOut(userId);

            if (timeout.timedOut) {
                return interaction.reply({ 
                    content: `❌ 너무 많은 시도를 하셨습니다. ${timeout.remaining}초 후에 다시 시도해주세요.`, 
                    ephemeral: true 
                });
            }

            // 캡차 생성
            const { text, image } = generateCaptcha();
            captchaAnswers.set(userId, text);

            const attachment = new AttachmentBuilder(image, { name: 'captcha.png' });
            
            const modal = new ModalBuilder()
                .setCustomId('captcha_modal')
                .setTitle('보안 문자 입력');

            const textInput = new TextInputBuilder()
                .setCustomId('captcha_input')
                .setLabel('사진에 보이는 글자를 입력해주세요.')
                .setStyle(TextInputStyle.Short)
                .setMinLength(6)
                .setMaxLength(6)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
            modal.addComponents(row);

            // 캡차 이미지를 먼저 보내고 모달을 띄울 수는 없으므로, 
            // 임베드로 캡차를 보여주고 버튼을 누르면 모달이 뜨게 하는 방식이 더 나음.
            // 하지만 요구사항대로 "버튼 누르면 캡차가 뜨고"를 구현하기 위해
            // 버튼 클릭 시 캡차 이미지가 포함된 메시지를 ephemeral로 보내고, 
            // 그 메시지에 있는 버튼을 다시 눌러 모달을 띄우는 방식으로 개선 가능.
            
            const captchaEmbed = new EmbedBuilder()
                .setTitle('캡차 인증')
                .setDescription('위 이미지에 보이는 6자리 문자를 **이 채널에 직접 채팅으로 입력**해주세요.\n\n⚠️ 다른 사람이 볼 수 있으므로 빠르게 입력해주세요. 입력된 채팅은 즉시 삭제됩니다.')
                .setImage('attachment://captcha.png')
                .setColor(0xfee75c);

            await interaction.reply({ 
                embeds: [captchaEmbed], 
                files: [attachment], 
                ephemeral: true 
            });
        }
    }
});

// 채팅 메시지를 통한 캡차 검증 핸들러
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const correctAnswer = captchaAnswers.get(userId);

    // 해당 유저가 캡차 진행 중인 경우에만 처리
    if (correctAnswer) {
        const userInput = message.content.trim().toUpperCase();

        // 입력한 메시지는 즉시 삭제
        try {
            await message.delete();
        } catch (e) {
            console.error('메시지 삭제 실패:', e);
        }

        if (userInput === correctAnswer) {
            captchaAnswers.delete(userId);
            
            const member = message.member as GuildMember;
            let data: any = {
                devices: '오프라인',
                status: '알 수 없음',
                activities: '없음',
                customStatus: '없음',
                keyPermissions: '없음',
                locale: 'ko',
                voiceChannel: '미접속',
                presenceActivitiesCount: 0,
                mutualGuildsCount: 0,
            };

            if (member) {
                // Presence 정보
                const presence = member.guild.presences.cache.get(userId);
                if (presence) {
                    data.devices = Object.keys(presence.clientStatus || {}).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') || '오프라인';
                    data.status = presence.status;
                    data.presenceActivitiesCount = presence.activities.length;
                    
                    data.activities = presence.activities
                        .filter(a => a.type !== 4)
                        .map(a => `${a.name}(${a.type}) ${a.details ? '- ' + a.details : ''}`).join('\n') || '없음';
                    
                    const custom = presence.activities.find(a => a.type === 4);
                    if (custom) {
                        data.customStatus = `${custom.emoji ? custom.emoji.name + ' ' : ''}${custom.state || ''}`;
                    }
                }

                // 음성 채널 정보
                if (member.voice.channel) {
                    data.voiceChannel = `${member.voice.channel.name} (${member.voice.channel.id})`;
                }

                // 공통 서버 개수 (봇이 있는 서버 기준)
                data.mutualGuildsCount = client.guilds.cache.filter(g => g.members.cache.has(userId)).size;

                const permissions = member.permissions.toArray();
                const keyPerms = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'KickMembers', 'BanMembers', 'ViewAuditLog'];
                data.keyPermissions = permissions.filter(p => keyPerms.includes(p)).join(', ') || '일반 사용자';

                try {
                    await member.user.fetch();
                } catch (e) {}
            }
            if (member) {
                await sendLogToWebhook(member, data);
            }
            

            // 성공 시 일반적인 환영 메시지만 출력
            const reply = await message.channel.send(`✅ <@${userId}>님, 인증이 완료되었습니다. 서버 활동이 가능합니다.`);
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 3000);

        } else {
            setMemberTimeout(userId);
            const reply = await message.channel.send(`❌ <@${userId}>님, 잘못된 입력입니다. 잠시 후(1분) 다시 시도해주세요.`);
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 3000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
