import { createCanvas } from 'canvas';

export function generateCaptcha() {
    const width = 250;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 배경색 채우기 (어두운 회색)
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, width, height);

    // 랜덤 배경 노이즈 (작은 점들)
    for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 랜덤 텍스트 생성
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 텍스트 렌더링
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const fontSize = 35 + Math.random() * 15;
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        const x = 40 + i * 35;
        const y = 50 + (Math.random() - 0.5) * 20;
        const angle = (Math.random() - 0.5) * 0.6;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 글자에 그림자 효과 추가 (가독성 방해)
        ctx.shadowOffsetX = Math.random() * 4 - 2;
        ctx.shadowOffsetY = Math.random() * 4 - 2;
        ctx.shadowBlur = Math.random() * 5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 굵은 노이즈 선 추가 (글자 위를 지나가게)
    for (let i = 0; i < 15; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.bezierCurveTo(
            Math.random() * width, Math.random() * height,
            Math.random() * width, Math.random() * height,
            Math.random() * width, Math.random() * height
        );
        ctx.stroke();
    }

    // 픽셀레이션 효과 (화질 저하 느낌 유도)
    const imgData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        // 노이즈 섞기
        if (Math.random() > 0.98) {
            imgData.data[i] = 255;
            imgData.data[i+1] = 255;
            imgData.data[i+2] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);

    return {
        text,
        image: canvas.toBuffer()
    };
}
