<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96 text-center">
      <h1 class="text-2xl font-bold mb-6">Split Bill App</h1>
      <button @click="signInWithGoogle" class="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
        Sign in with Google
      </button>
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