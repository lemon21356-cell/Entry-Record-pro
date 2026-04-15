let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.createElement('img');
recordBtn.src = chrome.runtime.getURL('start.png');
recordBtn.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:99999; cursor:pointer; width:70px; height:70px;";
document.body.appendChild(recordBtn);

recordBtn.onclick = async () => {
    const res = await chrome.storage.local.get(['isConfigured']);
    if (!res.isConfigured) {
        alert("⚠️ 'Entryrecord' 폴더 연결이 필요합니다! 확장프로그램 아이콘을 눌러주세요.");
        return;
    }
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    } else {
        startRecording();
    }
};

async function startRecording() {
    const canvas = document.querySelector('.entryCanvasElement') || document.querySelector('canvas');
    if (!canvas) return alert("엔트리 화면을 찾을 수 없습니다.");

    const stream = canvas.captureStream(30);
    
    // 가장 호환성이 좋은 코덱 설정
    const options = { mimeType: 'video/webm; codecs=vp8' }; 
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };

    mediaRecorder.onstop = () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("저장할 파일 이름을 입력하세요:", "entry_video");
        if (!fileName) return;

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        // 팁: 재생이 안 된다면 확장자를 .webm으로 먼저 시도해보세요. 
        // 윈도우 기본 미디어 플레이어는 .webm을 지원하지 않을 수 있으니 '크롬'으로 열거나 'VLC 플레이어'를 추천합니다.
        a.download = `${fileName}.mp4`; 
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
