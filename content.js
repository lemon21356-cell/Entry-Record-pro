let mediaRecorder;
let recordedChunks = [];

// 1. 버튼 생성 및 초기화
const recordBtn = document.createElement('img');
recordBtn.src = chrome.runtime.getURL('start.png');
recordBtn.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:99999; cursor:pointer; width:70px; height:70px;";
document.body.appendChild(recordBtn);

// 2. 버튼 클릭 이벤트
recordBtn.onclick = async () => {
    const res = await chrome.storage.local.get(['isConfigured']);
    if (!res.isConfigured) {
        alert("⚠️ 'Entryrecord' 폴더 위치가 지정되지 않았습니다!\n확장 프로그램 팝업에서 폴더를 먼저 연결해주세요.");
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
    if (!canvas) return alert("엔트리 실행 화면을 찾을 수 없습니다.");

    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };

    mediaRecorder.onstop = async () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("저장할 파일 이름을 입력하세요:", "my_entry_project");
        if (!fileName) return;

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
