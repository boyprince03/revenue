// src/stores/main.js
import { defineStore } from 'pinia'
import { auth, db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'

export const useMainStore = defineStore('main', {
  state: () => ({
    userProfile: null,
    rates: {}, 
    ratesTimestamp: 0, 
  }),
  actions: {
    async fetchUserProfile(uid) {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        this.userProfile = snap.data();
      }
    },
    async updateUserProfile(uid, data) {
      await setDoc(doc(db, "users", uid), data, { merge: true });
      this.userProfile = { ...this.userProfile, ...data };
    },
    
    async fetchRates() {
      const now = Date.now();
      if (Object.keys(this.rates).length > 0 && (now - this.ratesTimestamp < 3600 * 1000)) {
        return; 
      }

      try {
        const apiKey = import.meta.env.VITE_OER_API_KEY;
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
        const data = await response.json();
        
        if (data.rates) {
          this.rates = data.rates;
          this.ratesTimestamp = now;
          console.log('Exchange rates updated');
        }
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      }
    },

    getExchangeRate(base, target) {
      if (!this.rates[base] || !this.rates[target]) return 1; 
      return this.rates[target] / this.rates[base];
    },

    // 修改開頭: 增強版處理邀請，增加錯誤提示
    /**
     * 檢查是否有待處理的邀請，若有則將當前使用者加入群組
     * @returns {Promise<string|null>} 回傳 groupId 若成功加入，否則回傳 null
     */
    async handlePendingInvite() {
      const inviteGroupId = localStorage.getItem('pending_invite');
      // 確保取得最新的 auth 狀態
      const user = auth.currentUser;
      
      if (inviteGroupId && user) {
        try {
          const groupRef = doc(db, "groups", inviteGroupId);
          // 使用 arrayUnion 確保不會重複添加
          await updateDoc(groupRef, {
            members: arrayUnion(user.uid)
          });
          
          console.log(`Successfully joined group: ${inviteGroupId}`);
          // 成功後清除 pending 狀態
          localStorage.removeItem('pending_invite');
          return inviteGroupId;
        } catch (error) {
          console.error("Failed to join group:", error);
          if (error.code === 'permission-denied') {
             alert("無法加入群組：權限不足。可能是群組連結已失效或被刪除。");
          } else {
             alert("加入群組失敗，請稍後再試。");
          }
          // 即便失敗（例如權限不足），也移除 invite 以免卡在無限迴圈，除非您希望重試
          localStorage.removeItem('pending_invite');
          return null;
        }
      }
      return null;
    }
    // 修改結尾
  }
})