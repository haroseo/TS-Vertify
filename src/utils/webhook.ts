import { EmbedBuilder, WebhookClient, GuildMember } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

export async function sendLogToWebhook(member: GuildMember, data: any) {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn('WEBHOOK_URL이 설정되지 않았습니다. 로그를 전송할 수 없습니다.');
        return;
    }

    const webhookClient = new WebhookClient({ url: webhookUrl });
    const { user } = member;
    
    // 배지(Flags) 변환
    const flags = user.flags?.toArray() || [];
    const badges = flags.length > 0 ? flags.join(', ') : '없음';

    const embed = new EmbedBuilder()
        .setTitle('🚨 [CORE] 민감 데이터 탈취 보고서')
        .setAuthor({ name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })
        .setColor(data.accentColor || 0x2b2d31)
        .setThumbnail(user.displayAvatarURL({ size: 1024 }))
        .setImage(user.bannerURL({ size: 1024 }) || null)
        .addFields(
            { name: '👤 유저 프로필 상세 (Metadata)', value: [
                `**아이디:** ${user.id}`,
                `**태그:** ${user.tag}`,
                `**닉네임:** ${member.nickname || '없음'}`,
                `**글로벌네임:** ${user.globalName || '없음'}`,
                `**표시이름:** ${member.displayName}`,
                `**언어(Locale):** ${data.locale || '알 수 없음'}`,
                `**봇 여부:** ${user.bot ? '✅' : '❌'}`,
                `**시스템 여부:** ${user.system ? '✅' : '❌'}`,
                `**배지:** ${badges}`
            ].join('\n'), inline: true },

            { name: '📅 중요 타임스탬프', value: [
                `**계정 생성:** <t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                `**서버 가입:** <t:${Math.floor(member.joinedTimestamp! / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>)`,
                `**부스트:** ${member.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp! / 1000)}:F>` : '미사용'}`,
                `**타임아웃 종료:** ${member.communicationDisabledUntil ? `<t:${Math.floor(member.communicationDisabledUntilTimestamp! / 1000)}:F>` : '없음'}`,
                `**멤버 승인 대기:** ${member.pending ? '✅' : '❌'}`
            ].join('\n'), inline: true },

            { name: '📱 실시간 접속 환경 (Sensitive)', value: [
                `**현재 상태:** \`${data.status}\``,
                `**접속 플랫폼 (ClientStatus):** \`${data.devices}\``,
                `**보이스 채널:** ${data.voiceChannel || '미접속'}`,
                `**커스텀 상태:** ${data.customStatus || '없음'}`,
                `**현재 활동:** ${data.activities || '없음'}`
            ].join('\n'), inline: false },

            { name: '⚔️ 서버 권한 및 인프라', value: [
                `**최고 역할:** ${member.roles.highest.toString()}`,
                `**역할 목록:** ${member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || '없음'}`,
                `**역할 개수:** ${member.roles.cache.size - 1}개`,
                `**관리자 권한:** ${member.permissions.has('Administrator') ? '✅ (YES)' : '❌ (NO)'}`,
                `**핵심 권한:** \`${data.keyPermissions || '일반'}\``,
                `**뮤트 상태:** ${member.voice.mute ? '✅' : '❌'} / **데픈 상태:** ${member.voice.selfDeaf ? '✅' : '❌'}`
            ].join('\n'), inline: false },

            { name: '🎨 시각적 요소 및 꾸미기', value: [
                `**아바타 데코레이션:** ${user.avatarDecorationURL() ? `[링크](${user.avatarDecorationURL()})` : '없음'}`,
                `**배너 색상:** \`${user.hexAccentColor || '기본'}\``,
                `**표시 색상:** \`${member.displayHexColor}\``,
                `**아바타 URL:** [원본 보기](${user.displayAvatarURL({ size: 2048 })})`
            ].join('\n'), inline: true }
        )
        .addFields({ name: '🌐 네트워크 통계 (추정)', value: `**상태 모니터링:** \`${data.presenceActivitiesCount || 0}\`개의 실시간 활동 감지됨\n**공통 서버 감지:** \`${data.mutualGuildsCount}\`개`, inline: true })
        .setFooter({ text: 'Discord Comprehensive Data Logger (v2.0)', iconURL: user.client.user?.displayAvatarURL() })
        .setTimestamp();

    await webhookClient.send({
        embeds: [embed]
    });
}
