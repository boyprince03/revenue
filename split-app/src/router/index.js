// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Login.vue') },
    { path: '/onboarding', component: () => import('../views/Onboarding.vue') },
    { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
    { path: '/rates', component: () => import('../views/RatesConfig.vue') },
    { path: '/group/:id', component: () => import('../views/GroupDetail.vue') },
  ]
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth, 
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  // 修改開頭: 攔截 invite 參數並存入 localStorage
  if (to.query.invite) {
    localStorage.setItem('pending_invite', to.query.invite);
  }
  // 修改結尾

  const user = await getCurrentUser();
  if (to.path === '/' && user) {
     next('/dashboard');
     return;
  }
  
  if (!user && to.path !== '/') {
    next('/');
    return;
  }

  // Check if onboarding is done
  if (user && to.path !== '/onboarding') {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (!docSnap.exists()) {
      next('/onboarding');
      return;
    }
  }

  next();
});

export default router