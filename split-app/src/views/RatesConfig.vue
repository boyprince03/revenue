<template>
  <div class="h-[100dvh] w-full bg-gray-50 flex flex-col relative overflow-hidden">
    
    <div class="flex-none bg-dark-100 z-30 shadow-md rounded-b-3xl">
      <div class="flex items-center justify-between p-4 pb-2">
        <button @click="$router.back()" class="text-gray-400 hover:text-dark-800 transition-colors flex items-center gap-1">
          <span class="text-lg">←</span> <span class="text-sm">Back</span>
        </button>
        <h1 class="text-lg font-medium text-dark-800">Currency Calc</h1>
        <button @click="showMobileHistory = true" class="text-gold-500 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="text-xl">🕒</span>
        </button>
      </div>

      <div class="px-6 pb-6 pt-2">
        <div class="flex justify-between items-end mb-2">
           <button @click="openCurrencyModal('base')" class="flex items-center gap-2 group">
             <span class="text-3xl font-bold text-gold-500">{{ baseCurrency }}</span>
             <span class="text-xs text-gray-500 group-hover:text-gold-400 transition-colors">▼</span>
           </button>
           <div class="text-xs text-gray-400 font-mono h-4">{{ currentExpression }}</div>
        </div>
        <div class="relative border-b border-gray-200 pb-1">
           <input 
             v-model="displayValue" 
             type="text" 
             inputmode="none" 
             readonly
             class="w-full text-5xl font-light text-dark-800 bg-transparent focus:outline-none text-right placeholder-gray-300"
             placeholder="0"
           >
        </div>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth no-scrollbar transition-all duration-300"
         :class="isKeypadOpen ? 'pb-[24rem]' : 'pb-24'" 
         ref="listContainer">
       
       <transition-group name="list-complete">
         <div v-for="(target, index) in targetCurrencies" :key="target" 
              :data-index="index"
              class="relative rounded-2xl mb-3 select-none touch-pan-y group"
         >
            <div class="absolute inset-0 bg-gold-500 rounded-2xl flex justify-end items-center pr-8 z-0">
               <span class="text-white font-bold tracking-widest text-sm uppercase">Change</span>
            </div>

            <div 
               class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative z-10 will-change-transform cursor-grab active:cursor-grabbing"
               :class="{
                  'z-20 scale-105 shadow-xl ring-2 ring-gold-400 opacity-90 pointer-events-none': isDragging && dragIndex === index,
                  'transition-transform duration-200 ease-out': !isDragging && (!isSwiping || swipeIndex !== index)
               }"
               :style="getCardStyle(index)"
               @click="handleCardClick(index)"
               
               @touchstart="handleInputStart($event, index, 'touch')"
               @touchmove="handleInputMove($event, 'touch')"
               @touchend="handleInputEnd"
               
               @mousedown="handleInputStart($event, index, 'mouse')"
            >
               <div class="flex items-center gap-3 pointer-events-none">
                 <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                   {{ target }}
                 </div>
                 <div class="flex flex-col">
                   <span class="text-xs text-gray-400 font-medium">{{ getCurrencyName(target) }}</span>
                   <span class="text-xl font-bold text-dark-800 tracking-tight leading-none">
                     {{ formatNumber(calculateRate(target)) }}
                   </span>
                 </div>
               </div>
               
               <div class="text-gray-200 text-lg opacity-50 pointer-events-none">≡</div>
            </div>
         </div>
       </transition-group>

      <button @click="openCurrencyModal('add_target')" class="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-gold-300 hover:text-gold-600 transition-colors flex items-center justify-center gap-2 font-medium bg-gray-50/50">
        <span class="text-lg">+</span> Add Currency
      </button>
    </div>

    <div class="absolute bottom-0 left-0 right-0 bg-white z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] rounded-t-3xl transition-transform duration-300 ease-in-out pb-[env(safe-area-inset-bottom)]"
         :class="isKeypadOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'">
      
      <div @click="isKeypadOpen = !isKeypadOpen" 
           class="w-full h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded-t-3xl touch-manipulation">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full transition-colors" :class="{'bg-gold-400': !isKeypadOpen}"></div>
      </div>
      
      <div class="grid grid-cols-4 gap-1 px-2 max-w-md mx-auto pb-4 transition-opacity duration-200"
           :class="isKeypadOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'">
        
        <button @click="clear" :class="[btnBase, 'text-red-400 hover:bg-gray-100']">AC</button>
        <button @click="deleteLast" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">⌫</button>
        <button @click="appendOperator('/')" :class="[btnBase, 'text-gold-600 bg-gold-50/50 hover:bg-gold-100']">÷</button>
        <button @click="appendOperator('*')" :class="[btnBase, 'text-gold-600 bg-gold-50/50 hover:bg-gold-100']">×</button>

        <button @click="appendNumber('7')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">7</button>
        <button @click="appendNumber('8')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">8</button>
        <button @click="appendNumber('9')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">9</button>
        <button @click="appendOperator('-')" :class="[btnBase, 'text-gold-600 bg-gold-50/50 hover:bg-gold-100']">-</button>

        <button @click="appendNumber('4')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">4</button>
        <button @click="appendNumber('5')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">5</button>
        <button @click="appendNumber('6')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">6</button>
        <button @click="appendOperator('+')" :class="[btnBase, 'text-gold-600 bg-gold-50/50 hover:bg-gold-100']">+</button>

        <div class="col-span-3 grid grid-cols-3 gap-1">
           <button @click="appendNumber('1')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">1</button>
           <button @click="appendNumber('2')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">2</button>
           <button @click="appendNumber('3')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">3</button>
           <button @click="appendNumber('0')" :class="[btnBase, 'col-span-2 text-dark-800 hover:bg-gray-100']">0</button>
           <button @click="appendNumber('.')" :class="[btnBase, 'text-dark-800 hover:bg-gray-100']">.</button>
        </div>
        
        <button @click="calculate" class="h-full rounded-2xl bg-gold-500 text-white text-2xl shadow-lg shadow-gold-200 active:bg-gold-600 active:scale-95 transition-all flex items-center justify-center">
          =
        </button>
      </div>
    </div>

    <button v-if="!isKeypadOpen" 
            @click="isKeypadOpen = true"
            class="absolute bottom-6 right-6 bg-gold-500 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-20 animate-bounce">
       <span class="text-xl font-bold">⌨</span>
    </button>

    <transition name="modal">
      <div v-if="showMobileHistory" class="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex justify-end">
         <transition name="list">
          <div v-if="showMobileHistory" class="bg-white w-full max-w-xs h-full shadow-2xl p-6 overflow-y-auto border-l border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-dark-800">History</h3>
              <button @click="showMobileHistory = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>
            
            <div v-if="history.length === 0" class="text-center py-20 text-gray-400 text-sm">No calculations yet.</div>
            
            <div class="space-y-3">
              <div v-for="(item, index) in history" :key="index" 
                   @click="recallHistory(item); showMobileHistory = false"
                   class="p-3 rounded-xl bg-gray-50 active:bg-gold-50 cursor-pointer border border-transparent hover:border-gold-200 transition-colors">
                <div class="text-xs text-gray-400 mb-1 font-mono truncate">{{ item.expression }} =</div>
                <div class="text-lg font-bold text-dark-900 flex items-baseline gap-1">
                  {{ formatNumber(item.result) }}
                  <span class="text-xs font-normal text-gray-400">{{ item.currency }}</span>
                </div>
              </div>
            </div>
            
            <button v-if="history.length > 0" @click="clearHistory" class="w-full mt-6 py-3 rounded-xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50">Clear All History</button>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showCurrencyModal" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4">
        <transition name="slide-up" appear>
          <div class="bg-white w-full sm:max-w-md h-[85vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <div class="p-4 border-b border-gray-100 bg-white z-10 shrink-0">
               <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden"></div>
               <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-dark-800">Select Currency</h3>
                <button @click="showCurrencyModal = false" class="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors text-sm">Done</button>
              </div>
              <input v-model="searchQuery" placeholder="Search currency..." class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500/50 transition-all text-dark-800">
            </div>
            
            <div class="flex-1 overflow-y-auto p-2 no-scrollbar">
              <div v-if="pinnedCurrencies.length > 0 && selectionMode === 'base' && !searchQuery" class="mb-2">
                <h4 class="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">Pinned</h4>
                <div class="grid grid-cols-1 gap-1">
                   <div v-for="curr in pinnedCurrencies" :key="curr"
                       @click="handleCurrencySelect(curr)"
                       class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gold-50 cursor-pointer"
                       :class="{'bg-gold-50 border border-gold-200': baseCurrency === curr}">
                      <div class="flex items-center gap-3">
                         <span class="text-xl">★</span>
                         <div class="flex flex-col">
                            <span class="font-bold text-dark-800">{{ curr }}</span>
                            <span class="text-xs text-gray-500">{{ getCurrencyName(curr) }}</span>
                         </div>
                      </div>
                      <span v-if="baseCurrency === curr" class="text-gold-600 text-xl">✓</span>
                   </div>
                </div>
              </div>

              <h4 v-if="selectionMode === 'base' && !searchQuery" class="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">All Currencies</h4>
              <div class="grid grid-cols-1 gap-1 pb-10">
                 <div v-for="curr in filteredCurrencies" :key="curr"
                      v-if="selectionMode === 'base' || curr !== baseCurrency"
                      @click="handleCurrencySelect(curr)"
                      class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gold-50 cursor-pointer">
                    <div class="flex items-center gap-3">
                       <span class="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold">{{ curr[0] }}</span>
                       <div class="flex flex-col">
                          <span class="font-bold text-dark-800">{{ curr }}</span>
                          <span class="text-xs text-gray-400">{{ getCurrencyName(curr) }}</span>
                       </div>
                    </div>
                 </div>
                 <div v-if="filteredCurrencies.length === 0" class="text-center py-10 text-gray-400">No results found.</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useMainStore } from './main';

const store = useMainStore();

// 按鈕樣式 (CSS變數)
const btnBase = "h-14 sm:h-16 w-full rounded-2xl text-xl font-medium active:scale-95 transition-all flex items-center justify-center select-none cursor-pointer";

// Data
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

const CURRENCY_NAMES = {
  'TWD': 'New Taiwan Dollar', 'USD': 'US Dollar', 'JPY': 'Japanese Yen',
  'EUR': 'Euro', 'KRW': 'South Korean Won', 'CNY': 'Chinese Yuan',
  'GBP': 'British Pound', 'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar',
  'HKD': 'Hong Kong Dollar', 'SGD': 'Singapore Dollar', 'THB': 'Thai Baht'
};

const getCurrencyName = (code) => CURRENCY_NAMES[code] || code;

const baseCurrency = ref('TWD');
const targetCurrencies = ref(['USD', 'JPY', 'KRW', 'EUR', 'CNY']);
const pinnedCurrencies = ref(['TWD', 'USD', 'JPY']);

const displayValue = ref('');
const currentExpression = ref('');
const history = ref([]);
const showMobileHistory = ref(false);
const isKeypadOpen = ref(true);

const showCurrencyModal = ref(false);
const searchQuery = ref('');
const selectionMode = ref('base');
const editingTargetIndex = ref(-1);

onMounted(async () => {
  await store.fetchRates();
  const savedHistory = localStorage.getItem('calc_history');
  if (savedHistory) history.value = JSON.parse(savedHistory);
  const savedPinned = localStorage.getItem('calc_pinned');
  if (savedPinned) pinnedCurrencies.value = JSON.parse(savedPinned);
  const savedTargets = localStorage.getItem('calc_targets');
  if (savedTargets) targetCurrencies.value = JSON.parse(savedTargets);
});

// 清理全域監聽器，防止組件銷毀後報錯
onUnmounted(() => {
  window.removeEventListener('mousemove', handleWindowMouseMove);
  window.removeEventListener('mouseup', handleWindowMouseUp);
});

watch(pinnedCurrencies, (val) => localStorage.setItem('calc_pinned', JSON.stringify(val)), { deep: true });
watch(targetCurrencies, (val) => localStorage.setItem('calc_targets', JSON.stringify(val)), { deep: true });

const filteredCurrencies = computed(() => {
  if (!searchQuery.value) return ALL_CURRENCIES;
  const q = searchQuery.value.toLowerCase();
  return ALL_CURRENCIES.filter(c => c.toLowerCase().includes(q) || getCurrencyName(c).toLowerCase().includes(q));
});

const openCurrencyModal = (mode, index = -1) => {
  selectionMode.value = mode;
  editingTargetIndex.value = index;
  searchQuery.value = '';
  showCurrencyModal.value = true;
};

// --- 互動邏輯 (Touch & Mouse) ---
const isDragging = ref(false);
const dragIndex = ref(-1);
const isSwiping = ref(false);
const swipeIndex = ref(-1);
const swipeOffset = ref(0);
const isMouseDown = ref(false);
const wasDragging = ref(false); // 判斷是否發生過拖曳

let startX = 0;
let startY = 0;
let pressTimer = null;
let lastTapTime = 0;
let lastTapIndex = -1;
let lastSwapTime = 0; // 用於防止交換閃爍

// 1. 雙擊交換 (Double Click to Swap)
const handleCardClick = (index) => {
  // 如果剛結束拖曳或滑動，則不觸發點擊
  if (isDragging.value || isSwiping.value || wasDragging.value) return;

  const now = Date.now();
  if (index === lastTapIndex && now - lastTapTime < 350) {
     const temp = baseCurrency.value;
     baseCurrency.value = targetCurrencies.value[index];
     targetCurrencies.value[index] = temp;
     
     if (navigator.vibrate) navigator.vibrate(50);
     lastTapTime = 0;
     lastTapIndex = -1;
  } else {
     lastTapTime = now;
     lastTapIndex = index;
  }
};

// 2. 輸入開始 (Touch Start / Mouse Down)
const handleInputStart = (e, index, type) => {
  if (type === 'mouse' && e.button !== 0) return; 
  
  isMouseDown.value = true;
  wasDragging.value = false; // 重置拖曳狀態
  
  const clientX = type === 'touch' ? e.touches[0].clientX : e.clientX;
  const clientY = type === 'touch' ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;
  
  // 重置滑動狀態
  isSwiping.value = false;
  swipeIndex.value = -1;
  swipeOffset.value = 0;

  // 滑鼠模式：綁定全域監聽器，防止拖曳時滑鼠移出元素導致失效
  if (type === 'mouse') {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }

  pressTimer = setTimeout(() => {
     isDragging.value = true;
     wasDragging.value = true; // 標記為正在拖曳
     dragIndex.value = index;
     if (navigator.vibrate) navigator.vibrate(50);
  }, 500);
};

// 3. 通用移動邏輯
const handleInputMove = (e, type) => {
  if (type === 'mouse') return; // 滑鼠由 handleWindowMouseMove 處理
  const clientX = e.touches[0].clientX;
  const clientY = e.touches[0].clientY;
  processMove(clientX, clientY, e, 'touch');
};

const handleWindowMouseMove = (e) => {
  if (!isMouseDown.value) return;
  processMove(e.clientX, e.clientY, e, 'mouse');
};

const processMove = (clientX, clientY, e, type) => {
  const dx = clientX - startX;
  const dy = clientY - startY;

  // 只要有明顯移動，就清除長按 timer
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
     clearTimeout(pressTimer);
  }

  if (isDragging.value) {
     if (type === 'touch') e.preventDefault();
     
     const targetEl = document.elementFromPoint(clientX, clientY);
     const targetRow = targetEl?.closest('[data-index]');
     
     if (targetRow) {
        const targetIdx = parseInt(targetRow.getAttribute('data-index'));
        
        // 加入時間檢查 (Cooldown) 防止快速來回交換
        const now = Date.now();
        if (targetIdx !== -1 && !isNaN(targetIdx) && targetIdx !== dragIndex.value) {
           if (now - lastSwapTime > 250) { // 250ms 冷卻時間
              const item = targetCurrencies.value[dragIndex.value];
              targetCurrencies.value.splice(dragIndex.value, 1);
              targetCurrencies.value.splice(targetIdx, 0, item);
              dragIndex.value = targetIdx; 
              if (navigator.vibrate) navigator.vibrate(10);
              lastSwapTime = now;
           }
        }
     }
  } 
  else {
     // 判斷滑動
     if (!isSwiping.value) {
        if (Math.abs(dx) > 10) { 
           if (Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) { // 左滑
                 isSwiping.value = true;
                 wasDragging.value = true; // 滑動也視為拖曳的一種
                 
                 // 尋找目標 Row
                 let row;
                 if (type === 'touch') {
                    row = e.target.closest('[data-index]');
                 } else { 
                    const el = document.elementFromPoint(startX, startY);
                    row = el?.closest('[data-index]');
                 }

                 if (row) swipeIndex.value = parseInt(row.getAttribute('data-index'));
              }
           }
        }
     }

     if (isSwiping.value) {
        if(e.cancelable) e.preventDefault(); 
        swipeOffset.value = Math.min(0, Math.max(-120, dx));
     }
  }
};

// 4. 輸入結束
const handleInputEnd = () => {
  cleanupInput();
};

const handleWindowMouseUp = () => {
  cleanupInput();
  window.removeEventListener('mousemove', handleWindowMouseMove);
  window.removeEventListener('mouseup', handleWindowMouseUp);
};

const cleanupInput = () => {
  clearTimeout(pressTimer);
  isMouseDown.value = false;
  
  if (isDragging.value) {
    isDragging.value = false;
    dragIndex.value = -1;
  }
  
  if (isSwiping.value) {
     if (swipeOffset.value < -60) {
        openCurrencyModal('target', swipeIndex.value);
     }
     swipeOffset.value = 0;
     setTimeout(() => {
        isSwiping.value = false;
        swipeIndex.value = -1;
     }, 200);
  }
  
  // 延遲重置 wasDragging，避免 click 事件立即觸發
  setTimeout(() => {
     wasDragging.value = false;
  }, 100);
};

const getCardStyle = (index) => {
   if (isSwiping.value && swipeIndex.value === index) {
      return { transform: `translateX(${swipeOffset.value}px)` };
   }
   return {};
};
// --- End Interaction Logic ---

const handleCurrencySelect = (curr) => {
  if (selectionMode.value === 'base') {
    baseCurrency.value = curr;
  } else if (selectionMode.value === 'target') {
    targetCurrencies.value[editingTargetIndex.value] = curr;
  } else if (selectionMode.value === 'add_target') {
    if (!targetCurrencies.value.includes(curr)) targetCurrencies.value.push(curr);
  }
  showCurrencyModal.value = false;
};

const appendNumber = (num) => { displayValue.value = (displayValue.value === '0' && num !== '.') ? num : displayValue.value + num; };
const appendOperator = (op) => { if(displayValue.value) { currentExpression.value += `${displayValue.value} ${op} `; displayValue.value = ''; } };
const deleteLast = () => { displayValue.value = displayValue.value.slice(0, -1); };
const clear = () => { displayValue.value = ''; currentExpression.value = ''; };

const calculate = () => {
  if (!displayValue.value && !currentExpression.value) return;
  const cleanExpr = (currentExpression.value + (displayValue.value || '')).trim().replace(/[+\-*/]$/, '');
  try {
    if (/[^0-9.+\-*/\s]/.test(cleanExpr)) return;
    const res = new Function(`return ${cleanExpr}`)();
    if (!isFinite(res) || isNaN(res)) { displayValue.value = 'Error'; return; }
    const final = parseFloat(res.toFixed(4)).toString();
    addToHistory(cleanExpr, final);
    displayValue.value = final;
    currentExpression.value = '';
  } catch { displayValue.value = 'Error'; }
};

const addToHistory = (exp, res) => {
  history.value.unshift({ expression: exp, result: res, currency: baseCurrency.value });
  if (history.value.length > 10) history.value.pop();
  localStorage.setItem('calc_history', JSON.stringify(history.value));
};

const recallHistory = (item) => { 
  displayValue.value = item.result.toString(); 
  currentExpression.value = '';
  if (item.currency) baseCurrency.value = item.currency;
};

const clearHistory = () => { history.value = []; localStorage.removeItem('calc_history'); };
const calculateRate = (target) => (parseFloat(displayValue.value) || 0) * store.getExchangeRate(baseCurrency.value, target);
const formatNumber = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n);

</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.list-complete-move {
  transition: transform 0.3s ease;
}
.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>