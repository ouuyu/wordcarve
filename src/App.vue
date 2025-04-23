<script setup lang="ts">
import { IconApps, IconBook, IconMessage, IconMoon, IconSun, IconUser } from '@arco-design/web-vue/es/icon'

import { computed, provide, ref, watchEffect } from 'vue'

// 使用计算属性简化深色模式逻辑

const isDark = ref(localStorage.getItem('theme') === 'dark')

const themeClass = computed(() => isDark.value ? 'dark-theme' : 'light-theme')

provide('isDark', isDark)

watchEffect(() => {
  document.body.setAttribute('arco-theme', isDark.value ? 'dark' : 'light')

  document.documentElement.classList.toggle('dark', isDark.value)

  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function toggleTheme() {
  isDark.value = !isDark.value
}

// 导航菜单项

const navItems = [

  { icon: IconBook, label: '词书', link: '/' },

  { icon: IconMessage, label: '问答', link: '/qa' },

]
</script>

<template>
  <div :class="themeClass" class="app-container">
    <a-layout class="layout-container">
      <!-- 顶部导航栏 -->

      <a-layout-header class="header">
        <!-- Logo 区域 -->

        <div class="logo-container">
          <div class="logo-icon">
            <IconApps />
          </div>

          <div class="logo-text">
            一日千词
          </div>
        </div>

        <!-- 导航区域 -->

        <div class="nav-container">
          <div class="nav-links">
            <a

              v-for="(item, index) in navItems"

              :key="index"

              :href="item.link"

              class="nav-link"
            >

              <component :is="item.icon" class="nav-icon" />

              <span>{{ item.label }}</span>

            </a>
          </div>

          <!-- 用户操作区域 -->

          <div class="user-actions">
            <a-button class="theme-toggle" shape="circle" @click="toggleTheme">
              <template #icon>
                <IconMoon v-if="!isDark" />

                <IconSun v-else />
              </template>
            </a-button>

            <a-dropdown trigger="click">
              <a-avatar class="user-avatar">
                <template #icon>
                  <IconUser />
                </template>
              </a-avatar>

              <template #content>
                <a-doption>个人中心</a-doption>

                <a-doption>设置</a-doption>

                <a-doption>退出登录</a-doption>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <!-- 主内容区域 -->

      <a-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>

      <!-- 页脚 -->

      <a-layout-footer class="footer">
        <div class="footer-content">
          <span>词刻 ©2025 — 保留所有权利</span>

          <div class="footer-links">
            <a href="#">隐私政策</a>

            <a href="#">使用条款</a>

            <a href="#">联系我们</a>
          </div>
        </div>
      </a-layout-footer>
    </a-layout>

    Use code with caution.
  </div>
</template>

<style>
:root {

--primary-color: rgb(var(--primary-6));

--text-primary: #333;

--text-secondary: #666;

--bg-primary: #f8f6f2;

--bg-secondary: #fff;

--header-height: 64px;

--footer-height: 48px;

--border-radius: 8px;

--transition-speed: 0.3s;

--shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

}

.dark-theme {

--text-primary: #e0e0e0;

--text-secondary: #aaa;

--bg-primary: #1d2025;

--bg-secondary: #282c34;

--shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

}

/* 基础样式重置 */

html, body {

margin: 0;

padding: 0;

font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

}

/* 应用容器 */

.app-container {

min-height: 100vh;

background-color: var(--bg-primary);

color: var(--text-primary);

transition: background-color var(--transition-speed), color var(--transition-speed);

}

.layout-container {

height: 100vh;

width: 100vw;

overflow: hidden;

display: flex;

flex-direction: column;

}

/* 顶部导航栏 */

.header {

height: var(--header-height);

background-color: var(--bg-secondary);

box-shadow: var(--shadow);

display: flex;

align-items: center;

justify-content: space-between;

padding: 0 24px;

transition: background-color var(--transition-speed), box-shadow var(--transition-speed);

z-index: 10;

}

.logo-container {

display: flex;

align-items: center;

}

.logo-icon {

width: 40px;

height: 40px;

border-radius: var(--border-radius);

background-color: var(--primary-color);

color: white;

display: flex;

align-items: center;

justify-content: center;

margin-right: 12px;

transition: transform 0.3s ease;

}

.logo-icon:hover {

transform: rotate(10deg);

}

.logo-text {

font-size: 20px;

font-weight: 700;

background: linear-gradient(90deg, var(--primary-color), #4a8eff);

-webkit-background-clip: text;

-webkit-text-fill-color: transparent;

}

.nav-container {

display: flex;

align-items: center;

}

.nav-links {

display: flex;

gap: 24px;

margin-right: 24px;

}

.nav-link {

display: flex;

align-items: center;

gap: 6px;

color: var(--text-secondary);

text-decoration: none;

font-weight: 500;

padding: 8px 12px;

border-radius: var(--border-radius);

transition: all var(--transition-speed);

}

.nav-link:hover {

color: var(--primary-color);

background-color: rgba(var(--primary-6), 0.05);

}

.nav-icon {

font-size: 18px;

}

.user-actions {

display: flex;

align-items: center;

gap: 16px;

}

.theme-toggle {

background: transparent;

border: none;

color: var(--text-secondary);

transition: all var(--transition-speed);

}

.theme-toggle:hover {

color: var(--primary-color);

transform: rotate(30deg);

}

.user-avatar {

cursor: pointer;

background-color: rgba(var(--primary-6), 0.1);

color: var(--primary-color);

transition: transform var(--transition-speed);

}

.user-avatar:hover {

transform: scale(1.1);

}

/* 内容区域 */

.content {

flex: 1;

overflow: auto;

padding: 24px;

background-color: var(--bg-primary);

transition: background-color var(--transition-speed);

}

/* 页脚 */

.footer {

height: var(--footer-height);

background-color: var(--bg-secondary);

display: flex;

align-items: center;

justify-content: center;

padding: 0 24px;

transition: background-color var(--transition-speed);

border-top: 1px solid rgba(0, 0, 0, 0.05);

}

.dark-theme .footer {

border-top: 1px solid rgba(255, 255, 255, 0.05);

}

.footer-content {

width: 100%;

display: flex;

justify-content: space-between;

align-items: center;

font-size: 14px;

color: var(--text-secondary);

}

.footer-links {

display: flex;

gap: 16px;

}

.footer-links a {

color: var(--text-secondary);

text-decoration: none;

transition: color var(--transition-speed);

}

.footer-links a:hover {

color: var(--primary-color);

}

/* 过渡动画 */

.fade-enter-active,

.fade-leave-active {

transition: opacity 0.3s ease;

}

.fade-enter-from,

.fade-leave-to {

opacity: 0;

}
</style>
