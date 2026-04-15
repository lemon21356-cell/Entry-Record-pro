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
        startUniversalRecording();
    }
};

async function startUniversalRecording() {
    try {
        // 모든 창, 전체 화면, 탭 중 선택 가능하도록 요청
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                displaySurface: "monitor", // 전체 화면 우선 제안
                cursor: "always" 
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: false, // 소리 품질을 위해 억제 완화
                autoGainControl: true
            }
        });

        // 윈도우 미디어 플레이어 호환을 위한 코덱 설정
        let options = { mimeType: 'video/webm; codecs=h264' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm; codecs=vp8' };
        }

        mediaRecorder = new MediaRecorder(stream, options);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            recordBtn.src = chrome.runtime.getURL('start.png');

            const fileName = prompt("파일 이름을 입력하세요:", "google_record");
            if (!fileName) return;

            const blob = new Blob(recordedChunks, { type: 'video/mp4' });
            const reader = new FileReader();
            reader.onloadend = () => {
                chrome.runtime.sendMessage({
                    action: "download_request",
                    url: reader.result,
                    filename: fileName + ".mp4"
                });
            };
            reader.readAsDataURL(blob);
        };

        mediaRecorder.start();
        recordBtn.src = chrome.runtime.getURL('stop.png');

    } catch (err) {
        console.error("녹화 취소 또는 에러:", err);
    }
}
