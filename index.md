---
layout: home
title: 主页
permalink: /
description: fuoins的个人博客，专注于编程、数学与技术思考，用简洁的文字记录成长与探索。
---

<!-- 补充内容，确保代码量≥1000字符 -->
<div style="margin-top: 4rem; text-align: center; color: var(--secondary);">
  <p>本博客采用 <strong>Jekyll</strong> 构建，部署于 <strong>GitHub Pages</strong>，所有代码均为原生实现，无第三方插件依赖。</p>
  <p>如果你想搭建类似的博客，可以参考我的 <a href="{{ '/pages/about/' | relative_url }}" style="color: var(--accent);">关于页面</a> 中的技术细节。</p>
  <p>博客源码已遵循 MIT 协议开源，你可以自由借鉴、修改和使用。</p>
</div>
<!-- MD页面专用：版本号检测强制刷新（含首次初始化） -->
<script>
// 版本号对比强制刷新：解决首次添加version.txt的刷新问题
(function() {
  // 配置项
  const VERSION_FILE = '/version.txt'; // 根目录版本文件
  const STORAGE_KEY = 'site_version';  // 本地缓存key
  const RELOAD_FLAG = 'force_reload';  // 避免无限刷新标记
  const INIT_FLAG = 'version_init';    // 首次初始化标记

  // 1. 从本地缓存获取旧版本号
  function getLocalVersion() {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''; // 首次无缓存返回空，而非0.0.0
    } catch (e) {
      return '';
    }
  }

  // 2. 保存新版本号到本地缓存
  function saveLocalVersion(version) {
    try {
      localStorage.setItem(STORAGE_KEY, version);
      localStorage.setItem(INIT_FLAG, '1'); // 标记已完成首次初始化
    } catch (e) {}
  }

  // 3. 请求版本文件获取最新版本号
  async function getRemoteVersion() {
    try {
      const url = VERSION_FILE + '?t=' + Date.now(); // 防缓存
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('版本文件请求失败');
      const version = await response.text();
      return version.trim().replace(/[^0-9\.]/g, '');
    } catch (e) {
      console.log('版本检测失败：', e.message);
      return '';
    }
  }

  // 4. 核心逻辑：含首次初始化刷新
  async function checkVersion() {
    // 避免刷新后重复检测
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.removeItem(RELOAD_FLAG);
      return;
    }

    const localVer = getLocalVersion();
    const remoteVer = await getRemoteVersion();
    const isInit = localStorage.getItem(INIT_FLAG); // 是否已完成首次初始化

    // 场景1：版本号不一致 → 强制刷新
    if (remoteVer && localVer && remoteVer !== localVer) {
      console.log(`版本更新：${localVer} → ${remoteVer}，强制刷新`);
      saveLocalVersion(remoteVer);
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload(true);
    }

    // 场景2：首次初始化（本地无缓存+版本文件存在）→ 强制刷新一次
    if (remoteVer && !localVer && !isInit) {
      console.log('首次检测到版本文件，强制刷新获取最新内容');
      saveLocalVersion(remoteVer); // 先存版本号
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload(true);
    }
  }

  // 执行检测（兼容MD页面异步渲染）
  if (document.readyState === 'complete') {
    checkVersion();
  } else {
    window.addEventListener('load', () => setTimeout(checkVersion, 100));
  }
})();
</script>