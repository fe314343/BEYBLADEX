# 陀螺競技場 — 純 GitHub 版部署說明

這個版本**只需要 GitHub**，不用申請 Firebase 或任何其他服務。原理是把比賽資料存成一個
JSON 檔案（`data/tournament.json`），直接放在你的 GitHub 儲存庫裡：

- **參賽者查看進度**：直接讀取這個 JSON 檔案的公開網址，不需要帳號或密碼
- **主辦人輸入比賽結果**：透過 GitHub API 把新的 JSON 內容「提交」進儲存庫，這一步需要你自己的
  GitHub Token 來驗證身份（只有你自己的瀏覽器會用到，不會被放進網頁原始碼裡）

需要兩個東西：`index.html`（網頁本體）、`data/tournament.json`（一開始留空即可）。

---

## 跟 Firebase 版本比起來，這個做法有幾個取捨

- ✅ 只需要 GitHub 帳號，不用另外申請其他服務
- ⚠️ **沒有真正的即時推播**，改成每 5 秒自動刷新一次（跟最早 Claude 版本的輪詢方式一樣），
  不會像 Firebase 版本那樣幾乎瞬間同步，但落差通常在幾秒內
- ⚠️ **比賽資料會公開在 GitHub 儲存庫裡**（包含號碼、姓名、比分），因為免費版 GitHub Pages
  需要 Public 儲存庫。如果不想讓姓名公開，可以請參賽者只填綽號，或活動結束後把整個儲存庫刪除
- ⚠️ 主辦人操作時需要貼上一組 GitHub Token，操作起來比 Firebase 版本多一個步驟

如果你比較在意即時性或資料隱私，Firebase 版本會更適合；如果就是想單純用 GitHub 搞定，
這個版本完全夠用（畢竟只是陀螺比賽，資料公開影響不大）。

---

## 第一步：建立 GitHub 儲存庫

1. 到 [github.com](https://github.com) 新增一個 **Public** 儲存庫（例如 `spintop-contest`）
2. 上傳兩個東西：
   - `index.html`（改設定之後，見下方第二步）
   - 建一個 `data` 資料夾，裡面放一個**空白**的 `tournament.json` 檔案（內容留空就好，
     GitHub 網頁介面新增檔案時，檔名直接打 `data/tournament.json` 就會自動建資料夾）

---

## 第二步：修改 index.html 裡的設定

打開 `index.html`，搜尋 `YOUR_GITHUB_USERNAME`，會看到這幾行：

```js
const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME';
const GITHUB_REPO = 'YOUR_REPO_NAME';
const GITHUB_BRANCH = 'main';
const DATA_PATH = 'data/tournament.json';
```

把前兩個換成你實際的 GitHub 帳號名稱與儲存庫名稱，例如：

```js
const GITHUB_OWNER = 'chiuhaha';
const GITHUB_REPO = 'spintop-contest';
```

`DATA_PATH` 如果第一步資料夾/檔名跟這裡不一樣要記得對應好。存檔後上傳（或覆蓋）到儲存庫。

---

## 第三步：開啟 GitHub Pages

1. 進儲存庫的 **Settings → Pages**
2. Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 Save
3. 等 1～2 分鐘，會出現網址：

   ```
   https://<你的帳號>.github.io/<儲存庫名稱>/
   ```

   這個網址給參賽者用手機打開就能看到賽程，**不需要 Token**，任何人都能看。

---

## 第四步：主辦人申請一組 GitHub Token（給自己操作用）

1. 到 [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)（Fine-grained tokens）
2. 點「Generate new token」
3. 「Repository access」選 **Only select repositories**，選你剛剛建的那個儲存庫
4. 「Permissions」展開 **Repository permissions**，找到 **Contents**，設為 **Read and write**
   （其他權限都不用動）
5. 設定一個到期日（例如活動當天後一週），按「Generate token」
6. 複製產生的 Token（`github_pat_` 開頭的一長串），**這組只會顯示一次**，先存到你自己的
   記事本或密碼管理工具

⚠️ 這組 Token 只給「這一個儲存庫」的讀寫權限，不要分享給別人、不要貼到程式碼裡上傳到 GitHub。

7. 打開你的 `index.html` 網址，切到「主辦人操作」，把這組 Token 貼到頁面上的 Token 欄位——
   它只會存在你自己這支手機/電腦的瀏覽器裡（用瀏覽器的本機儲存），換一台裝置要重新貼一次。

之後你在主辦人畫面產生對戰表、輸入比賽結果，就會透過這組 Token 把資料寫回
`data/tournament.json`，參賽者的手機每 5 秒會自動刷新看到最新進度。

---

## 之後想修改怎麼辦？

`index.html` 是唯一的原始碼，改完直接重新上傳覆蓋、GitHub Pages 會在 1 分鐘內自動更新。

## 活動結束後

- 到 GitHub Token 設定頁面把這組 Token 刪除或讓它過期
- 如果不想讓比賽資料（號碼、姓名、比分）留在公開儲存庫裡，把整個儲存庫刪除即可
