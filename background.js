chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download_request") {
        chrome.downloads.download({
            url: request.url,
            filename: "Entryrecord/" + request.filename,
            saveAs: false
        });
    }
});
