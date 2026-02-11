// 管理画面共通JavaScript

// ログインチェック（login.html以外で実行）
function checkAdminAuth() {
  if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ログアウト処理
function adminLogout() {
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminId');
  window.location.href = 'login.html';
}

// ページ読み込み時にログインチェック
if (!window.location.pathname.endsWith('login.html')) {
  checkAdminAuth();
}

// ハンバーガーメニュー
document.addEventListener('DOMContentLoaded', function() {
  // メニューボタンとオーバーレイを動的に追加
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<span></span><span></span><span></span>';
  menuToggle.setAttribute('aria-label', 'メニューを開く');
  document.body.appendChild(menuToggle);
  
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);
  
  const sidebar = document.querySelector('.admin-sidebar');
  
  // メニュー開閉
  function toggleMenu() {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }
  
  menuToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);
  
  // サイドバー内のリンクをクリックしたら閉じる
  sidebar.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        toggleMenu();
      }
    });
  });
  
  // リサイズ時に状態をリセット
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      menuToggle.classList.remove('active');
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});
