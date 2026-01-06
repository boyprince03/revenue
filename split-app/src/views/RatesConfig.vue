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
    
    <div class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth no-scrollbar"
         :class="{'pb-24': !isKeypadOpen}"> <div v-for="(target, index) in targetCurrencies" :key="target + index" 
           class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.99] transition-transform select-none cursor-pointer relative overflow-hidden group"
           @click="handleTargetClick(index)"
           @touchstart="handleTouchStart($event, 'target', index)"
           @touchmove="cancelLongPress"
           @touchend="handleTouchEnd"
           @mousedown="handleMouseDown('target', index)"
           @mouseup="handleMouseUp"
           @mouseleave="handleMouseUp"
      >
         <div class="flex items-center gap-3 z-10">
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
         <div v-if="activeLongPressId === `target-${index}`" class="absolute inset-0 bg-gold-500/10 animate-pulse pointer-events-none z-0"></div>
      </div>

      <button @click="openCurrencyModal('add_target')" class="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-gold-300 hover:text-gold-600 transition-colors flex items-center justify-center gap-2 font-medium bg-gray-50/50">
        <span class="text-lg">+</span> Add Currency
      </button>
    </div>

    <div class="flex-none bg-white z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] rounded-t-3xl transition-all duration-300 ease-in-out pb-[env(safe-area-inset-bottom)]"
         :class="isKeypadOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'">
      
      <div @click="isKeypadOpen = !isKeypadOpen" 
           class="w-full h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded-t-3xl touch-manipulation">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full transition-colors" :class="{'bg-gold-400': !isKeypadOpen}"></div>
      </div>
      
      <div class="grid grid-cols-4 gap-1 px-2 max-w-md mx-auto pb-4 transition-opacity duration-200"
           :class="isKeypadOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'">
        
        <button @click="clear" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-red-400">AC</button>
        <button @click="deleteLast" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-dark-800">⌫</button>
        <button @click="appendOperator('/')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-gold-600 bg-gold-50/50">÷</button>
        <button @click="appendOperator('*')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-gold-600 bg-gold-50/50">×</button>

        <button @click="appendNumber('7')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">7</button>
        <button @click="appendNumber('8')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">8</button>
        <button @click="appendNumber('9')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">9</button>
        <button @click="appendOperator('-')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-gold-600 bg-gold-50/50">-</button>

        <button @click="appendNumber('4')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">4</button>
        <button @click="appendNumber('5')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">5</button>
        <button @click="appendNumber('6')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">6</button>
        <button @click="appendOperator('+')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none text-gold-600 bg-gold-50/50">+</button>

        <div class="col-span-3 grid grid-cols-3 gap-1">
           <button @click="appendNumber('1')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">1</button>
           <button @click="appendNumber('2')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">2</button>
           <button @click="appendNumber('3')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">3</button>
           <button @click="appendNumber('0')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none col-span-2">0</button>
           <button @click="appendNumber('.')" class="h-14 sm:h-16 w-full rounded-2xl text-xl font-medium text-dark-800 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center select-none">.</button>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useMainStore } from './main';

const store = useMainStore();

// Data (與之前相同)
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
const isKeypadOpen = ref(true); // 新增：控制鍵盤是否展開

const showCurrencyModal = ref(false);
const searchQuery = ref('');
const selectionMode = ref('base');
const editingTargetIndex = ref(-1);

const activeLongPressId = ref(null);
let longPressTimer = null;
const longPressTriggered = ref(false);

onMounted(async () => {
  await store.fetchRates();
  const savedHistory = localStorage.getItem('calc_history');
  if (savedHistory) history.value = JSON.parse(savedHistory);
  const savedPinned = localStorage.getItem('calc_pinned');
  if (savedPinned) pinnedCurrencies.value = JSON.parse(savedPinned);
  const savedTargets = localStorage.getItem('calc_targets');
  if (savedTargets) targetCurrencies.value = JSON.parse(savedTargets);
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

const handleTargetClick = (index) => {
  if (longPressTriggered.value) return;
  openCurrencyModal('target', index);
};

const handleCurrencySelect = (curr) => {
  if (longPressTriggered.value) return;

  if (selectionMode.value === 'base') {
    baseCurrency.value = curr;
  } else if (selectionMode.value === 'target') {
    targetCurrencies.value[editingTargetIndex.value] = curr;
  } else if (selectionMode.value === 'add_target') {
    if (!targetCurrencies.value.includes(curr)) targetCurrencies.value.push(curr);
  }
  showCurrencyModal.value = false;
};

const togglePin = (curr) => {
  if (pinnedCurrencies.value.includes(curr)) {
    pinnedCurrencies.value = pinnedCurrencies.value.filter(c => c !== curr);
  } else {
    pinnedCurrencies.value.push(curr);
  }
  if (navigator.vibrate) navigator.vibrate(50);
};

const startLongPress = (type, id) => {
  longPressTriggered.value = false;
  activeLongPressId.value = `${type}-${id}`;
  longPressTimer = setTimeout(() => {
    longPressTriggered.value = true;
    if (type === 'pin') {
      if (selectionMode.value === 'base') togglePin(id);
    } else if (type === 'target') {
      openCurrencyModal('target', id);
    }
    activeLongPressId.value = null;
  }, 600);
};

const cancelLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  activeLongPressId.value = null;
};

const handleTouchStart = (e, type, id) => startLongPress(type, id);
const handleTouchEnd = () => cancelLongPress();
const handleMouseDown = (type, id) => startLongPress(type, id);
const handleMouseUp = () => cancelLongPress();

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
/* 隱藏滾動條但保持功能 (適用於 Webkit 瀏覽器) */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Modal 動畫 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>