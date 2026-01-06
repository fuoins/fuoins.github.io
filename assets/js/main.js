// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 隐藏加载动画
  const loaderWrapper = document.querySelector('.loader-wrapper');
  setTimeout(function() {
    loaderWrapper.style.opacity = '0';
    setTimeout(function() {
      loaderWrapper.style.display = 'none';
    }, 500);
  }, 800);

  // 移动端菜单切换
  const menuToggle = document.querySelector('.menu-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');

  menuToggle.addEventListener('click', function() {
    navbarMenu.classList.toggle('show');
    // 切换图标
    const icon = menuToggle.querySelector('i');
    if (navbarMenu.classList.contains('show')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });

  // 点击菜单链接关闭菜单
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navbarMenu.classList.remove('show');
      const icon = menuToggle.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    });
  });

  // 回到顶部按钮
  const backToTopButton = document.getElementById('back-to-top');

  // 监听滚动事件
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });

  // 点击回到顶部
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // 数学公式渲染完成后的处理
  if (window.MathJax) {
    MathJax.startup.promise.then(() => {
      // 为公式添加触摸支持（移动端）
      const mathElements = document.querySelectorAll('.math-display');
      mathElements.forEach(el => {
        el.style.touchAction = 'pan-x';
      });
    });
  }

  // 图片懒加载 (基础实现)
  const images = document.querySelectorAll('img');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src') || img.src;
        img.src = src;
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => {
    imageObserver.observe(img);
  });

  // 响应式调整
  function handleResize() {
    // 重新渲染数学公式
    if (window.MathJax) {
      MathJax.typeset();
    }

    // 关闭移动端菜单
    if (window.innerWidth > 768 && navbarMenu.classList.contains('show')) {
      navbarMenu.classList.remove('show');
      const icon = menuToggle.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);

  // 初始化
  handleResize();

  // 添加页面访问统计 (可选)
  console.log('Page loaded successfully - fuoins.github.io');
});

// 错误处理
window.addEventListener('error', function(e) {
  console.error('Error occurred:', e.message);
});

// 离线检测
window.addEventListener('offline', function() {
  alert('您已离线，部分功能可能无法正常使用！');
});