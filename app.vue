<template>
  <div class="page-wrap">
    <NuxtRouteAnnouncer />
    <BookFlip />
  </div>
</template>

<style>
html, body, #__nuxt {
  height: 100%;
  margin: 0;
}

body {
  background: radial-gradient(circle at 50% 20%, #2b2b3d 0%, #14141f 70%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>
