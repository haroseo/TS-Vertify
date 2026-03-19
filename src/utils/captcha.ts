import svgCaptcha from 'svg-captcha';
import sharp from 'sharp';

export async function generateCaptcha() {
    // 6자리 랜덤 텍스트와 그에 해당하는 SVG 생성
    // svg-captcha는 내부적으로 텍스트를 경로(path)로 변환하므로 시스템 폰트가 필요 없음
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 3,
        color: true,
        background: '#1e1f22',
        width: 250,
        height: 100,
        fontSize: 60
    });

    // SVG 문자열을 PNG 버퍼로 변환 (sharp 사용)
    const imageBuffer = await sharp(Buffer.from(captcha.data))
        .png()
        .toBuffer();

    return {
        text: captcha.text.toUpperCase(),
        image: imageBuffer
    };
}
