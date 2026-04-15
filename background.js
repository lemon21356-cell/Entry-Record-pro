chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download_request") {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename, // 크롬 설정에서 지정한 폴더로 바로 저장됨
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("다운로드 실패:", chrome.runtime.lastError.message);
            }
        });
    }
});
