<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-100 p-6 relative overflow-hidden">
    <div class="absolute top-1/4 -left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
    <div class="absolute bottom-1/4 -right-10 w-72 h-72 bg-gold-400 rounded-full blur-3xl opacity-10"></div>

    <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center relative z-10 border border-gray-50">
      <div class="w-20 h-20 bg-dark-800 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-gold-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
        <span class="text-4xl">💸</span>
      </div>

      <h1 class="text-3xl font-light text-dark-900 mb-2 tracking-wide">Split Bill</h1>
      <p class="text-gray-400 text-sm mb-10 font-light">Simplify your group expenses</p>
      
      <button 
        @click="signInWithGoogle" 
        class="group w-full bg-dark-800 text-white p-4 rounded-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-dark-800/10 flex items-center justify-center gap-4 border border-transparent hover:border-gold-500/30 cursor-pointer"
      >
        <svg class="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span class="font-medium tracking-wide group-hover:text-gold-400 transition-colors">Sign in with Google</span>
      </button>

      <div class="mt-8 flex items-center justify-center gap-2 opacity-50">
        <div class="h-px w-8 bg-gray-300"></div>
        <span class="text-[10px] text-gray-400 uppercase tracking-widest">Secure Login</span>
        <div class="h-px w-8 bg-gray-300"></div>
      </div>
    </div>

    <div class="absolute bottom-6 text-xs text-gray-300 font-mono">
      v1.0.0
    </div>
  </div>
</template>

<script setup>
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useRouter } from "vue-router";
// 修改開頭: 引入 Store
import { useMainStore } from "./main";

const router = useRouter();
const store = useMainStore();

const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    
    // 檢查是否有 pending invite
    const inviteGroupId = await store.handlePendingInvite();
    if (inviteGroupId) {
      router.push(`/group/${inviteGroupId}`);
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error(error);
  }
};
// 修改結尾
</script>