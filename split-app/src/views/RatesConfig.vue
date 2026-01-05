<template>
  <div class="min-h-screen bg-dark-100 p-4 sm:p-6 pb-24 relative overflow-hidden">
    <div class="flex items-center mb-6 z-10 relative">
      <button @click="$router.back()" class="mr-4 text-gray-400 hover:text-dark-800 transition-colors">
        ← Back
      </button>
      <h1 class="text-2xl font-light text-dark-900">Currency Calculator</h1>
    </div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-2 space-y-6">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          
          <div class="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 relative z-10">
            <div class="w-full">
              <label class="text-xs uppercase tracking-widest text-gray-400 mb-1 block">Base Amount</label>
              <div class="flex items-center border-b-2 border-gold-100 focus-within:border-gold-500 transition-colors">
                 <span class="text-2xl text-gold-500 font-bold mr-2">{{ baseCurrency }}</span>
                 <input 
                   v-model="displayValue" 
                   type="text" 
                   inputmode="decimal"
                   class="w-full text-4xl font-light text-dark-800 bg-transparent focus:outline-none text-right py-2"
                   placeholder="0"
                   @input="handleManualInput"
                 >
              </div>
            </div>

            <div class="w-full sm:w-auto min-w-[140px]">
              <label class="text-xs uppercase tracking-widest text-gray-400 mb-1 block text-right sm:text-left">Currency</label>
              <button 
                @click="openCurrencyModal('base')"
                class="w-full flex items-center justify-end sm:justify-start gap-2 border-b border-gray-200 py-2 bg-transparent text-right sm:text-left hover:border-gold-500 transition-colors"
              >
                <span class="text-dark-800 font-medium text-xl">{{ baseCurrency }}</span>
                <span class="text-xs text-gray-400">▼</span>
              </button>
            </div>
          </div>

          <div class="text-right mt-2 h-6 text-sm text-gray-400 font-mono">
            {{ currentExpression || '&nbsp;' }}
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="grid grid-cols-4 gap-3 sm:gap-4">
            <button @click="clear" class="btn-calc text-gold-600 bg-gold-50 font-bold">AC</button>
            <button @click="appendOperator('/')" class="btn-calc text-gold-600 bg-gold-50">÷</button>
            <button @click="appendOperator('*')" class="btn-calc text-gold-600 bg-gold-50">×</button>
            <button @click="deleteLast" class="btn-calc text-gold-600 bg-gold-50">⌫</button>

            <button @click="appendNumber('7')" class="btn-calc">7</button>
            <button @click="appendNumber('8')" class="btn-calc">8</button>
            <button @click="appendNumber('9')" class="btn-calc">9</button>
            <button @click="appendOperator('-')" class="btn-calc text-gold-600 bg-gold-50">-</button>

            <button @click="appendNumber('4')" class="btn-calc">4</button>
            <button @click="appendNumber('5')" class="btn-calc">5</button>
            <button @click="appendNumber('6')" class="btn-calc">6</button>
            <button @click="appendOperator('+')" class="btn-calc text-gold-600 bg-gold-50">+</button>

            <button @click="appendNumber('1')" class="btn-calc">1</button>
            <button @click="appendNumber('2')" class="btn-calc">2</button>
            <button @click="appendNumber('3')" class="btn-calc">3</button>
            <button @click="calculate" class="btn-calc row-span-2 bg-gold-500 text-white shadow-lg shadow-gold-200 hover:bg-gold-600 border-none">=</button>

            <button @click="appendNumber('0')" class="btn-calc col-span-2">0</button>
            <button @click="appendNumber('.')" class="btn-calc">.</button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 class="text-xs uppercase tracking-widest text-gray-400 mb-4">Converted Values</h3>
           <div class="space-y-4">
            <div v-for="(target, index) in targetCurrencies" :key="target + index" 
                 class="group relative flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors select-none cursor-pointer"
                 @click="handleTargetClick(index)"
                 @touchstart="handleTouchStart($event, 'target', index)"
                 @touchmove="cancelLongPress"
                 @touchend="handleTouchEnd"
                 @mousedown="handleMouseDown('target', index)"
                 @mouseup="handleMouseUp"
                 @mouseleave="handleMouseUp"
            >
               <div class="flex items-center gap-3">
                 <span class="text-gray-500 font-medium w-10">{{ target }}</span>
                 <span class="hidden lg:flex opacity-0 group-hover:opacity-100 text-gold-500 text-xs border border-gold-200 px-2 py-0.5 rounded hover:bg-gold-50 transition-all">
                   Edit
                 </span>
               </div>
               <span class="font-mono text-lg text-dark-800 tracking-tight">
                 {{ formatCurrency(calculateRate(target)) }}
               </span>
               <div v-if="activeLongPressId === `target-${index}`" class="absolute inset-0 bg-gold-500/10 rounded animate-pulse pointer-events-none"></div>
            </div>
            
            <button @click="openCurrencyModal('add_target')" class="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:border-gold-300 hover:text-gold-600 transition-colors text-sm font-medium">
              + Add Currency
            </button>
          </div>
        </div>
      </div>

      <div class="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium text-dark-800">History</h3>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{{ history.length }}/10</span>
        </div>
        
        <div v-if="history.length === 0" class="text-center py-10 text-gray-400 text-sm">
          No calculations yet.
        </div>

        <div class="space-y-3">
          <div v-for="(item, index) in history" :key="index" 
               @click="recallHistory(item)"
               class="group p-3 rounded-xl border border-gray-100 hover:border-gold-300 hover:bg-gold-50 cursor-pointer transition-all relative">
            <div class="text-xs text-gray-400 mb-1 font-mono truncate">{{ item.expression }} =</div>
            <div class="text-lg font-bold text-dark-800 group-hover:text-gold-600 flex items-baseline gap-1">
              {{ formatNumber(item.result) }}
              <span class="text-xs font-normal text-gray-400">{{ item.currency }}</span>
            </div>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gold-500">
              ↲
            </div>
          </div>
        </div>
        
        <button v-if="history.length > 0" @click="clearHistory" class="w-full mt-6 text-xs text-red-400 hover:text-red-600 py-2">
          Clear History
        </button>
      </div>
    </div>

    <button @click="showMobileHistory = true" class="lg:hidden fixed bottom-6 right-6 bg-dark-800 text-gold-400 w-14 h-14 rounded-full shadow-2xl z-40 flex items-center justify-center border border-gold-500/30">
      <span class="text-xl">🕒</span>
    </button>

    <transition name="modal">
      <div v-if="showMobileHistory" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex justify-end">
        <transition name="list">
          <div v-if="showMobileHistory" class="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-light text-dark-800">History</h3>
              <button @click="showMobileHistory = false" class="text-gray-400 text-2xl">×</button>
            </div>
            <div v-if="history.length === 0" class="text-center py-20 text-gray-400">No calculations yet.</div>
            <div class="space-y-4">
              <div v-for="(item, index) in history" :key="index" 
                   @click="recallHistory(item); showMobileHistory = false"
                   class="p-4 rounded-xl bg-gray-50 active:bg-gold-50 active:scale-95 transition-all border border-transparent hover:border-gold-200">
                <div class="text-xs text-gray-500 mb-1 font-mono">{{ item.expression }} =</div>
                <div class="text-2xl font-bold text-dark-900 flex items-baseline gap-2">
                  {{ formatNumber(item.result) }}
                  <span class="text-base font-normal text-gray-400">{{ item.currency }}</span>
                </div>
              </div>
            </div>
            <button v-if="history.length > 0" @click="clearHistory" class="w-full mt-8 py-3 rounded-lg border border-red-100 text-red-500">Clear All</button>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showCurrencyModal" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <transition name="modal-content" appear>
          <div class="bg-white w-full max-w-md h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <div class="p-5 border-b border-gray-100 bg-white z-10">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-dark-800">Select Currency</h3>
                <button @click="showCurrencyModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">✕</button>
              </div>
              <input v-model="searchQuery" placeholder="Search (e.g. USD, Japan...)" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors">
            </div>
            <div class="px-5 py-2 bg-gold-50 text-gold-700 text-xs flex justify-between items-center">
              <span>Long press to {{ selectionMode === 'base' ? 'Pin/Unpin' : 'Select' }}</span>
            </div>
            <div class="flex-1 overflow-y-auto p-2 no-scrollbar">
              <div v-if="pinnedCurrencies.length > 0 && selectionMode === 'base' && !searchQuery" class="mb-4">
                <h4 class="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Pinned</h4>
                <div class="grid grid-cols-1 gap-1">
                  <div v-for="curr in pinnedCurrencies" :key="curr"
                       @click="handleCurrencySelect(curr)"
                       @touchstart="handleTouchStart($event, 'pin', curr)"
                       @touchmove="cancelLongPress"
                       @touchend="handleTouchEnd"
                       @mousedown="handleMouseDown('pin', curr)"
                       @mouseup="handleMouseUp"
                       @mouseleave="handleMouseUp"
                       class="relative flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer select-none transition-colors border border-transparent"
                       :class="{'border-gold-500 bg-gold-50': baseCurrency === curr}"
                  >
                    <div class="flex items-center gap-3">
                       <span class="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-bold">★</span>
                       <span class="font-bold text-dark-800">{{ curr }}</span>
                       <span class="text-xs text-gray-400">{{ getCurrencyName(curr) }}</span>
                    </div>
                    <div v-if="activeLongPressId === `pin-${curr}`" class="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <h4 v-if="selectionMode === 'base' && !searchQuery" class="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">All Currencies</h4>
              <div class="grid grid-cols-1 gap-1">
                 <div v-for="curr in filteredCurrencies" :key="curr"
                      @click="handleCurrencySelect(curr)"
                      @touchstart="handleTouchStart($event, 'pin', curr)"
                      @touchmove="cancelLongPress"
                      @touchend="handleTouchEnd"
                      @mousedown="handleMouseDown('pin', curr)"
                      @mouseup="handleMouseUp"
                      @mouseleave="handleMouseUp"
                      class="relative flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer select-none transition-colors"
                      :class="{'opacity-50': pinnedCurrencies.includes(curr) && selectionMode === 'base' && !searchQuery}"
                 >
                    <div class="flex items-center gap-3">
                       <span class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{{ curr[0] }}</span>
                       <div class="flex flex-col">
                         <span class="font-bold text-dark-800">{{ curr }}</span>
                         <span class="text-xs text-gray-400">{{ getCurrencyName(curr) }}</span>
                       </div>
                    </div>
                    <span v-if="pinnedCurrencies.includes(curr) && selectionMode === 'base'" class="text-gold-500 text-xs">Pinned</span>
                    <div v-if="activeLongPressId === `pin-${curr}`" class="absolute inset-0 bg-gold-500/10 rounded-xl animate-pulse pointer-events-none"></div>
                 </div>
              </div>
              <div v-if="filteredCurrencies.length === 0" class="text-center py-10 text-gray-400">No currency found.</div>
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

// --- Data: Full Currency List ---
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

// --- State ---
const baseCurrency = ref('TWD');
const targetCurrencies = ref(['USD', 'JPY', 'KRW', 'EUR', 'CNY']);
const pinnedCurrencies = ref(['TWD', 'USD', 'JPY']);

const displayValue = ref('');
const currentExpression = ref('');
const history = ref([]);
const showMobileHistory = ref(false);

const showCurrencyModal = ref(false);
const searchQuery = ref('');
const selectionMode = ref('base');
const editingTargetIndex = ref(-1);

const activeLongPressId = ref(null);
let longPressTimer = null;
const longPressTriggered = ref(false);

// --- Initialization ---
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

// --- Computed ---
const filteredCurrencies = computed(() => {
  if (!searchQuery.value) return ALL_CURRENCIES;
  const q = searchQuery.value.toLowerCase();
  return ALL_CURRENCIES.filter(c => c.toLowerCase().includes(q) || getCurrencyName(c).toLowerCase().includes(q));
});

// --- Modal Logic ---
const openCurrencyModal = (mode, index = -1) => {
  selectionMode.value = mode;
  editingTargetIndex.value = index;
  searchQuery.value = '';
  showCurrencyModal.value = true;
};

// 新增：處理轉換列表點擊 (電腦/手機短點擊)
const handleTargetClick = (index) => {
  if (longPressTriggered.value) return; // 如果剛剛發生了長按，則忽略這次點擊
  openCurrencyModal('target', index);
};

const handleCurrencySelect = (curr) => {
  if (longPressTriggered.value) return; // 長按後不觸發選擇

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

// --- Long Press Handlers ---
const startLongPress = (type, id) => {
  longPressTriggered.value = false;
  activeLongPressId.value = `${type}-${id}`;
  longPressTimer = setTimeout(() => {
    longPressTriggered.value = true; // 鎖定狀態，防止 click 觸發
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

// --- Calculator Logic ---
const handleManualInput = (e) => { displayValue.value = e.target.value.replace(/[^0-9.]/g, ''); };
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

// --- History & Utils ---
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
const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'code' }).format(v).replace('USD', '').trim();
</script>