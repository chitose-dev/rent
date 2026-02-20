// API設定
const API_BASE_URL = 'https://rentcar-backend-dgyxfpofua-an.a.run.app';

// AppConfig（後方互換性のため）
const AppConfig = {
  API_BASE_URL: API_BASE_URL
};

// API呼び出しユーティリティ
const API = {
  baseUrl: API_BASE_URL,
  
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
  
  _isRefreshing: false,
  _refreshPromise: null,
  
  async request(endpoint, options = {}, retried = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 認証トークンがあれば追加
    const token = sessionStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 401エラー時はトークンリフレッシュを試みる
    if (response.status === 401 && !retried && !endpoint.includes('/auth/')) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request(endpoint, options, true);
      }
      // リフレッシュ失敗時はログアウト
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userData');
      window.location.href = 'login.html';
      throw new Error('セッションが期限切れです。再度ログインしてください。');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API Error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },
  
  async tryRefreshToken() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    // 既にリフレッシュ中なら待つ
    if (this._isRefreshing) {
      return this._refreshPromise;
    }
    
    this._isRefreshing = true;
    this._refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        if (data.accessToken) {
          sessionStorage.setItem('authToken', data.accessToken);
          if (data.refreshToken) {
            sessionStorage.setItem('refreshToken', data.refreshToken);
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this._isRefreshing = false;
        this._refreshPromise = null;
      }
    })();
    
    return this._refreshPromise;
  }
};
