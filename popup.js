document.getElementById('setFolder').addEventListener('click', async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    
    if (dirHandle.name !== "Entryrecord") {
      alert("오류: 폴더 이름이 'Entryrecord'가 아닙니다.");
      await chrome.storage.local.set({ isConfigured: false });
      return;
    }

    await chrome.storage.local.set({ isConfigured: true });
    document.getElementById('pathStatus').innerText = "✅ Entryrecord 연결 완료";
    
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab) chrome.tabs.sendMessage(tab.id, { action: "path_ready" });
  } catch (err) {
    console.log("취소됨");
  }
});
