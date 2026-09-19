# 陀螺競技場 — 部署說明（GitHub Token 內嵌 + 密碼版）

只需要 GitHub，一個 `index.html` 檔案。網址加 `?admin=1` 進後台，輸入密碼解鎖後即可操作。

---

## ⚠️ 已知限制，請務必先讀過

實測發現：只要把真正的 GitHub Token 寫進 **Public（公開）** 儲存庫的程式碼裡，
GitHub 的自動安全機制會偵測到並**自動撤銷**這組 Token，導致之後所有寫入都會出現
`401 Bad credentials` 錯誤，需要重新申請、重新貼上，而且會不斷重複發生。

**這不是設定錯誤，是 GitHub 這個平台本身的行為**，只要儲存庫是 Public，這個問題就會持續發生。

### 兩個緩解方式（擇一）

1. **把儲存庫設成 Private（私人）**：GitHub 的自動撤銷機制主要針對「任何人都能看到」的公開
   洩漏，Private 儲存庫理論上不會觸發。但**免費版 GitHub 帳號的 GitHub Pages 只能架在 Public
   儲存庫上**，要在 Private 儲存庫上用 GitHub Pages，需要升級 GitHub Pro（付費，約每月 4 美元）。
2. **不要把 Token 寫進程式碼**，改成主辦人自己在網頁上手動貼 Token（存在自己瀏覽器裡，不會
   進儲存庫，也就不會被偵測撤銷）——這是之前驗證過穩定可行的做法，代價是每換一台裝置操作要
   重新貼一次 Token，沒辦法只用一組密碼搞定。

如果你的儲存庫維持 Public、又想繼續用「Token 寫進程式碼＋密碼解鎖」這個版本，
**每次 Token 被撤銷時都需要重新申請一組新的 Token、重新貼進程式碼**，這是目前這個做法
在 Public 儲存庫上無法避免的維護成本。

---

## 第一步：建立 GitHub 儲存庫

1. 到 [github.com](https://github.com) 新增一個 **Public** 儲存庫（例如 `spintop-contest`）
   （如果要用方案一的 Private 儲存庫，需要先確認帳號是 GitHub Pro）
2. 上傳這些檔案：
   - `index.html`（改設定之後，見下方第二步）
   - 建一個 `data` 資料夾，裡面放一個**空白**的 `tournament.json` 檔案

---

## 第二步：修改 index.html 裡的設定

打開 `index.html`，搜尋 `YOUR_GITHUB_USERNAME`：

```js
const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME';
const GITHUB_REPO = 'YOUR_REPO_NAME';
const GITHUB_BRANCH = 'main';
const DATA_PATH = 'data/tournament.json';
```

換成你實際的 GitHub 帳號與儲存庫名稱。再往下搜尋 `ADMIN_PASSWORD`，改成你想要的密碼。

---

## 第三步：開啟 GitHub Pages

1. 進儲存庫的 **Settings → Pages**
2. Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 Save
3. 等 1～2 分鐘，會出現網址：

   ```
   參賽者用：https://<你的帳號>.github.io/<儲存庫名稱>/
   主辦人用：https://<你的帳號>.github.io/<儲存庫名稱>/?admin=1
   ```

---

## 第四步：申請 GitHub Token，貼進程式碼

1. 到 [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. 點「Generate new token」
3. 「Repository access」選 **Only select repositories**，選你的儲存庫
4. 「Permissions」展開 **Repository permissions**，找到 **Contents**，設為 **Read and write**
   （中文介面顯示為「內容」，不要跟「Commit statuses / 提交狀態」搞混）
5. 設定一個**未來**的到期日，按「Generate token」
6. 用 Token 旁邊的**複製圖示按鈕**複製（不要手動選取拖曳，容易漏字），貼到 `index.html` 裡
   `EMBEDDED_GITHUB_TOKEN` 那一行，前後不要留空白
7. 存檔時如果跳出「秘密掃描」警告，選「我稍後會修復它」→「允許秘密」才能繼續提交

之後打開帶 `?admin=1` 的網址，輸入你設定的密碼即可操作。

---

## 如果又出現 401 Bad credentials

代表 Token 又被撤銷了（或申請時沒選對「內容/Contents」權限）。到
[github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) 確認：

- 這組 Token 是否還在列表上（被撤銷的話可能已消失或標示異常）
- 重新走一次第四步，申請全新的一組替換

---

## 活動結束後

- 到 GitHub Token 設定頁面把這組 Token 刪除
- 如果不想讓比賽資料留在公開儲存庫裡，把整個儲存庫刪除即可
