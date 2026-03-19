import { createCanvas } from 'canvas';

export function generateCaptcha() {
    const width = 250;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 배경색 채우기 (완전 깔끔한 검은색 계열)
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, width, height);

    // 랜덤 텍스트 생성
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 모든 노이즈 제거 (테스트를 위해 완전 제거)
    
    // 텍스트 렌더링
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // 폰트 설정 (nixpacks로 설치할 DejaVu Sans 사용)
    ctx.font = 'bold 60px "DejaVu Sans", Arial, sans-serif'; 

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = 35 + i * 36;
        const y = 50;

        ctx.save();
        ctx.translate(x, y);
        
        // 글자가 보이지 않는 문제를 해결하기 위해 fillText와 strokeText를 동시에 사용
        ctx.fillStyle = '#ffffff'; // 완전 하얀색
        ctx.fillText(char, 0, 0);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeText(char, 0, 0);
        
        ctx.restore();
    }

    // 방해 요소 0개
    
    return {
        text,
        image: canvas.toBuffer()
    };
}
