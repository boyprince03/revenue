<template>
  <div class="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Welcome! Set up your profile</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Nickname</label>
          <input v-model="form.nickname" class="w-full border p-2 rounded" />
        </div>
        
        <div>
          <label class="block text-sm font-medium">Nationality (Auto-detected)</label>
          <input v-model="form.nationality" class="w-full border p-2 rounded" placeholder="e.g. TW" />
        </div>

        <div>
          <label class="block text-sm font-medium">Preferred Currency</label>
          <select v-model="form.currency" class="w-full border p-2 rounded">
            <option value="TWD">TWD (Taiwan Dollar)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="JPY">JPY (Japanese Yen)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>

        <button @click="saveProfile" class="w-full bg-green-600 text-white p-3 rounded mt-4">
          Start Using
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

const store = useMainStore();
const router = useRouter();
const form = ref({ nickname: '', nationality: '', currency: 'USD' });

const countryToCurrency = { 'TW': 'TWD', 'US': 'USD', 'JP': 'JPY', 'KR': 'KRW' };

onMounted(() => {
  if (auth.currentUser) {
    form.value.nickname = auth.currentUser.displayName;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const detectedCountryCode = 'TW'; 
        form.value.nationality = detectedCountryCode;
        if(countryToCurrency[detectedCountryCode]) {
          form.value.currency = countryToCurrency[detectedCountryCode];
        }
      });
    }
  }
});

// 修改開頭: 儲存 Profile 後檢查 Invite
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