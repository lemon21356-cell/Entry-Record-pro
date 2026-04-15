let mediaRecorder;
let recordedChunks = [];
let canRecord = false;

// 1. 녹화 버튼 생성
const recordBtn = document.createElement('img');
chrome.storage.local.get(['isConfigured'], (res) => { canRecord = res.isConfigured || false; });
recordBtn.src = chrome.runtime.getURL('start.png'); 
recordBtn.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; cursor:pointer; width:60px; height:60px;";
document.body.appendChild(recordBtn);

// 2. 메시지 수신
chrome.runtime.onMessage.addListener((msg) => { if (msg.action === "path_ready") canRecord = true; });

// 3. 버튼 클릭 이벤트
recordBtn.onclick = async () => {
    if (!canRecord) {
        alert("⚠️ 'Entryrecord' 폴더 위치가 정해져 있지 않습니다! 확장 프로그램 아이콘을 눌러 폴더를 지정해주세요.");
        return;
    }

    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    } else {
        startRecording();
    }
};

async function startRecording() {
    const canvas = document.querySelector('canvas'); 
    if (!canvas) return alert("엔트리 화면을 찾을 수 없습니다.");

    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };

    mediaRecorder.onstop = () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("저장할 파일 이름을 입력해주세요:", "entry_video");
        if (!fileName) return; // 취소 시 저장 안 함

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.webm`;
        a.click();
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
