let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.createElement('img');
recordBtn.src = chrome.runtime.getURL('start.png');
recordBtn.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:99999; cursor:pointer; width:70px; height:70px;";
document.body.appendChild(recordBtn);

recordBtn.onclick = async () => {
    const res = await chrome.storage.local.get(['isConfigured']);
    if (!res.isConfigured) return alert("먼저 폴더를 연결해주세요!");
    
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    } else {
        startRecording();
    }
};

async function startRecording() {
    const canvas = document.querySelector('.entryCanvasElement') || document.querySelector('canvas');
    const stream = canvas.captureStream(30);
    
    // 윈도우 미디어 플레이어 호환성을 위한 코덱 설정
    const options = { mimeType: 'video/webm; codecs=vp8' };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };

    mediaRecorder.onstop = () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("파일 이름을 입력하세요:", "entry_video");
        if (!fileName) return;

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
            // background.js로 데이터 전송
            chrome.runtime.sendMessage({
                action: "download_request",
                url: reader.result,
                filename: fileName + ".mp4" // 확장자만 mp4로 표시
            });
        };
        reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
