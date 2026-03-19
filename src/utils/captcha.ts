import { createCanvas } from 'canvas';

export function generateCaptcha() {
    const width = 250;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 배경색 채우기 (매우 깔끔한 어두운 회색)
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, width, height);

    // 랜덤 텍스트 생성 (가독성 낮은 문자 제외: I, 1, O, 0 등)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 텍스트 렌더링 설정 (극도로 선명하게)
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px sans-serif'; // 크고 굵은 폰트

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = 40 + i * 35;
        const y = 50; 
        const angle = (Math.random() - 0.5) * 0.2; // 아주 약간의 회전만 허용

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 글자 뒤에 아주 연한 그림자만 추가 (입체감용)
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        
        // 밝고 선명한 노란색/흰색 계열 사용
        ctx.fillStyle = '#ffffff'; 
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 모든 방해 선 및 노이즈 제거 (극강의 가독성)
    
    return {
        text,
        image: canvas.toBuffer()
    };
}
