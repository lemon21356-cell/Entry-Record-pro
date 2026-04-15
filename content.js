let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.createElement('img');
recordBtn.src = chrome.runtime.getURL('start.png');
recordBtn.style.cssText = "position:fixed; bottom:30px; right:30px; z-index:99999; cursor:pointer; width:70px; height:70px;";
document.body.appendChild(recordBtn);

recordBtn.onclick = async () => {
    const res = await chrome.storage.local.get(['isConfigured']);
    if (!res.isConfigured) return alert("먼저 확장프로그램 팝업에서 폴더를 연결해주세요!");
    
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    } else {
        startFullRecording();
    }
};

async function startFullRecording() {
    try {
        // 1. 전체 화면(탭) 공유 요청 (오디오 포함)
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // 2. 코덱 설정 (H.264 지원 확인)
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
            // 녹화 중지 시 스트림의 모든 트랙 중지
            stream.getTracks().forEach(track => track.stop());
            recordBtn.src = chrome.runtime.getURL('start.png');

            const fileName = prompt("파일 이름을 입력하세요:", "entry_full_record");
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
        console.error("녹화 시작 실패:", err);
        alert("녹화 대상을 선택해야 합니다.");
    }
}
