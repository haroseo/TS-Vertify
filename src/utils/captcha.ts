import { createCanvas } from 'canvas';

export function generateCaptcha() {
    const width = 300;
    const height = 120;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 배경색 채우기 (프리미엄한 어두운 배경)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2c2c2c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 랜덤 텍스트 생성
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 텍스트 렌더링 설정 (시스템 폰트 활용)
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Railway에서 로드 가능한 다양한 폰트 시도
    const fonts = [
        'bold 60px "DejaVu Sans"',
        'bold 60px "Liberation Sans"',
        'bold 60px "FreeSans"',
        'bold 60px Arial',
        'bold 60px sans-serif'
    ].join(', ');
    
    ctx.font = fonts;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = 50 + i * 40;
        const y = 60 + (Math.random() - 0.5) * 20;
        const angle = (Math.random() - 0.5) * 0.4;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 글자 광택 및 그림자 효과 (전문가스러운 디자인)
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        
        const textGradient = ctx.createLinearGradient(-30, -30, 30, 30);
        textGradient.addColorStop(0, '#ffffff');
        textGradient.addColorStop(1, '#cccccc');
        
        ctx.fillStyle = textGradient;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 세련된 방해 요소 추가 (가독성을 해치지 않는 선에서)
    for (let i = 0; i < 10; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    return {
        text,
        image: canvas.toBuffer()
    };
}
