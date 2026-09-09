# 陀螺競技場 — 純 GitHub 版部署說明（單一網址，後台用網址參數進入）

這個版本**只需要 GitHub**，不用申請 Firebase 或任何其他服務。比賽資料存成一個
JSON 檔案（`data/tournament.json`），放在你的 GitHub 儲存庫裡：

- 只有 **一個網頁檔案** `index.html`
- 一般連結（例如 `https://你的帳號.github.io/儲存庫名稱/`）打開只會看到參賽者檢視畫面，
  **完全沒有主辦人操作的按鈕或入口**
- 網址後面加上 `?admin=1`（例如 `https://你的帳號.github.io/儲存庫名稱/?admin=1`）打開，
  才會多出「主辦人操作」的切換按鈕，並直接進入後台畫面

把不帶參數的網址分享給參賽者，自己收藏帶 `?admin=1` 的網址操作即可。

⚠️ 這是「網址參數」而不是帳號密碼式的權限控管——知道要加 `?admin=1` 的人一樣打得開後台畫面，
但沒有輸入正確的後台密碼還是無法真的送出比賽結果，實務上這樣的區隔已經足夠。如果想要更保險，
可以把參數改成不容易猜到的字串（例如 `?admin=xk92j`），教學見下方「進階：自訂解鎖參數」。

---

## 跟 Firebase 版本比起來，這個做法有幾個取捨

- ✅ 只需要 GitHub 帳號，不用另外申請其他服務
- ⚠️ **沒有真正的即時推播**，改成每 5 秒自動刷新一次，落差通常在幾秒內
- ⚠️ **比賽資料會公開在 GitHub 儲存庫裡**（號碼、姓名、比分），因為免費版 GitHub Pages
  需要 Public 儲存庫。不想讓姓名公開可以請參賽者填綽號，或活動結束後把儲存庫刪除
- ⚠️ Token 需要直接寫進 `index.html` 原始碼裡（見第四步的重要提醒），安全性比「每次手動貼 Token」低一些

---

## 第一步：建立 GitHub 儲存庫

1. 到 [github.com](https://github.com) 新增一個 **Public** 儲存庫（例如 `spintop-contest`）
2. 上傳這些檔案：
   - `index.html`（改設定之後，見下方第二步）
   - 建一個 `data` 資料夾，裡面放一個**空白**的 `tournament.json` 檔案（內容留空即可，
     GitHub 網頁介面新增檔案時，檔名直接打 `data/tournament.json` 就會自動建資料夾）

---

## 第二步：修改 index.html 裡的設定

打開 `index.html`，搜尋 `YOUR_GITHUB_USERNAME`，會看到：

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

存檔後上傳（或覆蓋）到儲存庫。

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

## 第四步：申請 GitHub Token，並設定你的後台密碼

這個版本改成更簡單的操作方式：**Token 只需要設定一次、直接寫進 `index.html` 裡**，
之後你在後台操作只需要輸入一組你自己設定的密碼（例如 `184179`），不用每次都貼落落長的 Token。

1. 到 [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)（Fine-grained tokens）
2. 點「Generate new token」
3. 「Repository access」選 **Only select repositories**，選你剛剛建的那個儲存庫
4. 「Permissions」展開 **Repository permissions**，找到 **Contents**，設為 **Read and write**
   （其他權限都不用動）
5. 設定一個到期日（例如活動當天後一週），按「Generate token」
6. 複製產生的 Token（`github_pat_` 開頭的一長串），**這組只會顯示一次**

7. 打開 `index.html`，搜尋 `EMBEDDED_GITHUB_TOKEN`，會看到：

   ```js
   const ADMIN_PASSWORD = '184179';
   const EMBEDDED_GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
   ```

   把 `YOUR_GITHUB_TOKEN_HERE` 換成剛剛複製的 Token，`ADMIN_PASSWORD` 也可以改成你想要的密碼
   （不一定要用 184179）。存檔後上傳覆蓋回 GitHub 儲存庫。

8. 之後打開帶 `?admin=1` 的網址，只要輸入你設定的密碼（例如 `184179`）就能解鎖後台操作，
   不用再貼 Token。密碼解鎖狀態會記在瀏覽器裡，同一台裝置下次不用重新輸入，可以按「鎖定」
   隨時手動鎖回去。

⚠️ **重要提醒**：這個做法把真正的 GitHub Token 直接寫進了 `index.html` 裡，而這個檔案是
公開放在 GitHub 儲存庫裡的，代表**任何人只要打開網頁「檢視原始碼」，都看得到這組 Token**，
密碼只是擋住「一般人不會想到要看原始碼」，並不是真正加密或隱藏。因此：

- Token 一定要用「只限這一個儲存庫、只有 Contents 讀寫權限」的 Fine-grained token，
  範圍越小，就算外流影響也有限（頂多只能改這個比賽網站的資料，動不了你帳號其他東西）
- 務必設定到期日，活動結束後 Token 自動失效
- 活動結束建議直接到 GitHub 設定頁面把這組 Token 刪除

如果你在意這個風險，回頭使用「主辦人自己貼 Token」的版本（Token 不寫進原始碼、只存在
操作者自己的瀏覽器）會更安全，但操作上每台裝置都要貼一次 Token。兩種各有取捨，看你怎麼權衡。

---

## 進階：自訂解鎖參數（想比 `?admin=1` 更不容易被猜到）

打開 `index.html`，搜尋 `ADMIN_UNLOCKED`，會看到：

```js
const ADMIN_UNLOCKED = (() => {
  try {
    return new URLSearchParams(window.location.search).has('admin');
  } catch (e) {
    return false;
  }
})();
```

把 `.has('admin')` 改成你自己想要的參數名稱，例如改成 `.has('backstage_xk92j')`，
之後就要用 `?backstage_xk92j=1` 才能解鎖後台，比較不容易被參賽者不小心猜到或試出來。

---

## 之後想修改怎麼辦？

`index.html` 是唯一的原始碼，改完直接重新上傳覆蓋、GitHub Pages 會在 1 分鐘內自動更新。

## 活動結束後

- 到 GitHub Token 設定頁面把這組 Token 刪除或讓它過期
- 如果不想讓比賽資料（號碼、姓名、比分）留在公開儲存庫裡，把整個儲存庫刪除即可
