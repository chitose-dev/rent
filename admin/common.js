// 管理画面共通JavaScript

// ========================================
// XSS対策：HTMLエスケープ
// ========================================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 安全なinnerHTML設定（テンプレートリテラル内で使用）
function safeHtml(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const escaped = (typeof value === 'string') ? escapeHtml(value) : (value ?? '');
    return result + escaped + str;
  });
}

// ========================================
// エラーハンドラ
// ========================================
const ErrorHandler = {
  messages: {
    'INTERNAL_ERROR': 'システムエラーが発生しました',
    'VALIDATION_ERROR': '入力内容に問題があります',
    'UNAUTHORIZED': 'ログインが必要です',
    'FORBIDDEN': 'アクセス権限がありません',
    'NOT_FOUND': 'データが見つかりません',
    'NETWORK_ERROR': 'ネットワークエラーです',
  },
  
  getMessage(error) {
    const code = error.code || '';
    const message = error.message || '';
    
    if (code && this.messages[code]) {
      return this.messages[code];
    }
    
    if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
      return this.messages['NETWORK_ERROR'];
    }
    
    return message || 'エラーが発生しました';
  },
  
  show(error) {
    alert(this.getMessage(error));
  }
};

// ========================================
// ローディング状態管理
// ========================================
const LoadingState = {
  startButton(button, text = '処理中...') {
    if (!button) return;
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = text;
  },
  
  endButton(button) {
    if (!button) return;
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
};

// API設定
const ADMIN_API_BASE = typeof API_BASE_URL !== 'undefined' 
  ? API_BASE_URL 
  : 'https://rentcar-backend-dgyxfpofua-an.a.run.app';

// 管理者認証管理
const AdminAuth = {
  REMEMBER_KEY: 'adminRememberMe',
  
  // ストレージ取得（rememberMe状態に応じて）
  getStorage() {
    if (localStorage.getItem(this.REMEMBER_KEY) === 'true') {
      return localStorage;
    }
    if (localStorage.getItem('adminToken')) {
      return localStorage;
    }
    return sessionStorage;
  },
  
  // ログイン保持設定
  setRememberMe(remember) {
    if (remember) {
      localStorage.setItem(this.REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(this.REMEMBER_KEY);
    }
  },
  
  // トークンを取得
  getToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  },
  
  // リフレッシュトークンを取得
  getRefreshToken() {
    return localStorage.getItem('adminRefreshToken') || sessionStorage.getItem('adminRefreshToken');
  },
  
  // トークンを保存
  saveTokens(token, refreshToken) {
    const storage = this.getStorage();
    storage.setItem('adminToken', token);
    storage.setItem('adminLoggedIn', 'true');
    if (refreshToken) {
      storage.setItem('adminRefreshToken', refreshToken);
    }
  },
  
  // 管理者情報を保存
  saveAdmin(admin) {
    const storage = this.getStorage();
    storage.setItem('adminId', admin.id);
    storage.setItem('adminEmail', admin.email);
    storage.setItem('adminName', admin.name || '');
  },
  
  // 管理者情報を取得
  getAdmin() {
    return {
      id: localStorage.getItem('adminId') || sessionStorage.getItem('adminId'),
      email: localStorage.getItem('adminEmail') || sessionStorage.getItem('adminEmail'),
      name: localStorage.getItem('adminName') || sessionStorage.getItem('adminName'),
    };
  },
  
  // ログイン状態を確認
  isLoggedIn() {
    return !!this.getToken();
  },
  
  // 認証チェック（ページ読み込み時）
  checkAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  
  // ログアウト
  logout() {
    // 両方のストレージからクリア
    ['adminToken', 'adminRefreshToken', 'adminLoggedIn', 'adminId', 'adminEmail', 'adminName'].forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    localStorage.removeItem(this.REMEMBER_KEY);
    window.location.href = 'login.html';
  },
  
  // トークンリフレッシュ
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const response = await fetch(`${ADMIN_API_BASE}/v1/admin/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      if (data.token || data.data?.token) {
        const token = data.token || data.data.token;
        const newRefresh = data.refreshToken || data.data?.refreshToken;
        this.saveTokens(token, newRefresh);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};

// API通信ヘルパー（認証付き）
// config.jsで定義されていない場合のみ定義
const AdminAPI = {
  // 基本リクエスト
  async request(method, url, body = null) {
    const token = AdminAuth.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const fullUrl = url.startsWith('http') ? url : `${ADMIN_API_BASE}${url}`;
    let response = await fetch(fullUrl, options);
    
    // 401の場合はトークンリフレッシュを試みる
    if (response.status === 401) {
      const refreshed = await AdminAuth.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${AdminAuth.getToken()}`;
        response = await fetch(fullUrl, { method, headers, body: options.body });
      } else {
        AdminAuth.logout();
        throw new Error('セッションが切れました。再度ログインしてください。');
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error?.message || data.message || `HTTP ${response.status}`);
      error.code = data.error?.code || '';
      throw error;
    }
    
    return data.data !== undefined ? data.data : data;
  },
  
  // GET
  async get(url) {
    return this.request('GET', url);
  },
  
  // POST
  async post(url, body) {
    return this.request('POST', url, body);
  },
  
  // PUT
  async put(url, body) {
    return this.request('PUT', url, body);
  },
  
  // PATCH
  async patch(url, body) {
    return this.request('PATCH', url, body);
  },
  
  // DELETE
  async delete(url) {
    return this.request('DELETE', url);
  }
};

// 管理画面用APIエイリアス（常にAdminAPIを使う）
// グローバルにAPIを設定（constでの再定義問題を回避）
window.API = AdminAPI;

// ========================================
// モーダル操作（共通）
// ========================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// 後方互換性のための関数
function checkAdminAuth() {
  return AdminAuth.checkAuth();
}

function adminLogout() {
  AdminAuth.logout();
}

// ページ読み込み時にログインチェック（login.html以外）
if (!window.location.pathname.endsWith('login.html')) {
  checkAdminAuth();
}

// ========================================
// キーボードアクセシビリティ
// ========================================

// Escapeキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // アクティブなモーダルを全て閉じる
    document.querySelectorAll('.modal-overlay.active').forEach(function(modal) {
      modal.classList.remove('active');
    });
  }
});

// ========================================

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
  
  // サイドバーがない場合（ログイン画面等）は以降の処理をスキップ
  if (!sidebar) {
    return;
  }
  
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
