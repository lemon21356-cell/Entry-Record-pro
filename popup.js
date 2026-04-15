document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get(['isConfigured']);
  if (data.isConfigured) updateUI(true);
});

document.getElementById('setFolder').addEventListener('click', async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    if (dirHandle.name !== "Entryrecord") {
      alert("폴더 이름이 'Entryrecord'가 아닙니다!");
      return;
    }
    await chrome.storage.local.set({ isConfigured: true });
    updateUI(true);
    
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "path_ready" }, () => {
        if (chrome.runtime.lastError) { /* 페이지 미준비 시 무시 */ }
      });
    }
  } catch (err) { console.log("취소됨"); }
});

function updateUI(isOk) {
  const status = document.getElementById('pathStatus');
  if (isOk) {
    status.innerText = "✅ Entryrecord 연결 완료";
    status.style.color = "green";
  }
}
