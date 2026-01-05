<template>
  <div class="pb-24">
    <div class="bg-dark-800 text-white p-8 rounded-b-3xl shadow-xl mb-6 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-gold-500 rounded-full blur-3xl opacity-20"></div>
      
      <div class="relative z-10 flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-light tracking-wide">{{ user?.displayName }}</h1>
          <p class="text-gray-400 text-sm mt-1 font-mono">{{ user?.email }}</p>
          <div class="mt-4 inline-flex items-center px-3 py-1 border border-gold-500/30 rounded-full text-xs text-gold-400 bg-gold-500/10">
            Default: {{ profile?.currency }}
          </div>
        </div>
        <button @click="handleInviteClick" class="group flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 border border-gold-500 hover:bg-gold-500 hover:text-dark-900 transition-all px-4 py-2 rounded-full cursor-pointer">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
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
     // No groups, copy generic link
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
  if (groupPressTriggered.value) return; // Prevent click if long press triggered
  router.push(`/group/${groupId}`);
};

const startGroupLongPress = (group) => {
  groupPressTriggered.value = false;
  groupPressTimer = setTimeout(async () => {
    groupPressTriggered.value = true;
    if (navigator.vibrate) navigator.vibrate(50);
    
    selectedGroup.value = group;
    creatorName.value = ''; // Reset
    
    // If not owner, fetch creator name
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
  groupForm.value.location = "Kyoto, Japan"; 
  if(!isEditing.value) groupForm.value.currency = "JPY"; 
};

const saveGroup = async () => {
  if (isEditing.value && selectedGroup.value) {
     // Update
     await updateDoc(doc(db, "groups", selectedGroup.value.id), {
        name: groupForm.value.name,
        location: groupForm.value.location
     });
  } else {
     // Create
     await addDoc(collection(db, "groups"), {
        ...groupForm.value,
        members: [user.uid],
        ownerId: user.uid,
        inviteCode: uuidv4().slice(0, 6)
     });
  }
  await fetchGroups(); // Refresh list
  showGroupFormModal.value = false;
  selectedGroup.value = null;
};

const handleDeleteGroup = async () => {
  if (confirm(`Are you sure you want to delete "${selectedGroup.value.name}"?`)) {
     await deleteDoc(doc(db, "groups", selectedGroup.value.id));
     await fetchGroups();
     showActionModal.value = false;
  }
};

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
