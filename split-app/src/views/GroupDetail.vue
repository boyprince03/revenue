<template>
  <div class="min-h-screen bg-dark-100 pb-24 relative">
    <div class="bg-dark-800 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl z-10 relative">
      <div class="flex justify-between items-start mb-4">
         <button @click="$router.back()" class="text-white/60 hover:text-gold-400 transition-colors">← Back</button>
         <button @click="copyInviteLink" class="flex items-center gap-1 text-gold-400 hover:text-white transition-colors text-xs uppercase tracking-wider border border-gold-500/50 px-3 py-1 rounded-full">
            <span>Link</span> 🔗
         </button>
      </div>
      
      <div class="text-center -mt-2 mb-6"> 
        <h1 class="text-2xl font-light tracking-wide">{{ group?.name }}</h1>
        <p class="text-gold-500 font-mono text-xs mt-1">{{ group?.currency }}</p>
      </div>
      
      <div class="flex overflow-x-auto gap-4 py-2 no-scrollbar mt-4 justify-center"> 
        <div v-for="m in members" :key="m.uid" 
             @click="selectedMember = m.uid"
             class="flex flex-col items-center gap-2 cursor-pointer transition-all duration-300"
             :class="selectedMember === m.uid ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'">
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg transition-colors', 
                        selectedMember === m.uid ? 'bg-gold-500 text-dark-900 border-white' : 'bg-dark-700 text-gray-300 border-transparent']">
            {{ m.nickname ? m.nickname[0].toUpperCase() : 'U' }}
          </div>
          <span class="text-[10px] tracking-wider uppercase">{{ m.nickname || 'User' }}</span>
        </div>
      </div>
    </div>

    <div class="px-5 -mt-6 relative z-20">
      <div class="flex justify-between items-end mb-4 px-2">
         <h3 class="text-xs uppercase tracking-widest text-gray-400">Transactions</h3>
      </div>

      <transition-group name="list" tag="div" class="space-y-3">
        <div v-for="exp in filteredExpenses" :key="exp.id" 
             class="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-gold-200 transition-colors flex justify-between items-center group relative overflow-hidden">
          
          <div v-if="exp.type === 'settlement'" class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>

          <div class="flex items-center gap-4">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-lg', exp.type === 'settlement' ? 'bg-green-50 text-green-600' : 'bg-gray-50']">
               {{ exp.type === 'settlement' ? '💸' : '🧾' }}
            </div>
            <div>
              <span class="block font-medium text-dark-800">{{ exp.name }}</span>
              <span class="text-[10px] text-gray-400 uppercase tracking-wide">
                {{ exp.type === 'settlement' ? 'Transfer to' : 'Paid by' }} 
                {{ exp.type === 'settlement' && exp.splitWith?.[0] ? getMemberName(exp.splitWith[0]) : getMemberName(exp.payerId) }}
              </span>
            </div>
          </div>
          
          <div class="text-right">
             <span class="block font-bold" :class="exp.type === 'settlement' ? 'text-green-600' : 'text-dark-900'">
               {{ group?.currency }} {{ exp.settlementAmount }}
             </span>
             <span class="text-[10px] text-gray-400 font-mono">Original: {{ exp.currency }} {{ exp.amount }}</span>
          </div>

          <div v-if="exp.payerId === currentUser.uid" class="absolute right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button @click.stop="deleteExpense(exp.id)" class="bg-red-50 text-red-500 p-1.5 rounded-full shadow-sm text-xs">✕</button>
             <button @click.stop="editExpense(exp)" class="bg-blue-50 text-blue-500 p-1.5 rounded-full shadow-sm text-xs">✎</button>
          </div>
        </div>
      </transition-group>
    </div>
    
    <transition name="modal">
      <button v-if="selectedMember === currentUser?.uid" 
              @click="openAddModal"
              class="fixed bottom-8 right-8 bg-dark-800 text-gold-400 w-14 h-14 rounded-full shadow-2xl shadow-dark-800/40 flex items-center justify-center text-2xl hover:bg-black hover:scale-110 transition-all z-40 border border-gold-500/30">
        +
      </button>
    </transition>
    
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <transition name="modal-content" appear>
          <div v-if="showModal" class="bg-white p-6 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl relative">
             <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
             
             <div class="flex mb-6 border-b border-gray-100">
               <button @click="activeTab = 'expense'" 
                       :class="['flex-1 pb-3 text-sm font-medium transition-colors relative', activeTab === 'expense' ? 'text-gold-600' : 'text-gray-400']">
                 New Expense
                 <div v-if="activeTab === 'expense'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-t-full"></div>
               </button>
               <button @click="activeTab = 'settlement'" 
                       :class="['flex-1 pb-3 text-sm font-medium transition-colors relative', activeTab === 'settlement' ? 'text-green-600' : 'text-gray-400']">
                 Settlement
                 <div v-if="activeTab === 'settlement'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t-full"></div>
               </button>
             </div>

             <div class="space-y-6">
                <div class="relative">
                 <div class="flex items-baseline justify-center gap-2 border-b-2 focus-within:border-opacity-100 transition-colors pb-2"
                      :class="activeTab === 'expense' ? 'border-gold-100 focus-within:border-gold-500' : 'border-green-100 focus-within:border-green-500'">
                    <span class="text-gray-400 text-lg">{{ form.currency }}</span>
                    <input v-model.number="form.amount" type="number" placeholder="0" 
                           class="text-4xl font-light text-center w-1/2 focus:outline-none placeholder-gray-200 text-dark-900">
                 </div>
                 <div class="flex justify-center gap-4 mt-2">
                    <span v-for="curr in ['TWD', 'JPY', 'USD']" :key="curr" 
                          @click="form.currency = curr"
                          :class="['text-xs px-2 py-1 rounded cursor-pointer transition-colors', 
                                   form.currency === curr ? (activeTab === 'expense' ? 'bg-gold-500 text-white' : 'bg-green-500 text-white') : 'text-gray-400 hover:text-gray-600']">
                      {{ curr }}
                    </span>
                 </div>
              </div>

              <div v-if="activeTab === 'expense'" class="space-y-6">
                <div>
                  <input v-model="form.name" placeholder="What is this for?" class="w-full text-center border-b border-gray-200 py-2 focus:outline-none focus:border-gold-500 transition-colors mb-3">
                  
                  <div class="flex justify-center flex-wrap gap-2 relative">
                    <span v-for="tag in visibleTags" :key="tag" @click="form.name = tag" 
                          class="px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-500 cursor-pointer hover:bg-gold-50 hover:text-gold-600 transition-colors border border-transparent hover:border-gold-200">
                      {{ tag }}
                    </span>

                    <div v-if="hiddenTags.length > 0" class="relative">
                      <span @click.stop="showTagMenu = !showTagMenu" 
                            class="px-3 py-1 bg-gray-50 rounded-full text-xs text-gold-600 cursor-pointer hover:bg-gold-50 border border-transparent border-gold-200 font-medium">
                        More...
                      </span>
                      <div v-if="showTagMenu" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 grid grid-cols-1 gap-1">
                         <span v-for="tag in hiddenTags" :key="tag" @click="selectTag(tag)" 
                               class="px-3 py-2 text-xs text-gray-600 hover:bg-gold-50 hover:text-gold-700 rounded-lg cursor-pointer text-center">
                           {{ tag }}
                         </span>
                      </div>
                    </div>

                    <span @click="startAddTag" 
                          class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-400 cursor-pointer hover:bg-gray-200 transition-colors w-6 h-6 flex items-center justify-center">
                      +
                    </span>
                  </div>

                  <div v-if="isAddingTag" class="mt-2 flex justify-center">
                     <input v-model="newTagInput" ref="tagInputRef"
                            @keyup.enter="addNewTag" @blur="addNewTag"
                            placeholder="New tag name" 
                            class="text-xs text-center border-b border-gold-300 focus:outline-none py-1 w-32 bg-transparent">
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-xl">
                  <p class="text-xs uppercase tracking-widest text-gray-400 mb-3">Split with</p>
                  <div class="flex flex-wrap gap-2">
                    <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                           :class="form.splitWith.length === 0 ? 'bg-dark-800 text-gold-400 border-dark-800' : 'bg-white border-gray-200 text-gray-500'">
                      <input type="checkbox" :checked="form.splitWith.length === 0" @change="toggleAll" class="hidden"> All
                    </label>
                    <label v-for="m in members" :key="m.uid" 
                           class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                           :class="form.splitWith.includes(m.uid) ? 'bg-dark-800 text-white border-dark-800' : 'bg-white border-gray-200 text-gray-500'">
                      <input type="checkbox" :value="m.uid" v-model="form.splitWith" class="hidden"> {{ m.nickname }}
                    </label>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-6">
                 <div class="bg-green-50 p-5 rounded-xl text-center">
                    <p class="text-xs uppercase tracking-widest text-green-600 mb-4">Pay to</p>
                    <div class="flex flex-wrap justify-center gap-3">
                      <div v-for="m in otherMembers" :key="m.uid" 
                           @click="transferTarget = m.uid"
                           class="flex flex-col items-center gap-2 cursor-pointer p-2 rounded-xl transition-all border-2"
                           :class="transferTarget === m.uid ? 'border-green-500 bg-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'">
                         <div class="w-10 h-10 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold">
                            {{ m.nickname[0] }}
                         </div>
                         <span class="text-xs font-medium">{{ m.nickname }}</span>
                      </div>
                    </div>
                    <p v-if="otherMembers.length === 0" class="text-sm text-gray-400 py-2">No other members to pay.</p>
                 </div>
              </div>

            </div>

            <div class="grid grid-cols-2 gap-4 mt-8">
              <button @click="showModal = false" class="py-3 text-gray-500 hover:text-dark-900 transition-colors">Cancel</button>
              <button @click="saveExpense" 
                      :class="activeTab === 'expense' ? 'bg-gold-500 hover:bg-gold-600 shadow-gold-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'"
                      class="py-3 text-white rounded-xl shadow-lg transition-all font-medium">
                 {{ activeTab === 'expense' ? 'Save Expense' : 'Confirm Pay' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { useMainStore } from './main';

const store = useMainStore();
const route = useRoute();
const groupId = route.params.id;
const currentUser = auth.currentUser;
const group = ref(null);
const members = ref([]); 
const expenses = ref([]);
const selectedMember = ref(currentUser?.uid);

// Modal & Form State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('expense'); // 'expense' | 'settlement'
const form = ref({ name: '', amount: '', currency: 'TWD', splitWith: [] });
const transferTarget = ref(null);

// Tag System State
const quickTags = ref(['Food', 'Transport', 'Hotel', 'Ticket']); // Initial default
const showTagMenu = ref(false);
const isAddingTag = ref(false);
const newTagInput = ref('');
const tagInputRef = ref(null);

const copyInviteLink = () => {
  const url = `${window.location.origin}/?invite=${groupId}`;
  navigator.clipboard.writeText(url);
  alert('Invite Link Copied!\nShare this link to invite members.');
};

onMounted(async () => {
  await store.fetchRates();
  
  // Load saved tags from localStorage
  const savedTags = localStorage.getItem('user_quick_tags');
  if (savedTags) {
     quickTags.value = JSON.parse(savedTags);
  }

  const groupRef = doc(db, "groups", groupId);
  onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        group.value = docSnap.data();
        if(!form.value.currency) form.value.currency = group.value.currency;
        updateMembersList(docSnap.data().members);
      }
  });

  const q = query(collection(db, "expenses"), where("groupId", "==", groupId));
  onSnapshot(q, (snapshot) => {
    expenses.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt);
  });
});

const updateMembersList = async (memberIds) => {
  const promises = memberIds.map(async (uid) => {
      const userSnap = await getDoc(doc(db, "users", uid));
      const nickname = userSnap.exists() ? userSnap.data().nickname : 'Unknown';
      return { uid, nickname: uid === currentUser.uid ? 'Me' : nickname };
  });
  members.value = await Promise.all(promises);
};

const filteredExpenses = computed(() => {
  if (!selectedMember.value) return expenses.value;
  return expenses.value.filter(e => e.payerId === selectedMember.value);
});

const getMemberName = (uid) => members.value.find(m => m.uid === uid)?.nickname || 'Unknown';
const otherMembers = computed(() => members.value.filter(m => m.uid !== currentUser.uid));

const convertedAmount = computed(() => {
  if (!form.value.amount || !group.value) return "0.00";
  const rate = store.getExchangeRate(form.value.currency, group.value.currency);
  return (form.value.amount * rate).toFixed(2);
});

// --- Tag Logic ---
const visibleTags = computed(() => quickTags.value.slice(0, 5));
const hiddenTags = computed(() => quickTags.value.slice(5));

const selectTag = (tag) => {
  form.value.name = tag;
  showTagMenu.value = false;
};

const startAddTag = () => {
  isAddingTag.value = true;
  nextTick(() => tagInputRef.value?.focus());
};

const addNewTag = () => {
  const val = newTagInput.value.trim();
  if (val && !quickTags.value.includes(val)) {
     quickTags.value.push(val);
     form.value.name = val;
     // Save to persistence
     localStorage.setItem('user_quick_tags', JSON.stringify(quickTags.value));
  }
  newTagInput.value = '';
  isAddingTag.value = false;
};

// --- Form Logic ---
const toggleAll = () => { form.value.splitWith = []; };

const openAddModal = () => {
  isEditing.value = false;
  activeTab.value = 'expense';
  form.value = { name: '', amount: '', currency: group.value?.currency || 'TWD', splitWith: [] };
  transferTarget.value = null;
  showModal.value = true;
};

const editExpense = (exp) => {
  isEditing.value = true;
  editingId.value = exp.id;
  activeTab.value = exp.type === 'settlement' ? 'settlement' : 'expense';
  
  form.value = { ...exp };
  if(exp.type === 'settlement' && exp.splitWith?.length) {
     transferTarget.value = exp.splitWith[0];
  }
  showModal.value = true;
};

const saveExpense = async () => {
  if (!form.value.amount) return;
  if (activeTab.value === 'settlement' && !transferTarget.value) {
     alert("Please select who you are paying.");
     return;
  }

  const settlementAmt = parseFloat(convertedAmount.value);
  const isSettlement = activeTab.value === 'settlement';

  const payload = {
    groupId,
    payerId: currentUser.uid,
    name: isSettlement ? 'Settlement' : (form.value.name || 'Expense'),
    amount: form.value.amount,
    currency: form.value.currency,
    settlementAmount: settlementAmt,
    splitWith: isSettlement ? [transferTarget.value] : form.value.splitWith,
    type: isSettlement ? 'settlement' : 'expense',
    createdAt: serverTimestamp()
  };

  if (isEditing.value) {
    await updateDoc(doc(db, "expenses", editingId.value), payload);
  } else {
    await addDoc(collection(db, "expenses"), payload);
  }
  showModal.value = false;
};

const deleteExpense = async (id) => {
  if(confirm("Delete this transaction?")) {
    await deleteDoc(doc(db, "expenses", id));
  }
};
</script>