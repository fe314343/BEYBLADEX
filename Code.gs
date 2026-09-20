/**
 * BEYBLADE ARENA — Google Apps Script 後端
 *
 * 功能：
 *  1. doGet：把 index.html 當成網頁提供給所有人（這就是「賽程連結」）
 *  2. getState / saveState：把賽程存在你的 Google 帳號（所有人看到同一份、即時更新）
 *  3. readSheet：用「你的 Google 帳號」讀取試算表名單（私人檔案也可以，不必公開）
 *
 * 安全性：只有輸入後台密碼的人才能儲存賽程、讀取試算表；一般參賽者只能「查看」。
 */

// ★ 後台密碼：要更改請改這裡，存檔後重新部署即可
const ADMIN_PASSWORD = '184179';

const STATE_KEY = 'BEY_STATE';
const CHUNK_SIZE = 2500;   // 指令碼屬性單筆上限約 9KB，中文一字 3 bytes，所以切小段存

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('BEYBLADE ARENA 陀螺爭霸賽')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 取得目前賽程（回傳 JSON 字串；尚未建立則回傳空字串）。所有人都可讀。 */
function getState() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(STATE_KEY);
  if (cached) return cached;

  const props = PropertiesService.getScriptProperties();
  const n = parseInt(props.getProperty(STATE_KEY + '_N') || '0', 10);
  if (!n) return '';
  let out = '';
  for (let i = 0; i < n; i++) out += props.getProperty(STATE_KEY + '_' + i) || '';
  try { cache.put(STATE_KEY, out, 21600); } catch (e) { /* 超過快取上限就略過 */ }
  return out;
}

/** 儲存賽程（需要後台密碼）。 */
function saveState(json, pass) {
  checkPassword_(pass);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const oldN = parseInt(props.getProperty(STATE_KEY + '_N') || '0', 10);
    const n = Math.ceil(json.length / CHUNK_SIZE);
    const data = {};
    for (let i = 0; i < n; i++) data[STATE_KEY + '_' + i] = json.substr(i * CHUNK_SIZE, CHUNK_SIZE);
    data[STATE_KEY + '_N'] = String(n);
    props.setProperties(data, false);
    for (let i = n; i < oldN; i++) props.deleteProperty(STATE_KEY + '_' + i);

    const cache = CacheService.getScriptCache();
    try { cache.put(STATE_KEY, json, 21600); } catch (e) { cache.remove(STATE_KEY); }
  } finally {
    lock.releaseLock();
  }
  return true;
}

/** 驗證後台密碼。 */
function verifyPassword(pass) {
  try {
    checkPassword_(pass);
    return true;
  } catch (e) {
    if (String(e.message).indexOf('過多') >= 0) throw e;
    return false;
  }
}

/**
 * 讀取 Google 試算表（需要後台密碼），回傳二維陣列。
 * 網址若帶有 gid=xxxx 就讀該分頁，否則讀第一個分頁。
 */
function readSheet(url, pass) {
  checkPassword_(pass);
  const ss = SpreadsheetApp.openByUrl(url);
  let sheet = ss.getSheets()[0];
  const m = /[?#&]gid=(\d+)/.exec(url);
  if (m) {
    const gid = parseInt(m[1], 10);
    const found = ss.getSheets().filter(function (s) { return s.getSheetId() === gid; })[0];
    if (found) sheet = found;
  }
  return sheet.getDataRange().getDisplayValues();
}

function checkPassword_(pass) {
  const cache = CacheService.getScriptCache();
  const fails = parseInt(cache.get('PW_FAILS') || '0', 10);
  if (fails >= 10) throw new Error('密碼嘗試次數過多，請 10 分鐘後再試');
  if (String(pass) !== ADMIN_PASSWORD) {
    cache.put('PW_FAILS', String(fails + 1), 600);
    throw new Error('密碼錯誤');
  }
}
