// 移动端汉堡菜单交互
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      // 汉堡菜单动画
      const lines = document.querySelectorAll('.hamburger-line');
      lines.forEach((line, index) => {
        line.classList.toggle(`active-${index+1}`);
      });
      // 禁止/允许页面滚动
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
    
    // 点击移动端菜单链接关闭菜单
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  // 数学公式渲染后适配宽度
  if (window.MathJax) {
    MathJax.startup.promise.then(() => {
      const mathElements = document.querySelectorAll('.MJX-TEX');
      mathElements.forEach(el => {
        el.style.maxWidth = '100%';
        el.style.overflowX = 'auto';
        // 给超长公式添加滚动提示
        if (el.scrollWidth > el.clientWidth) {
          el.style.cursor = 'ew-resize';
          el.title = '横向滚动查看完整公式';
        }
      });
    });
  }

  // 平滑滚动增强
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 图片懒加载（基础实现）
  const images = document.querySelectorAll('img');
  const lazyLoad = target => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src') || img.src;
          img.src = src;
          observer.disconnect();
        }
      });
    });
    io.observe(target);
  };
  images.forEach(lazyLoad);

  // 页面滚动时页眉样式变化
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        header.style.padding = '0.75rem 0';
      } else {
        header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        header.style.padding = '1rem 0';
      }
    });
  }
});