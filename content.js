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
    
    // 재생 오류 해결을 위한 코덱 설정 (H.264 시도, 안되면 기본값)
    let options = { mimeType: 'video/webm; codecs=h264' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm; codecs=vp8' };
    }
    
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);

    mediaRecorder.onstop = async () => {
        recordBtn.src = chrome.runtime.getURL('start.png');
        const fileName = prompt("파일 이름을 입력하세요:", "entry_video");
        if (!fileName) return;

        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        const reader = new FileReader();
        
        // 파일을 데이터 URL로 변환하여 background로 전달 (폴더 강제 지정 위함)
        reader.onloadend = () => {
            chrome.runtime.sendMessage({
                action: "download_video",
                url: reader.result,
                filename: fileName + ".mp4"
            });
        };
        reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    recordBtn.src = chrome.runtime.getURL('stop.png');
}
