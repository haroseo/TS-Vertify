import { createCanvas } from 'canvas';

export function generateCaptcha() {
    const width = 250;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 배경색 채우기 (깔끔한 어두운 배경)
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, width, height);

    // 적당한 배경 노이즈 (작은 점들 수 감소)
    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // 랜덤 텍스트 생성 (가독성이 떨어지는 문자 O, 0, I, 1 등 제외 고려)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 텍스트 렌더링 설정
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const fontSize = 40 + Math.random() * 10;
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        const x = 40 + i * 35;
        const y = 50 + (Math.random() - 0.5) * 15; // 상하 흔들림 감소
        const angle = (Math.random() - 0.5) * 0.4; // 회전 각도 감소

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 글자 가독성을 위해 그림자 효과 완화
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        
        // 대비가 뚜렷한 색상 선택
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 75%)`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 방해 선 개수 감소 및 굵기 조절
    for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // 픽셀레이션/화질 저하 효과 제거 (가독성 확보)

    return {
        text,
        image: canvas.toBuffer()
    };
}
