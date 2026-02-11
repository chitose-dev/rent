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
