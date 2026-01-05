<script setup>
</script>

<template>
  <div class="bg-dark-100 min-h-screen text-dark-800 antialiased selection:bg-gold-500 selection:text-white">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>