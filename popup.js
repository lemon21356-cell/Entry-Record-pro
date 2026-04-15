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
    
    // 메시지 전송 로직 강화
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    
    if (tabs[0] && tabs[0].url.includes("playentry.org")) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "path_ready" }, (response) => {
        // 연결 에러가 발생해도 무시 (콘솔 에러 방지)
        if (chrome.runtime.lastError) {
          console.log("엔트리 페이지가 아직 준비되지 않았습니다. 새로고침 후 시도하세요.");
        }
      });
    }
  } catch (err) {
    console.log("사용자가 폴더 선택을 취소했거나 오류가 발생했습니다.");
  }
});

function updateUI(isOk) {
  const status = document.getElementById('pathStatus');
  if (isOk) {
    status.innerText = "✅ Entryrecord 연결 완료";
    status.style.color = "green";
  }
}
