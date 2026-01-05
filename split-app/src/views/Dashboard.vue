<template>
  <div class="pb-24">
    <div 
      @click="openProfileModal"
      class="bg-dark-800 text-white p-8 rounded-b-3xl shadow-xl mb-6 relative overflow-hidden cursor-pointer hover:bg-dark-900 transition-colors group-header"
    >
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-gold-500 rounded-full blur-3xl opacity-20"></div>
      
      <div class="relative z-10 flex justify-between items-start">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-light tracking-wide">
  {{ profile?.nickname || user?.displayName }}
</h1>
            <span class="opacity-0 group-header-hover:opacity-100 transition-opacity text-xs text-gold-400 border border-gold-400 rounded-full px-2 py-0.5">Edit Profile</span>
          </div>
          <p class="text-gray-400 text-sm mt-1 font-mono">{{ user?.email }}</p>
          <div class="mt-4 inline-flex items-center px-3 py-1 border border-gold-500/30 rounded-full text-xs text-gold-400 bg-gold-500/10">
            Default: {{ profile?.currency }}
          </div>
        </div>
        <button @click.stop="handleInviteClick" class="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 border border-gold-500 hover:bg-gold-500 hover:text-dark-900 transition-all px-4 py-2 rounded-full cursor-pointer z-20">
          <span>Invite</span>
        </button>
      </div>
    </div>
    <div class="px-6 mb-8">
      <div class="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
        <div class="select-none cursor-pointer"
             @mousedown="startRateLongPress" @touchstart="startRateLongPress"
             @mouseup="cancelRateLongPress" @touchend="cancelRateLongPress" @mouseleave="cancelRateLongPress">
          <h3 class="text-lg font-medium text-dark-800">Exchange Rates</h3>
          <p class="text-xs text-gray-400 mt-1">
            Base: <span class="text-gold-500 font-bold border-b border-dotted border-gold-500">{{ baseAmount }} {{ currentBase }}</span>
            <span class="text-[10px] text-gray-300 ml-1">(Long press to change)</span>
          </p>
        </div>
        <router-link to="/rates" class="text-xs text-gold-600 hover:underline">View All</router-link>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div v-for="curr in previewTargets" :key="curr" 
             class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
          <span class="text-[10px] text-gray-400 tracking-wider font-bold mb-1">{{ curr }}</span>
          <span class="text-xl font-light text-dark-800"> 
            {{ (baseAmount * store.getExchangeRate(currentBase, curr)).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <div class="px-6">
      <h3 class="text-lg font-medium text-dark-800 mb-4 border-b border-gray-200 pb-2">My Groups</h3>
      
      <div v-if="groups.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        <p>No active groups</p>
      </div>

      <transition-group name="list" tag="div" class="space-y-4">
        <div v-for="group in groups" :key="group.id" 
             @click="handleGroupClick(group.id)"
             @mousedown="startGroupLongPress(group)" @touchstart="startGroupLongPress(group)"
             @mouseup="cancelGroupLongPress" @touchend="cancelGroupLongPress" @mouseleave="cancelGroupLongPress"
             class="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-gold-400 transition-all relative overflow-hidden select-none">
          
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium text-lg text-dark-900">{{ group.name }}</h4>
              <p class="text-xs text-gray-400 mt-2 flex items-center gap-3">
                <span class="flex items-center gap-1"><span class="text-gold-500">📍</span> {{ group.location }}</span>
                <span class="w-px h-3 bg-gray-200"></span>
                <span class="flex items-center gap-1"><span class="text-gold-500 font-bold">$</span> {{ group.currency }}</span>
              </p>
            </div>
            <div class="flex flex-col items-center gap-1">
               <div class="h-8 w-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                 {{ group.members.length }}
               </div>
               <span class="text-[10px] text-gray-400 uppercase">Users</span>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
    
    <button @click="openCreateModal" class="fixed bottom-8 right-8 bg-dark-800 text-gold-400 w-16 h-16 rounded-full shadow-2xl shadow-dark-800/40 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-transform duration-300 z-40 border border-gold-500/20">
      +
    </button>

    <transition name="modal">
      <div v-if="showGroupFormModal" class="fixed inset-0 bg-dark-900/60 backdrop-blur-sm flex items-center justify-center z-50">
        <transition name="modal-content" appear>
          <div class="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative m-4">
            <h3 class="text-2xl font-light mb-6 text-center text-dark-800">{{ isEditing ? 'Edit Group' : 'New Group' }}</h3>
            <div class="space-y-5">
              <div>
                <label class="block text-xs uppercase text-gray-400 tracking-wider mb-1">Name</label>
                <input v-model="groupForm.name" class="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent placeholder-gray-300" placeholder="Trip Title">
              </div>
              <div>
                <label class="block text-xs uppercase text-gray-400 tracking-wider mb-1">Currency</label>
                <select v-model="groupForm.currency" :disabled="isEditing" class="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-gold-500 disabled:text-gray-400">
                  <option value="TWD">TWD</option><option value="USD">USD</option><option value="JPY">JPY</option>
                </select>
              </div>
              <div>
                 <label class="block text-xs uppercase text-gray-400 tracking-wider mb-1">Location</label>
                 <div class="flex items-center">
                    <input v-model="groupForm.location" class="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold-500 transition-colors bg-transparent" placeholder="City, Country">
                    <button @click="detectLocation" class="text-gold-500 hover:text-gold-600 ml-2">◎</button>
                 </div>
              </div>
            </div>
            <div class="flex justify-end gap-4 mt-8">
              <button @click="showGroupFormModal = false" class="text-gray-400 hover:text-dark-800 text-sm transition-colors">Cancel</button>
              <button @click="saveGroup" class="bg-dark-800 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-black transition-all text-sm tracking-wide">
                {{ isEditing ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showInviteModal" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <transition name="modal-content" appear>
           <div class="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
             <div class="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 class="font-bold text-dark-800">Invite to...</h3>
               <button @click="showInviteModal = false" class="text-gray-400">✕</button>
             </div>
             <div class="max-h-[60vh] overflow-y-auto p-2">
               <div v-for="g in groups" :key="g.id" 
                    @click="copyGroupInvite(g)"
                    class="p-4 rounded-xl hover:bg-gold-50 cursor-pointer flex justify-between items-center transition-colors">
                  <span class="font-medium text-dark-900">{{ g.name }}</span>
                  <span class="text-xs text-gold-500 border border-gold-200 px-2 py-1 rounded-full">Copy Link</span>
               </div>
             </div>
           </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showActionModal" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
        <transition name="modal-content" appear>
          <div class="bg-white w-full max-w-xs rounded-2xl shadow-xl p-6 text-center">
             <h3 class="text-xl font-light mb-2 text-dark-800">{{ selectedGroup?.name }}</h3>
             
             <div v-if="selectedGroup?.ownerId === user?.uid" class="space-y-3 mt-6">
               <button @click="openEditGroup" class="w-full py-3 bg-gray-50 hover:bg-gold-50 text-dark-800 rounded-xl transition-colors font-medium">
                 Edit Group
               </button>
               <button @click="handleDeleteGroup" class="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors font-medium">
                 Delete Group
               </button>
             </div>

             <div v-else class="mt-4">
               <p class="text-xs uppercase text-gray-400 tracking-widest mb-2">Created By</p>
               <div class="flex flex-col items-center gap-2">
                  <div class="w-16 h-16 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center text-2xl font-bold">
                    {{ creatorName ? creatorName[0].toUpperCase() : '?' }}
                  </div>
                  <span class="text-lg font-medium text-dark-900">{{ creatorName || 'Loading...' }}</span>
               </div>
               <button @click="handleLeaveGroup" class="w-full mt-6 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors font-medium">
                 Leave Group
               </button>
               </div>

             <button @click="showActionModal = false" class="mt-6 text-gray-400 text-sm hover:text-dark-800">Close</button>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showCurrencySelector" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <transition name="modal-content" appear>
          <div class="bg-white w-full max-w-md h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <div class="p-5 border-b border-gray-100 bg-white z-10">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-dark-800">Select Base Currency</h3>
                <button @click="showCurrencySelector = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">✕</button>
              </div>
              <input v-model="searchQuery" placeholder="Search..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors">
            </div>
            <div class="flex-1 overflow-y-auto p-2 no-scrollbar">
              <div v-for="curr in filteredCurrencies" :key="curr"
                   @click="selectBase(curr)"
                   class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                   :class="{'bg-gold-50 border border-gold-200': currentBase === curr}">
                <div class="flex items-center gap-3">
                   <span class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{{ curr[0] }}</span>
                   <span class="font-bold text-dark-800">{{ curr }}</span>
                </div>
                <span v-if="currentBase === curr" class="text-gold-500 text-xs font-bold">Active</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showProfileModal" class="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <transition name="modal-content" appear>
          <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div class="bg-dark-800 p-6 pt-10 pb-12 relative text-white text-center">
              <button @click="showProfileModal = false" class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">✕</button>
              <div class="absolute -top-10 -left-10 w-32 h-32 bg-gold-500 rounded-full blur-3xl opacity-30"></div>
              
              <div class="relative z-10">
                <h2 class="text-2xl font-light tracking-wide">{{ user?.displayName }}</h2>
                <p class="text-gold-400/80 text-sm mt-1 font-mono">{{ user?.email }}</p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6 -mt-6 bg-white rounded-t-3xl relative z-20">
              
              <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-[10px] uppercase tracking-widest text-gray-400">Bank Account</span>
                  <button @click="toggleAccountVisibility" class="text-gold-500 hover:text-gold-600 transition-colors">
                     {{ showAccountFull ? '👁️‍🗨️' : '👁️' }}
                  </button>
                </div>
                
                <div v-if="profile?.bankAccount">
                   <div class="font-medium text-dark-800 text-sm mb-1">{{ profile?.bankName || 'Bank Name Not Set' }}</div>
                   <div class="font-mono text-lg text-dark-600 tracking-wider">
                     {{ showAccountFull ? profile?.bankAccount : maskedAccount }}
                   </div>
                </div>
                <div v-else class="text-center py-2">
                  <span class="text-xs text-gray-400 italic">No bank info set.</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                 <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col">
                    <label class="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Currency</label>
                    <select :value="profile?.currency" @change="updateCurrency($event.target.value)" 
                            class="bg-transparent border-b border-gold-200 py-1 font-bold text-dark-800 focus:outline-none focus:border-gold-500">
                      <option v-for="c in ['TWD','USD','JPY','EUR','KRW']" :key="c" :value="c">{{ c }}</option>
                    </select>
                 </div>

                 <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col relative">
                    <label class="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Location</label>
                    <div class="flex items-center justify-between">
                       <span class="font-bold text-dark-800 truncate pr-2">{{ profile?.nationality || 'Unknown' }}</span>
                       <button @click="updateLocation" :disabled="isUpdatingLocation" 
                               class="text-gold-500 hover:text-gold-600 disabled:opacity-50 p-1">
                          <span v-if="isUpdatingLocation" class="animate-spin inline-block">↻</span>
                          <span v-else>📍</span>
                       </button>
                    </div>
                 </div>
              </div>

              <div>
                <h3 class="text-xs uppercase tracking-widest text-gray-400 mb-3">Your Groups</h3>
                <div v-if="groups.length === 0" class="text-center py-4 text-gray-300 text-xs italic">
                  No groups joined yet.
                </div>
                <div class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                   <div v-for="g in groups" :key="g.id" class="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gold-200 transition-colors">
                      <div class="flex flex-col">
                        <span class="font-medium text-dark-800 text-sm">{{ g.name }}</span>
                        <span class="text-[10px] text-gray-400">{{ g.currency }}</span>
                      </div>
                      <span class="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold tracking-wide">
                        Unsettled
                      </span>
                   </div>
                </div>
              </div>

              <div class="pt-4 grid grid-cols-2 gap-4">
                 <button @click="goToEditProfile" class="py-3 rounded-xl bg-gray-100 text-dark-600 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <span>✎ Edit</span>
                 </button>
                 <button @click="handleLogout" class="py-3 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <span>Logout ➔</span>
                 </button>
              </div>
              
            </div>
          </div>
        </transition>
      </div>
    </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import { signOut } from "firebase/auth";
// 修改開頭: 引入 writeBatch 進行批次操作
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
// 修改結尾
import { useMainStore } from './main';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const ALL_CURRENCIES = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", 
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", 
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", 
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", 
  "ERN", "ETB", "EUR", "FJD", "FKP", "FOK", "GBP", "GEL", "GGP", "GHS", 
  "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", 
  "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", 
  "JPY", "KES", "KGS", "KHR", "KID", "KMF", "KRW", "KWD", "KYD", "KZT", 
  "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", 
  "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", 
  "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", 
  "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", 
  "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", 
  "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", 
  "TVD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", 
  "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"
];

const store = useMainStore();
const router = useRouter();
const user = auth.currentUser;
const profile = computed(() => store.userProfile);
const groups = ref([]);

// Modals State
const showGroupFormModal = ref(false);
const showInviteModal = ref(false);
const showActionModal = ref(false);

// Profile Modal 相關狀態
const showProfileModal = ref(false);
const showAccountFull = ref(false);
const isUpdatingLocation = ref(false);

// Form / Selection State
const groupForm = ref({ name: '', currency: 'TWD', location: '' });
const isEditing = ref(false);
const selectedGroup = ref(null);
const creatorName = ref('');

// Rate State
const baseAmount = ref(100);
const customBase = ref(null);
const showCurrencySelector = ref(false);
const searchQuery = ref('');
const previewTargets = ref(['USD', 'JPY', 'KRW', 'EUR']); 

const currentBase = computed(() => customBase.value || profile.value?.currency || 'USD');
const filteredCurrencies = computed(() => {
  if (!searchQuery.value) return ALL_CURRENCIES;
  return ALL_CURRENCIES.filter(c => c.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// Long Press Variables
let ratePressTimer = null;
let groupPressTimer = null;
const groupPressTriggered = ref(false);

// 銀行帳號遮罩計算與 Profile 邏輯
const maskedAccount = computed(() => {
  const acc = profile.value?.bankAccount;
  if (!acc) return '';
  if (acc.length <= 4) return '****';
  return '**** - ' + acc.slice(-4);
});

const openProfileModal = () => {
  showProfileModal.value = true;
  showAccountFull.value = false; // Reset to hidden
};

const toggleAccountVisibility = () => {
  showAccountFull.value = !showAccountFull.value;
};

const updateCurrency = async (newCurrency) => {
  if (!user) return;
  await store.updateUserProfile(user.uid, { currency: newCurrency });
};

const updateLocation = () => {
  if (!navigator.geolocation) {
    alert("您的瀏覽器不支援地理定位功能");
    return;
  }

  isUpdatingLocation.value = true;

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (!response.ok) throw new Error("Location service unavailable");

        const data = await response.json();
        const city = data.city || data.locality || data.principalSubdivision || "";
        const country = data.countryName || "";
        const locationString = city && country ? `${city}, ${country}` : (city || country || "Unknown Location");

        await store.updateUserProfile(user.uid, { nationality: locationString });
        
      } catch (err) {
        console.error("Reverse Geocoding Error:", err);
        alert("無法轉換座標為地址，請稍後再試");
      } finally {
        isUpdatingLocation.value = false;
      }
    },
    (error) => {
      console.error("Geolocation Error:", error);
      alert("無法取得您的位置");
      isUpdatingLocation.value = false;
    },
    options
  );
};

const goToEditProfile = () => {
  showProfileModal.value = false;
  router.push('/onboarding');
};

const handleLogout = async () => {
  if (confirm("Are you sure you want to log out?")) {
    await signOut(auth);
    router.push('/');
  }
};

onMounted(async () => {
  if (user) {
    if(!store.userProfile) await store.fetchUserProfile(user.uid);
    await store.fetchRates();
    
    const savedTargets = localStorage.getItem('calc_targets');
    if (savedTargets) {
      const parsed = JSON.parse(savedTargets);
      if (parsed && parsed.length > 0) previewTargets.value = parsed.slice(0, 4);
    }

    await fetchGroups();
  }
});

const fetchGroups = async () => {
    const q = query(collection(db, "groups"), where("members", "array-contains", user.uid));
    const querySnapshot = await getDocs(q);
    groups.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Invite Logic ---
const handleInviteClick = () => {
  if (groups.value.length === 0) {
     const url = window.location.origin;
     navigator.clipboard.writeText(url);
     alert("Link Copied! Since you have no groups, this is a general app invite.");
  } else {
     showInviteModal.value = true;
  }
};

const copyGroupInvite = (group) => {
   const url = `${window.location.origin}/?invite=${group.id}`;
   navigator.clipboard.writeText(url);
   showInviteModal.value = false;
   alert(`Invite link for "${group.name}" copied!`);
};

// --- Group Interaction Logic ---
const handleGroupClick = (groupId) => {
  if (groupPressTriggered.value) return; 
  router.push(`/group/${groupId}`);
};

const startGroupLongPress = (group) => {
  groupPressTriggered.value = false;
  groupPressTimer = setTimeout(async () => {
    groupPressTriggered.value = true;
    if (navigator.vibrate) navigator.vibrate(50);
    
    selectedGroup.value = group;
    creatorName.value = ''; 
    
    if (group.ownerId !== user.uid) {
       try {
         const uSnap = await getDoc(doc(db, "users", group.ownerId));
         if (uSnap.exists()) creatorName.value = uSnap.data().nickname || 'Unknown';
         else creatorName.value = 'Unknown';
       } catch (e) {
         creatorName.value = 'Error fetching name';
       }
    }
    
    showActionModal.value = true;
  }, 600);
};

const cancelGroupLongPress = () => {
  if (groupPressTimer) {
    clearTimeout(groupPressTimer);
    groupPressTimer = null;
  }
};

// --- CRUD Logic ---
const openCreateModal = () => {
  isEditing.value = false;
  groupForm.value = { name: '', currency: profile.value?.currency || 'TWD', location: '' };
  showGroupFormModal.value = true;
};

const openEditGroup = () => {
  showActionModal.value = false;
  isEditing.value = true;
  groupForm.value = { ...selectedGroup.value };
  showGroupFormModal.value = true;
};

const detectLocation = () => {
  if (!navigator.geolocation) {
    alert("您的瀏覽器不支援地理定位");
    return;
  }

  const originalText = groupForm.value.location;
  groupForm.value.location = "Locating...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (!response.ok) throw new Error("Location API Error");

        const data = await response.json();
        
        const city = data.city || data.locality || data.principalSubdivision || "";
        const country = data.countryName || "";
        const locationString = city && country ? `${city}, ${country}` : (city || country || "Unknown");

        groupForm.value.location = locationString;

        if (!isEditing.value && data.countryCode) {
           const code = data.countryCode.toUpperCase();
           if (code === 'TW') groupForm.value.currency = 'TWD';
           else if (code === 'JP') groupForm.value.currency = 'JPY';
           else if (code === 'US') groupForm.value.currency = 'USD';
           else if (code === 'KR') groupForm.value.currency = 'KRW';
           else if (['EU', 'DE', 'FR', 'IT', 'ES'].includes(code)) groupForm.value.currency = 'EUR';
        }

      } catch (e) {
        console.error(e);
        alert("無法取得地址，請手動輸入");
        groupForm.value.location = ""; 
      }
    },
    (err) => {
      console.error(err);
      alert("無法取得位置權限");
      groupForm.value.location = "";
    },
    { timeout: 5000 }
  );
};

const saveGroup = async () => {
  if (isEditing.value && selectedGroup.value) {
     await updateDoc(doc(db, "groups", selectedGroup.value.id), {
        name: groupForm.value.name,
        location: groupForm.value.location
     });
  } else {
     await addDoc(collection(db, "groups"), {
        ...groupForm.value,
        members: [user.uid],
        ownerId: user.uid,
        inviteCode: uuidv4().slice(0, 6)
     });
  }
  await fetchGroups(); 
  showGroupFormModal.value = false;
  selectedGroup.value = null;
};

// 修改開頭: 包含刪除與退出群組的完整邏輯
const handleDeleteGroup = async () => {
  if (!selectedGroup.value) return;
  
  if (confirm(`Are you sure you want to delete "${selectedGroup.value.name}"? This will remove all group expenses permanently.`)) {
     try {
       const batch = writeBatch(db);
       
       // 1. Delete all expenses in this group (Cleanup)
       const expensesQ = query(collection(db, "expenses"), where("groupId", "==", selectedGroup.value.id));
       const expensesSnap = await getDocs(expensesQ);
       expensesSnap.forEach((doc) => {
         batch.delete(doc.ref);
       });

       // 2. Delete the group itself
       const groupRef = doc(db, "groups", selectedGroup.value.id);
       batch.delete(groupRef);

       await batch.commit();
       
       await fetchGroups();
       showActionModal.value = false;
     } catch (err) {
       console.error("Error deleting group:", err);
       alert("Failed to delete group.");
     }
  }
};

const handleLeaveGroup = async () => {
  if (!selectedGroup.value || !user) return;
  
  if (confirm(`Are you sure you want to leave "${selectedGroup.value.name}"?`)) {
    try {
      const groupRef = doc(db, "groups", selectedGroup.value.id);
      // Remove current user from members array
      const newMembers = selectedGroup.value.members.filter(uid => uid !== user.uid);
      
      await updateDoc(groupRef, {
        members: newMembers
      });
      
      await fetchGroups();
      showActionModal.value = false;
    } catch (err) {
       console.error("Error leaving group:", err);
       alert("Failed to leave group.");
    }
  }
};
// 修改結尾

// --- Rate Long Press Logic ---
const startRateLongPress = () => {
  ratePressTimer = setTimeout(() => {
    showCurrencySelector.value = true;
    if (navigator.vibrate) navigator.vibrate(50);
  }, 800);
};

const cancelRateLongPress = () => {
  if (ratePressTimer) {
    clearTimeout(ratePressTimer);
    ratePressTimer = null;
  }
};

const selectBase = (curr) => {
  customBase.value = curr;
  showCurrencySelector.value = false;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.group-header:hover .group-header-hover\:opacity-100 {
  opacity: 1;
}
</style>
