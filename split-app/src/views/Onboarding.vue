<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-100 p-6 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-gold-500 rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gold-400 rounded-full blur-3xl opacity-10 -translate-x-1/3 translate-y-1/3"></div>

    <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative z-10 border border-gray-50">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-light text-dark-900 tracking-wide">{{ t('onboarding.setup_profile') }}</h2>
        <p class="text-gray-400 text-xs mt-2 uppercase tracking-widest">{{ t('onboarding.subtitle') }}</p>
      </div>
      
      <div class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase tracking-widest text-gray-400 mb-2 ml-1">{{ t('onboarding.nickname') }}</label>
            <input 
              v-model="form.nickname" 
              class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-dark-800 placeholder-gray-300 focus:outline-none focus:border-gold-500 focus:bg-white transition-all"
              :placeholder="t('onboarding.nickname_placeholder')"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-widest text-gray-400 mb-2 ml-1">{{ t('onboarding.nationality') }}</label>
              <div class="relative">
                <input 
                  v-model="form.nationality" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-dark-800 placeholder-gray-300 focus:outline-none focus:border-gold-500 focus:bg-white transition-all"
                  placeholder="e.g. TW" 
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold-500 font-bold opacity-50">AUTO</span>
              </div>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-widest text-gray-400 mb-2 ml-1">{{ t('onboarding.currency') }}</label>
              <div class="relative">
                <select 
                  v-model="form.currency" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-dark-800 appearance-none focus:outline-none focus:border-gold-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="TWD">TWD</option>
                  <option value="USD">USD</option>
                  <option value="JPY">JPY</option>
                  <option value="EUR">EUR</option>
                </select>
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
              </div>
            </div>
          </div>
        </div>

        <div class="relative py-2">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-100"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-white px-4 text-xs text-gray-300 uppercase tracking-widest">{{ t('onboarding.optional') }}</span>
          </div>
        </div>

        <div class="bg-gold-50/50 p-5 rounded-2xl border border-gold-100/50">
           <div class="flex items-center gap-2 mb-4">
             <span class="w-6 h-6 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center text-xs">💳</span>
             <div>
               <h3 class="text-sm font-bold text-dark-800">{{ t('onboarding.payment_info') }}</h3>
               <p class="text-[10px] text-gold-600/70">{{ t('onboarding.payment_desc') }}</p>
             </div>
           </div>
           
           <div class="space-y-3">
             <div>
               <input 
                 v-model="form.bankName" 
                 class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-dark-800 placeholder-gray-300 focus:outline-none focus:border-gold-500 transition-all"
                 :placeholder="t('group.bank_name_code')" 
               />
             </div>
             <div>
               <input 
                 v-model="form.bankAccount" 
                 class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-dark-800 placeholder-gray-300 font-mono focus:outline-none focus:border-gold-500 transition-all"
                 :placeholder="t('group.account_label')" 
               />
             </div>
           </div>
        </div>

        <button 
          @click="saveProfile" 
          class="w-full bg-dark-800 text-white py-4 rounded-xl shadow-lg hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 group"
        >
          <span>{{ t('onboarding.save_profile') }}</span>
          <span class="text-gold-500 group-hover:translate-x-1 transition-transform">➔</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '../firebase';
import { useMainStore } from './main';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // 修改開頭: 新增引入

const { t } = useI18n(); // 啟用翻譯功能
const store = useMainStore();
const router = useRouter();
const form = ref({ 
  nickname: '', 
  nationality: '', 
  currency: 'USD',
  bankName: '',
  bankAccount: ''
});

const countryToCurrency = { 'TW': 'TWD', 'US': 'USD', 'JP': 'JPY', 'KR': 'KRW' };

onMounted(async () => {
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    
    if (!store.userProfile) {
      await store.fetchUserProfile(uid);
    }
    
    if (store.userProfile) {
      const p = store.userProfile;
      form.value.nickname = p.nickname || auth.currentUser.displayName || '';
      form.value.nationality = p.nationality || '';
      form.value.currency = p.currency || 'USD';
      form.value.bankName = p.bankName || '';
      form.value.bankAccount = p.bankAccount || '';
    } else {
      form.value.nickname = auth.currentUser.displayName || '';
    }
    
    if (!form.value.nationality && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const detectedCountryCode = 'TW'; 
        form.value.nationality = detectedCountryCode;
        if(form.value.currency === 'USD' && countryToCurrency[detectedCountryCode]) {
          form.value.currency = countryToCurrency[detectedCountryCode];
        }
      });
    }
  }
});

const saveProfile = async () => {
  if (!auth.currentUser) return;
  await store.updateUserProfile(auth.currentUser.uid, form.value);
  
  const inviteGroupId = await store.handlePendingInvite();
  if (inviteGroupId) {
    router.push(`/group/${inviteGroupId}`);
  } else {
    router.push('/dashboard');
  }
};
// 修改結尾
</script>