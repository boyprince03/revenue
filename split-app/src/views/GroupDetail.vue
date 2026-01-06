<template>
  <div class="min-h-screen bg-dark-100 pb-24 relative">
    <div class="bg-dark-800 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl z-10 relative">
      <div class="flex justify-between items-start mb-4">
         <button @click="$router.back()" class="text-white/60 hover:text-gold-400 transition-colors">← {{ $t('common.back') }}</button>
         <div class="flex gap-2">
           <button @click="handleMyInfoClick" class="flex items-center justify-center w-8 h-8 text-gold-400 hover:text-white transition-colors border border-gold-500/50 rounded-full">
              💳
           </button>
           
           <button @click="showSettlementPlan = true" class="flex items-center gap-1 text-gold-400 hover:text-white transition-colors text-xs uppercase tracking-wider border border-gold-500/50 px-3 py-1 rounded-full">
              <span>{{ $t('group.settle_up') }}</span> ⚖️
           </button>
           <button @click="copyInviteLink" class="flex items-center gap-1 text-gold-400 hover:text-white transition-colors text-xs uppercase tracking-wider border border-gold-500/50 px-3 py-1 rounded-full">
              <span>{{ $t('group.link') }}</span> 🔗
           </button>
         </div>
      </div>
      
      <div class="text-center -mt-2 mb-6"> 
        <h1 class="text-2xl font-light tracking-wide">{{ group?.name }}</h1>
        <p class="text-gold-500 font-mono text-xs mt-1">{{ group?.currency }}</p>
        
        <div class="mt-4 flex flex-col items-center animate-fade-in">
           <span class="text-[10px] uppercase tracking-widest text-gray-400">{{ $t('group.total_expenses') }}</span>
           <span class="text-3xl font-light tracking-tight mt-1">
             {{ group?.currency }} {{ formatAmount(totalGroupExpense) }}
           </span>
        </div>
      </div>
      
      <div class="flex overflow-x-auto gap-4 py-2 no-scrollbar mt-4 justify-center items-start min-h-[100px]"> 
        <div v-if="members.length > 1"
             @click="selectedMember = 'all'"
             class="flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 w-14 shrink-0"
             :class="selectedMember === 'all' ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'">
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-lg transition-colors', 
                        selectedMember === 'all' ? 'bg-gold-500 text-dark-900 border-white' : 'bg-dark-700 text-gray-300 border-transparent']">
            ∞
          </div>
          <span class="text-[10px] tracking-wider uppercase">{{ $t('group.all') }}</span>
        </div>

        <div v-for="m in members" :key="m.uid" 
             @click="selectedMember = m.uid"
             class="flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 w-14 shrink-0"
             :class="selectedMember === m.uid ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'">
          
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg transition-colors relative overflow-hidden', 
                        selectedMember === m.uid ? 'bg-gold-500 text-dark-900 border-white' : 'bg-dark-700 text-gray-300 border-transparent']">
            {{ m.nickname ? m.nickname[0].toUpperCase() : 'U' }}
          </div>
          
          <div class="flex flex-col items-center w-full">
            <span class="text-[10px] tracking-wider uppercase truncate max-w-full">{{ m.nickname || 'User' }}</span>
            
            <span v-if="memberBalances[m.uid] && Math.abs(memberBalances[m.uid]) > 0.1" 
                  class="text-[9px] font-mono mt-0.5"
                  :class="memberBalances[m.uid] > 0 ? 'text-green-400' : 'text-red-400'">
              {{ memberBalances[m.uid] > 0 ? '+' : '' }}{{ Math.round(memberBalances[m.uid]) }}
            </span>
            
            <div v-if="memberBalances[m.uid] < -0.1" class="w-full h-1 bg-dark-700 rounded-full mt-1 overflow-hidden">
               <div class="h-full bg-red-500 rounded-full" 
                    :style="{ width: getDebtPercentage(memberBalances[m.uid]) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-5 -mt-6 relative z-20">
      <div class="flex justify-between items-end mb-4 px-2">
         <h3 class="text-xs uppercase tracking-widest text-gray-400">
           {{ selectedMember === 'all' ? $t('group.all_transactions') : $t('group.registered_by') }}
         </h3>
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
                {{ exp.type === 'settlement' ? $t('group.transfer_to_prefix') : $t('group.paid_by_prefix') }} 
                {{ exp.type === 'settlement' && exp.splitWith?.[0] ? getMemberName(exp.splitWith[0]) : getMemberName(exp.payerId) }}
              </span>
            </div>
          </div>
          
          <div class="text-right">
             <span class="block font-bold" :class="exp.type === 'settlement' ? 'text-green-600' : 'text-dark-900'">
               {{ group?.currency }} {{ formatAmount(exp.settlementAmount) }}
             </span>
             <span class="text-[10px] text-gray-400 font-mono">{{ $t('group.original') }}: {{ exp.currency }} {{ exp.amount }}</span>
          </div>

          <div v-if="exp.payerId === currentUser.uid" class="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button @click.stop="deleteExpense(exp.id)" class="bg-red-50 text-red-500 p-1.5 rounded-full shadow-sm text-xs">✕</button>
             <button @click.stop="editExpense(exp)" class="bg-blue-50 text-blue-500 p-1.5 rounded-full shadow-sm text-xs">✎</button>
          </div>
          </div>
      </transition-group>
      
      <div v-if="filteredExpenses.length === 0" class="text-center py-10 text-gray-400 text-sm">
        {{ $t('group.no_transactions') }}
      </div>
    </div>
    
    <transition name="modal">
      <button v-if="canAddExpense" 
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
                 {{ $t('group.new_expense') }}
                 <div v-if="activeTab === 'expense'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-t-full"></div>
               </button>
               <button @click="activeTab = 'settlement'" 
                       :class="['flex-1 pb-3 text-sm font-medium transition-colors relative', activeTab === 'settlement' ? 'text-green-600' : 'text-gray-400']">
                 {{ $t('group.settlement') }}
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
                  <input v-model="form.name" :placeholder="$t('group.what_for')" class="w-full text-center border-b border-gray-200 py-2 focus:outline-none focus:border-gold-500 transition-colors mb-3">
                  
                  <div class="flex justify-center flex-wrap gap-2 relative">
                    <span v-for="tag in visibleTags" :key="tag" @click="form.name = tag" 
                          class="px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-500 cursor-pointer hover:bg-gold-50 hover:text-gold-600 transition-colors border border-transparent hover:border-gold-200">
                      {{ tag }}
                    </span>
                    
                    <div v-if="hiddenTags.length > 0" class="relative">
                      <span @click.stop="showTagMenu = !showTagMenu" class="px-3 py-1 bg-gray-50 rounded-full text-xs text-gold-600 cursor-pointer font-medium">{{ $t('group.more') }}</span>
                      <div v-if="showTagMenu" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl p-2 z-50 grid gap-1">
                         <span v-for="tag in hiddenTags" :key="tag" @click="selectTag(tag)" class="px-3 py-2 text-xs hover:bg-gold-50 rounded-lg cursor-pointer text-center">{{ tag }}</span>
                      </div>
                    </div>

                    <span @click="startAddTag" class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-400 cursor-pointer hover:bg-gray-200 w-6 h-6 flex items-center justify-center">+</span>
                  </div>

                  <div v-if="isAddingTag" class="mt-2 flex justify-center">
                     <input v-model="newTagInput" ref="tagInputRef" @keyup.enter="addNewTag" @blur="addNewTag" placeholder="New tag name" class="text-xs text-center border-b border-gold-300 focus:outline-none py-1 w-32 bg-transparent">
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-xl">
                  <p class="text-xs uppercase tracking-widest text-gray-400 mb-3">{{ $t('group.split_with') }}</p>
                  <div class="flex flex-wrap gap-2">
                    <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                           :class="form.splitWith.length === 0 ? 'bg-dark-800 text-gold-400 border-dark-800' : 'bg-white border-gray-200 text-gray-500'">
                      <input type="checkbox" :checked="form.splitWith.length === 0" @change="toggleAll" class="hidden"> {{ $t('group.all') }}
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
                    <p class="text-xs uppercase tracking-widest text-green-600 mb-4">{{ $t('group.pay_to') }}</p>
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
                    
                    <div v-if="transferTarget" class="mt-6 pt-4 border-t border-green-200/50">
                       <div v-if="getMemberBank(transferTarget).hasInfo" class="animate-fade-in">
                          <p class="text-[10px] text-gray-400 uppercase mb-1">{{ $t('group.recipient_account') }}</p>
                          <p class="font-bold text-dark-800">{{ getMemberBank(transferTarget).bankName }}</p>
                          <p class="font-mono text-lg text-green-700 select-all">{{ getMemberBank(transferTarget).bankAccount }}</p>
                       </div>
                       <p v-else class="text-xs text-gray-400 italic mt-2">
                         {{ $t('group.no_payment_info') }}
                       </p>
                    </div>

                    <p v-if="otherMembers.length === 0" class="text-sm text-gray-400 py-2">{{ $t('group.no_other_members') }}</p>
                 </div>
              </div>

            </div>

            <div class="grid grid-cols-2 gap-4 mt-8">
              <button @click="showModal = false" class="py-3 text-gray-500 hover:text-dark-900 transition-colors">{{ $t('common.cancel') }}</button>
              <button @click="saveExpense" 
                      :class="activeTab === 'expense' ? 'bg-gold-500 hover:bg-gold-600 shadow-gold-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'"
                      class="py-3 text-white rounded-xl shadow-lg transition-all font-medium">
                 {{ activeTab === 'expense' ? $t('group.save_expense') : $t('group.confirm_pay') }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showSettlementPlan" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <transition name="modal-content" appear>
          <div class="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 class="font-bold text-dark-800 text-lg">{{ $t('group.settlement_plan') }}</h3>
                <p class="text-xs text-gray-400">{{ $t('group.plan_desc') }}</p>
              </div>
              <button @click="showSettlementPlan = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-dark-800 shadow-sm">✕</button>
            </div>
            
            <div class="p-4 overflow-y-auto">
               <div v-if="suggestedSettlements.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
                  <span class="text-4xl mb-2">🎉</span>
                  <p class="text-green-600 font-medium">{{ $t('group.all_settled') }}</p>
               </div>
               <div v-else class="space-y-3">
                 <div v-for="(plan, index) in suggestedSettlements" :key="index"
                      @click="handlePlanClick(plan)"
                      class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gold-400 hover:bg-gold-50 transition-all cursor-pointer group relative overflow-hidden"
                      :class="{'border-gold-300 bg-gold-50': plan.from === currentUser?.uid || plan.to === currentUser?.uid}">
                    
                    <div class="flex items-center gap-3 z-10">
                      <div class="flex -space-x-2">
                        <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold border-2 border-white">{{ getMemberName(plan.from)[0] }}</div>
                        <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold border-2 border-white">{{ getMemberName(plan.to)[0] }}</div>
                      </div>
                      <div class="flex flex-col">
                         <span class="text-xs text-gray-400 uppercase tracking-wider">{{ getMemberName(plan.from) }} <span class="text-gold-500">➜</span> {{ getMemberName(plan.to) }}</span>
                         <span class="font-bold text-dark-800 text-lg">{{ group?.currency }} {{ formatAmount(plan.amount) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="plan.from === currentUser?.uid" class="z-10 bg-gold-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg">{{ $t('group.pay_btn') }}</div>
                    <div v-else-if="plan.to === currentUser?.uid" class="z-10 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg">{{ $t('group.collect_btn') }}</div>
                    
                    <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                 </div>
               </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
       <div v-if="showSettlementInfoModal && selectedPlan" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
          <transition name="modal-content" appear>
             <div class="bg-white w-full max-w-xs rounded-2xl shadow-xl p-6 relative overflow-hidden text-center">
                <div class="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <button @click="showSettlementInfoModal = false" class="absolute top-4 right-4 text-gray-400 z-10">✕</button>

                <div v-if="selectedPlan.from === currentUser?.uid" class="relative z-10">
                   <h3 class="text-lg font-bold text-dark-800 mb-1">{{ $t('group.payment_required') }}</h3>
                   <p class="text-xs text-gray-400 mb-6">{{ $t('group.you_owe') }} <strong class="text-dark-800">{{ getMemberName(selectedPlan.to) }}</strong></p>

                   <div class="bg-gold-50 border border-gold-200 p-4 rounded-xl mb-6">
                      <p class="text-3xl font-light text-gold-600 mb-1">{{ group?.currency }} {{ formatAmount(selectedPlan.amount) }}</p>
                   </div>

                   <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                      <div v-if="getMemberBank(selectedPlan.to).hasInfo">
                        <p class="text-[10px] uppercase text-gray-400 tracking-widest mb-1">{{ $t('group.pay_to_bank') }}</p>
                        <p class="font-bold text-dark-900">{{ getMemberBank(selectedPlan.to).bankName }}</p>
                        <p class="font-mono text-lg text-green-700 select-all mt-1">{{ getMemberBank(selectedPlan.to).bankAccount }}</p>
                      </div>
                      <div v-else class="text-center py-2">
                        <p class="text-xs text-gray-400 italic">{{ $t('group.no_payment_info') }}</p>
                      </div>
                   </div>

                   <button @click="proceedToRecord" class="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl shadow-lg transition-colors font-medium">
                      {{ $t('group.record_payment') }}
                   </button>
                </div>

                <div v-else-if="selectedPlan.to === currentUser?.uid" class="relative z-10">
                   <h3 class="text-lg font-bold text-dark-800 mb-1">{{ $t('group.collect_money') }}</h3>
                   <p class="text-xs text-gray-400 mb-6"><strong class="text-dark-800">{{ getMemberName(selectedPlan.from) }}</strong> {{ $t('group.owes_you') }}</p>

                   <div class="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                      <p class="text-3xl font-light text-green-600 mb-1">{{ group?.currency }} {{ formatAmount(selectedPlan.amount) }}</p>
                   </div>

                   <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                      <p class="text-[10px] uppercase text-gray-400 tracking-widest mb-2 text-center border-b border-gray-200 pb-2">{{ $t('group.show_payer') }}</p>
                      <div v-if="store.userProfile?.bankAccount">
                        <p class="text-[10px] uppercase text-gray-400 tracking-widest mb-1">{{ $t('group.my_bank') }}</p>
                        <p class="font-bold text-dark-900">{{ store.userProfile?.bankName || 'Unknown Bank' }}</p>
                        <p class="font-mono text-lg text-gold-600 select-all mt-1">{{ store.userProfile?.bankAccount }}</p>
                      </div>
                      <div v-else class="text-center py-2">
                        <p class="text-xs text-gray-400 italic mb-2">{{ $t('dashboard.no_bank_info') }}</p>
                        <button @click="openBankEdit" class="text-xs text-gold-500 underline">{{ $t('group.setup_now') }}</button>
                      </div>
                   </div>

                   <button @click="showSettlementInfoModal = false" class="w-full py-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                      {{ $t('group.close_btn') }}
                   </button>
                </div>
             </div>
          </transition>
       </div>
    </transition>

    <transition name="modal">
      <div v-if="showBankDisplay" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
        <transition name="modal-content" appear>
           <div class="bg-white w-full max-w-xs rounded-2xl shadow-xl p-6 text-center relative overflow-hidden">
             <div class="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-bl-full -mr-4 -mt-4"></div>
             
             <h3 class="text-lg font-bold text-dark-800 mb-1">{{ $t('group.my_payment_info') }}</h3>
             <p class="text-xs text-gray-400 mb-6">{{ $t('group.show_receive') }}</p>

             <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
               <p class="text-[10px] uppercase text-gray-400 tracking-widest mb-1">{{ $t('group.bank_label') }}</p>
               <p class="font-medium text-dark-900 mb-3">{{ store.userProfile?.bankName || 'Not Set' }}</p>
               
               <p class="text-[10px] uppercase text-gray-400 tracking-widest mb-1">{{ $t('group.account_label') }}</p>
               <p class="font-mono text-xl text-gold-600 font-bold select-all">{{ store.userProfile?.bankAccount || 'Not Set' }}</p>
             </div>

             <button @click="openBankEdit" class="text-sm text-gold-500 hover:text-gold-600 underline decoration-dotted underline-offset-4 mb-4 block mx-auto">
               {{ $t('group.edit_info') }}
             </button>

             <button @click="showBankDisplay = false" class="w-full py-3 bg-dark-800 text-white rounded-xl shadow-lg">{{ $t('common.close') }}</button>
           </div>
        </transition>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showBankEdit" class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
         <transition name="modal-content" appear>
           <div class="bg-white w-full max-w-xs rounded-2xl shadow-xl p-6">
             <h3 class="text-lg font-bold text-dark-800 mb-4">{{ $t('group.setup_payment_info') }}</h3>
             <div class="space-y-4">
                <div>
                  <label class="block text-xs uppercase text-gray-400 tracking-wider mb-1">{{ $t('group.bank_name_code') }}</label>
                  <input v-model="bankForm.bankName" class="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold-500 bg-transparent placeholder-gray-300" placeholder="e.g. Bank of America">
                </div>
                <div>
                  <label class="block text-xs uppercase text-gray-400 tracking-wider mb-1">{{ $t('group.account_label') }}</label>
                  <input v-model="bankForm.bankAccount" class="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold-500 bg-transparent placeholder-gray-300" placeholder="e.g. 123-456-789">
                </div>
             </div>
             <div class="flex gap-3 mt-8">
               <button @click="showBankEdit = false" class="flex-1 py-2 text-gray-400 text-sm">{{ $t('common.cancel') }}</button>
               <button @click="saveBankInfo" class="flex-1 py-2 bg-gold-500 text-white rounded-lg shadow-md hover:bg-gold-600">{{ $t('common.save') }}</button>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n(); // 引入翻譯函式
const store = useMainStore();
const route = useRoute();
const groupId = route.params.id;
const currentUser = auth.currentUser;
const group = ref(null);
const members = ref([]); 
const expenses = ref([]);
const selectedMember = ref('all');

// UI States
const showModal = ref(false);
const showSettlementPlan = ref(false);
const showBankDisplay = ref(false); 
const showBankEdit = ref(false);    
const showSettlementInfoModal = ref(false); 
const selectedPlan = ref(null);             

const isEditing = ref(false);
const editingId = ref(null);
const activeTab = ref('expense');
const form = ref({ name: '', amount: '', currency: 'TWD', splitWith: [] });
const bankForm = ref({ bankName: '', bankAccount: '' }); 
const transferTarget = ref(null);

// Tag System
const quickTags = ref(['Food', 'Transport', 'Hotel', 'Ticket']); 
const showTagMenu = ref(false);
const isAddingTag = ref(false);
const newTagInput = ref('');
const tagInputRef = ref(null);

const copyInviteLink = () => {
  const url = `${window.location.origin}/?invite=${groupId}`;
  navigator.clipboard.writeText(url);
  alert(t('group.invite_copied'));
};

onMounted(async () => {
  if(!store.userProfile && currentUser) await store.fetchUserProfile(currentUser.uid); 
  await store.fetchRates();
  
  const savedTags = localStorage.getItem('user_quick_tags');
  if (savedTags) quickTags.value = JSON.parse(savedTags);

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
    expenses.value = snapshot.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data };
    }).sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
    });
  });
});

const updateMembersList = async (memberIds) => {
  const promises = memberIds.map(async (uid) => {
      const userSnap = await getDoc(doc(db, "users", uid));
      const data = userSnap.exists() ? userSnap.data() : {};
      return { 
        uid, 
        nickname: uid === currentUser.uid ? t('common.me') : (data.nickname || t('common.unknown')),
        bankName: data.bankName || '',
        bankAccount: data.bankAccount || ''
      };
  });
  members.value = await Promise.all(promises);
};

// Bank Info Logic
const handleMyInfoClick = () => {
  if (store.userProfile?.bankAccount) {
    showBankDisplay.value = true;
  } else {
    bankForm.value = { bankName: '', bankAccount: '' };
    showBankEdit.value = true;
  }
};

const openBankEdit = () => {
  showBankDisplay.value = false;
  showSettlementInfoModal.value = false; 
  bankForm.value = { 
    bankName: store.userProfile?.bankName || '', 
    bankAccount: store.userProfile?.bankAccount || '' 
  };
  showBankEdit.value = true;
};

const saveBankInfo = async () => {
  if (!currentUser) return;
  await store.updateUserProfile(currentUser.uid, bankForm.value);
  showBankEdit.value = false;
  showBankDisplay.value = true;
};

const getMemberBank = (uid) => {
  const m = members.value.find(mem => mem.uid === uid);
  return {
    hasInfo: !!(m?.bankAccount),
    bankName: m?.bankName,
    bankAccount: m?.bankAccount
  };
};

// Calculation Logic
const totalGroupExpense = computed(() => {
  return expenses.value.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.settlementAmount || 0), 0);
});

const memberBalances = computed(() => {
  const bal = {};
  members.value.forEach(m => bal[m.uid] = 0);
  
  expenses.value.forEach(exp => {
    const amt = exp.settlementAmount || 0;
    const payer = exp.payerId;
    
    if (exp.type === 'settlement') {
       if (bal[payer] !== undefined) bal[payer] += amt;
       const target = exp.splitWith?.[0];
       if (target && bal[target] !== undefined) bal[target] -= amt;
    } else {
       if (bal[payer] !== undefined) bal[payer] += amt;
       
       const splitUsers = (exp.splitWith && exp.splitWith.length > 0) 
          ? exp.splitWith 
          : members.value.map(m => m.uid);
       
       const validSplitUsers = splitUsers.filter(uid => bal[uid] !== undefined);
       
       if (validSplitUsers.length > 0) {
         const share = amt / validSplitUsers.length;
         validSplitUsers.forEach(uid => { 
           if (bal[uid] !== undefined) bal[uid] -= share; 
         });
       }
    }
  });
  return bal;
});

const suggestedSettlements = computed(() => {
  const balances = { ...memberBalances.value };
  const debtors = [];
  const creditors = [];
  for (const [uid, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ uid, amount });
    else if (amount > 0.01) creditors.push({ uid, amount });
  }
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const plans = [];
  let dIndex = 0;
  let cIndex = 0;
  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];
    const settleAmount = Math.min(Math.abs(debtor.amount), creditor.amount);
    plans.push({ from: debtor.uid, to: creditor.uid, amount: settleAmount });
    debtor.amount += settleAmount;
    creditor.amount -= settleAmount;
    if (Math.abs(debtor.amount) < 0.01) dIndex++;
    if (creditor.amount < 0.01) cIndex++;
  }
  return plans;
});

const handlePlanClick = (plan) => {
  if (plan.from === currentUser.uid || plan.to === currentUser.uid) {
     selectedPlan.value = plan;
     showSettlementInfoModal.value = true;
     showSettlementPlan.value = false;
  }
};

const proceedToRecord = () => {
    isEditing.value = false;
    activeTab.value = 'settlement';
    form.value = { 
      name: 'Settlement', 
      amount: selectedPlan.value.amount.toFixed(2), 
      currency: group.value?.currency || 'TWD', 
      splitWith: [] 
    };
    transferTarget.value = selectedPlan.value.to;
    
    showSettlementInfoModal.value = false;
    showModal.value = true;
};

const filteredExpenses = computed(() => {
  if (selectedMember.value === 'all') return expenses.value;
  return expenses.value.filter(e => e.payerId === selectedMember.value);
});

const getDebtPercentage = (balance) => {
  if (balance >= 0) return 0;
  const minBal = Math.min(...Object.values(memberBalances.value));
  if (minBal === 0) return 0;
  return (Math.abs(balance) / Math.abs(minBal)) * 100;
};

const formatAmount = (val) => val ? val.toFixed(2) : '0.00';
const getMemberName = (uid) => members.value.find(m => m.uid === uid)?.nickname || t('common.unknown');
const otherMembers = computed(() => members.value.filter(m => m.uid !== currentUser.uid));
const canAddExpense = computed(() => selectedMember.value === 'all' || selectedMember.value === currentUser?.uid);
const convertedAmount = computed(() => {
  if (!form.value.amount || !group.value) return "0.00";
  const rate = store.getExchangeRate(form.value.currency, group.value.currency);
  return (form.value.amount * rate).toFixed(2);
});

const visibleTags = computed(() => quickTags.value.slice(0, 5));
const hiddenTags = computed(() => quickTags.value.slice(5));
const selectTag = (tag) => { form.value.name = tag; showTagMenu.value = false; };
const startAddTag = () => { isAddingTag.value = true; nextTick(() => tagInputRef.value?.focus()); };
const addNewTag = () => {
  const val = newTagInput.value.trim();
  if (val && !quickTags.value.includes(val)) {
     quickTags.value.push(val);
     form.value.name = val;
     localStorage.setItem('user_quick_tags', JSON.stringify(quickTags.value));
  }
  newTagInput.value = '';
  isAddingTag.value = false;
};

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
  if (activeTab.value === 'settlement' && !transferTarget.value) { alert(t('group.please_select_payee')); return; }
  
  const settlementAmt = parseFloat(convertedAmount.value);
  const isSettlement = activeTab.value === 'settlement';

  let finalSplitWith = [];
  
  if (isSettlement) {
    finalSplitWith = [transferTarget.value];
  } else {
    if (form.value.splitWith.length === 0) {
      finalSplitWith = members.value.map(m => m.uid);
    } else {
      finalSplitWith = form.value.splitWith;
    }
  }
  const payload = {
    groupId, 
    payerId: currentUser.uid, 
    name: isSettlement ? 'Settlement' : (form.value.name || 'Expense'),
    amount: form.value.amount, 
    currency: form.value.currency, 
    settlementAmount: settlementAmt,
    splitWith: finalSplitWith,
    type: isSettlement ? 'settlement' : 'expense', 
    createdAt: serverTimestamp()
  };

  if (isEditing.value) await updateDoc(doc(db, "expenses", editingId.value), payload);
  else await addDoc(collection(db, "expenses"), payload);
  
  showModal.value = false;
};

const deleteExpense = async (id) => { if(confirm(t('group.delete_trans_confirm'))) await deleteDoc(doc(db, "expenses", id)); };
</script>