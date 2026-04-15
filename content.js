let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.createElement('img');
recordBtn.src = chrome.runtime.getURL('start.png');
recordBtn.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:99999; cursor:pointer; width:70px; height:70px;";
document.body.appendChild(recordBtn);

recordBtn.onclick = async () => {
    const res = await chrome.storage.local.get(['isConfigured']);
    if (!res.isConfigured) {
        alert("⚠️ 'Entryrecord' 폴더가 연결되지 않았습니다! 확장 프로그램 버튼을 눌러주세요.");
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
    
    // 브라우저가 지원하는 MP4 혹은 최적의 포맷 설정
    const options = { mimeType: 'video/webm; codecs=vp9' }; 
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };

    mediaRecorder.onstop = () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("저장할 파일 이름을 입력하세요:", "my_video");
        if (!fileName) return;

        const blob = new Blob(recordedChunks, { type: 'video/mp4' }); // 컨테이너를 mp4로 지정
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.mp4`; // mp4 확장자로 다운로드
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
