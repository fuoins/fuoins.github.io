/* ===========================================================
 * sw-registration.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */

// SW Version Upgrade Ref: <https://youtu.be/Gb9uI67tqV0>

function handleRegistration(registration){
  console.log('Service Worker Registered. ', registration)
  /**
   * ServiceWorkerRegistration.onupdatefound
   * The service worker registration's installing worker changes.
   */
  registration.onupdatefound = (e) => {
    const installingWorker = registration.installing;
    installingWorker.onstatechange = (e) => {
      if (installingWorker.state !== 'installed') return;
      if (navigator.serviceWorker.controller) {
        console.log('SW is updated');
      } else {
        console.log('A Visit without previous SW');
        createSnackbar({
          message: 'App ready for offline use.',
          duration: 3000
        })
      }
    };
  }
}

if(navigator.serviceWorker){
  // For security reasons, a service worker can only control the pages
  // that are in the same directory level or below it. That's why we put sw.js at ROOT level.
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => handleRegistration(registration))
    .catch((error) => {console.log('ServiceWorker registration failed: ', error)})

  // register message receiver
  // https://dbwriteups.wordpress.com/2015/11/16/service-workers-part-3-communication-between-sw-and-pages/
  navigator.serviceWorker.onmessage = (e) => {
    console.log('SW: SW Broadcasting:', event);
    const data = e.data
    
    if(data.command == "UPDATE_FOUND"){
  console.log("UPDATE_FOUND_BY_SW", data);
  // 打印更新日志后，直接触发页面自动刷新
  location.reload();
  // 若想先提示再自动刷新（提升用户体验），可保留提示并添加延迟刷新逻辑：
  // createSnackbar({
  //   message: "Content updated, refreshing automatically...",
  //   duration: 2000 // 提示显示2秒后自动刷新
  // });
  // setTimeout(() => location.reload(), 2000);
}

}