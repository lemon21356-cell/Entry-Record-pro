// popup.js (개선된 버전)
const setFolderBtn = document.getElementById('setFolder');
const statusDiv = document.getElementById('pathStatus');

// 팝업이 켜질 때 상태 확인
chrome.storage.local.get(['isConfigured'], (data) => {
  if (data.isConfigured) {
    statusDiv.innerText = "✅ Entryrecord 연결 완료";
    statusDiv.style.color = "green";
  }
});

setFolderBtn.addEventListener('click', async () => {
  try {
    // 1. 폴더 선택창 호출 (사용자 직접 클릭 시에만 작동)
    const dirHandle = await window.showDirectoryPicker();
    
    // 2. 이름 검증
    if (dirHandle.name !== "Entryrecord") {
      alert("폴더 이름이 'Entryrecord'가 아닙니다!");
      return;
    }

    // 3. 상태 저장 및 UI 업데이트
    await chrome.storage.local.set({ isConfigured: true });
    statusDiv.innerText = "✅ Entryrecord 연결 완료";
    statusDiv.style.color = "green";
    
    // 4. 현재 열려있는 엔트리 탭에 알림 전송
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "path_ready" });
    }
  } catch (err) {
    // 사용자가 창을 그냥 닫았을 때 발생하는 오류 방지
    console.error("폴더 선택 중 오류 발생:", err);
  }
});
