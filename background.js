chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download_video") {
        chrome.downloads.download({
            url: request.url,
            // 크롬 기본 다운로드 폴더 내의 'Entryrecord' 폴더로 경로 강제
            filename: "Entryrecord/" + request.filename,
            saveAs: false
        });
    }
});
