chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download_request") {
        chrome.downloads.download({
            url: request.url,
            // 크롬 다운로드 폴더 내의 'Entryrecord' 폴더명을 경로에 추가
            filename: "Entryrecord/" + request.filename, 
            saveAs: false
        }, (id) => {
            if (chrome.runtime.lastError) {
                // 만약 사용자가 Entryrecord 폴더를 안 만들었을 경우를 대비해 일반 다운로드 시도
                chrome.downloads.download({
                    url: request.url,
                    filename: request.filename,
                    saveAs: false
                });
            }
        });
    }
});
