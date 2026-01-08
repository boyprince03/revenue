# Divvy - Group Expense Splitting App

一個基於 Vue 3 + Vite + Firebase 建構的群組分帳與旅遊記帳應用程式。支援多幣別轉換、即時協作與智慧結算建議。

## ✨ 主要功能

- **多幣別支援**：整合 Open Exchange Rates，自動換算匯率，適合跨國旅遊。
- **即時同步**：基於 Firestore，所有成員的記帳操作皆會即時更新。
- **智慧結算**：自動計算債務關係，提供最佳化的還款建議路徑。
- **匯率計算機**：內建功能強大的匯率換算計算機。
- **邀請機制**：透過連結輕鬆邀請朋友加入群組。
- **收款資訊整合**：結算時直接顯示對方的銀行帳戶資訊。
- **多語系**：目前支援繁體中文 (zh-TW) 與英文 (en)。

## 🛠 技術棧

- **Frontend**: Vue 3, Vite, Tailwind CSS v4
- **State Management**: Pinia
- **Router**: Vue Router
- **Backend / DB**: Firebase (Authentication, Firestore)
- **I18n**: Vue I18n
- **APIs**: Open Exchange Rates, BigDataCloud (Geolocation)

## 🚀 安裝與執行

### 1. 前置需求
確保你已安裝 [Node.js](https://nodejs.org/) (建議 v18+)。

### 2. 下載專案與安裝依賴
```bash
git clone <repository-url>
cd divvy-app
npm install

### 3. 設定環境變數

在專案根目錄建立 `.env` 檔案，並填入以下 Firebase 與 API 設定：

Ini, TOML

```
# .env

# Open Exchange Rates API Key (用於匯率換算)
VITE_OER_API_KEY=your_oer_api_key_here

# Firebase Configuration (從 Firebase Console 獲取)
# 注意：本專案程式碼中目前是直接寫死在 src/firebase.js，
# 建議將其提取為環境變數以提升安全性。
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 啟動開發伺服器

Bash

```
npm run dev
```

啟動後，瀏覽器打開 `http://localhost:5173` 即可看到應用程式。

### 5. 建置生產版本

Bash

```
npm run build
```

## 📂 專案結構

```
src/
├── assets/          # 靜態資源 (SVG, Images)
├── components/      # 共用 Vue 元件
├── router/          # Vue Router 設定 (路由守衛)
├── views/           # 頁面元件
│   ├── main.js      # Pinia Store (狀態管理) Note: 建議移至 stores/ 資料夾
│   ├── Login.vue    # 登入頁
│   ├── Dashboard.vue # 主儀表板
│   ├── GroupDetail.vue # 群組記帳詳情
│   ├── Onboarding.vue # 個人資料設定
│   └── RatesConfig.vue # 匯率計算機
├── firebase.js      # Firebase 初始化設定
├── i18n.js          # 多語系設定
├── style.css        # Tailwind v4 設定與全域樣式
├── App.vue          # 根元件
└── main.js          # 應用程式入口
```

## ⚠️ 注意事項

1. **Firebase 安全性規則**：部署前請確保 Firestore Security Rules 設定正確，以防止未經授權的讀寫。
2. **匯率 API 限制**：Open Exchange Rates 免費版可能有請求次數限制，請留意 `src/views/main.js` (Store) 中的快取機制。
3. **Tailwind v4**：本專案使用 Tailwind CSS v4，相關變數定義於 `src/style.css` 的 `@theme` 區塊中。

## 🤝 貢獻

歡迎提交 Pull Request 或 Issue 來改善此專案。

## 📄 授權

MIT License

