import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
  },
  {
    path: '/test-local',
    name: 'TestLocal',
    component: () => import('../test-local-dictionary.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
