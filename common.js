// ========================================
// セッションストレージ管理
// ========================================

const ReservationStorage = {
  KEY: 'reservationData',
  
  // 予約データを保存
  save(data) {
    const current = this.get() || {};
    const updated = { ...current, ...data };
    sessionStorage.setItem(this.KEY, JSON.stringify(updated));
    return updated;
  },
  
  // 予約データを取得
  get() {
    const data = sessionStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  },
  
  // 予約データをクリア
  clear() {
    sessionStorage.removeItem(this.KEY);
  },
  
  // 特定のフィールドを取得
  getField(key) {
    const data = this.get();
    return data ? data[key] : null;
  }
};

// ========================================
// 設定値（APIから取得）
// ========================================

const AppConfig = {
  // API URL（後方互換性）
  API_BASE_URL: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://rentcar-backend-dgyxfpofua-an.a.run.app',
  
  // 営業時間（デフォルト値、APIから取得で上書き）
  openTime: '09:00',
  closeTime: '18:00',
  timeStepMinutes: 15,
  
  // 予約可能期間
  maxFutureMonths: 6,
  
  // マスターデータ（APIから取得）
  carClasses: [],
  pricingPlans: [],
  options: [],
  insurancePlans: [],
  
  // 予約不可日
  disabledDates: [],
  
  // データ読み込み状態
  _loaded: false,
  
  // APIからマスターデータを読み込む
  async loadMasterData() {
    if (this._loaded) return;
    
    try {
      // 並列でAPIを呼び出し
      const [carClassesRes, optionsRes, insuranceRes] = await Promise.all([
        API.get('/v1/car-classes'),
        API.get('/v1/options'),
        API.get('/v1/insurance-plans')
      ]);
      
      this.carClasses = carClassesRes.data || [];
      this.options = optionsRes.data || [];
      this.insurancePlans = insuranceRes.data || [];
      
      // 各車両クラスの料金プランを取得
      const pricingPromises = this.carClasses.map(async (carClass) => {
        try {
          const res = await API.get(`/v1/car-classes/${carClass.id}/pricing`);
          return (res.data || []).map(plan => ({
            ...plan,
            carClassId: carClass.id
          }));
        } catch (e) {
          console.warn(`Failed to load pricing for ${carClass.id}:`, e);
          return [];
        }
      });
      
      const allPricing = await Promise.all(pricingPromises);
      this.pricingPlans = allPricing.flat();
      
      // 重複排除（同じcarClassId + daysの組み合わせは1つだけ残す）
      const seen = new Set();
      this.pricingPlans = this.pricingPlans.filter(plan => {
        const key = `${plan.carClassId}-${plan.days}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      // オプションの重複排除（同じ名前は1つだけ残す）
      const seenOptions = new Set();
      this.options = this.options.filter(opt => {
        if (seenOptions.has(opt.name)) return false;
        seenOptions.add(opt.name);
        return true;
      });
      
      this._loaded = true;
      console.log('Master data loaded:', {
        carClasses: this.carClasses.length,
        pricingPlans: this.pricingPlans.length,
        options: this.options.length,
        insurancePlans: this.insurancePlans.length
      });
    } catch (error) {
      console.error('Failed to load master data:', error);
      // フォールバック: ローカルのデフォルト値を使用
      this._loadFallbackData();
    }
  },
  
  // フォールバックデータ（API失敗時）
  _loadFallbackData() {
    this.carClasses = [
      { id: 'class-kei', name: '軽自動車クラス', description: '街乗りに最適なコンパクトカー', notes: '4人乗り / オートマ / ナビ付き', imageUrl: null },
      { id: 'class-compact', name: 'コンパクトクラス', description: '小回りが利いて運転しやすい', notes: '5人乗り / オートマ / ナビ付き', imageUrl: null },
      { id: 'class-standard', name: 'スタンダードクラス', description: '広々快適な定番セダン', notes: '5人乗り / オートマ / ナビ・ETC付き', imageUrl: null },
      { id: 'class-minivan', name: 'ミニバンクラス', description: '大人数・荷物多めにおすすめ', notes: '7-8人乗り / オートマ / ナビ・ETC付き', imageUrl: null }
    ];
    this.pricingPlans = [
      { carClassId: 'class-kei', days: 1, price: 4000, label: '1日' },
      { carClassId: 'class-kei', days: 3, price: 10500, label: '3日' },
      { carClassId: 'class-kei', days: 7, price: 22000, label: '1週間' },
      { carClassId: 'class-compact', days: 1, price: 5000, label: '1日' },
      { carClassId: 'class-compact', days: 3, price: 13500, label: '3日' },
      { carClassId: 'class-compact', days: 7, price: 28000, label: '1週間' },
      { carClassId: 'class-standard', days: 1, price: 6500, label: '1日' },
      { carClassId: 'class-standard', days: 3, price: 18000, label: '3日' },
      { carClassId: 'class-standard', days: 7, price: 38000, label: '1週間' },
      { carClassId: 'class-minivan', days: 1, price: 8500, label: '1日' },
      { carClassId: 'class-minivan', days: 3, price: 24000, label: '3日' },
      { carClassId: 'class-minivan', days: 7, price: 52000, label: '1週間' }
    ];
    this.options = [
      { id: 'opt-child', name: 'チャイルドシート', description: '0〜4歳向け', pricePerDay: 500, maxQuantity: 2 },
      { id: 'opt-junior', name: 'ジュニアシート', description: '4〜10歳向け', pricePerDay: 500, maxQuantity: 2 },
      { id: 'opt-snow', name: 'スタッドレスタイヤ', description: '冬季限定', pricePerDay: 1000, maxQuantity: 1 },
      { id: 'opt-carrier', name: 'キャリア', description: '屋根に取り付け', pricePerDay: 800, maxQuantity: 1 }
    ];
    this.insurancePlans = [
      { id: 'none', name: '補償なし', description: '基本補償なし、全額自己負担', pricePerDay: 0, deductible: null },
      { id: 'standard', name: 'スタンダード補償', description: '対人・対物・車両保険付き', pricePerDay: 1100, deductible: 50000 },
      { id: 'premium', name: 'プレミアム補償', description: 'フル補償 + NOC + ロードサービス', pricePerDay: 2200, deductible: 0 }
    ];
    this._loaded = true;
    console.log('Using fallback master data');
  }
};

// ========================================
// ユーティリティ関数
// ========================================

const Utils = {
  // 日付フォーマット YYYY-MM-DD
  formatDate(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 日付フォーマット YYYY年MM月DD日
  formatDateJP(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  },
  
  // 日時フォーマット YYYY-MM-DD HH:mm
  formatDateTime(datetime) {
    if (typeof datetime === 'string') {
      datetime = new Date(datetime);
    }
    const date = this.formatDate(datetime);
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    return `${date} ${hours}:${minutes}`;
  },
  
  // 日時フォーマット YYYY年MM月DD日 HH:mm
  formatDateTimeJP(datetime) {
    if (typeof datetime === 'string') {
      datetime = new Date(datetime);
    }
    const date = this.formatDateJP(datetime);
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    return `${date} ${hours}:${minutes}`;
  },
  
  // 日付加算
  addDays(date, days) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  // 時間選択肢生成
  generateTimeOptions(startTime = '09:00', endTime = '18:00', stepMinutes = 15) {
    const options = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let hour = startHour;
    let minute = startMin;
    
    while (hour < endHour || (hour === endHour && minute <= endMin)) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(timeStr);
      
      minute += stepMinutes;
      if (minute >= 60) {
        minute = 0;
        hour++;
      }
    }
    
    return options;
  },
  
  // 金額フォーマット
  formatPrice(price) {
    return `¥${price.toLocaleString()}`;
  },
  
  // 日付が予約不可かチェック
  isDateDisabled(date) {
    const dateStr = this.formatDate(date);
    
    // 過去日チェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return true;
    }
    
    // 6ヶ月以降チェック
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + AppConfig.maxFutureMonths);
    if (date > maxDate) {
      return true;
    }
    
    // 予約不可日チェック
    if (AppConfig.disabledDates.includes(dateStr)) {
      return true;
    }
    
    return false;
  },
  
  // 車両クラス情報取得
  getCarClass(classId) {
    return AppConfig.carClasses.find(c => c.id === classId);
  },
  
  // 料金プラン取得
  getPricingPlans(classId) {
    return AppConfig.pricingPlans.filter(p => p.carClassId === classId);
  }
};

// ========================================
// フォームバリデーション
// ========================================

const Validator = {
  // 必須チェック
  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  // メールアドレスチェック
  email(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },
  
  // 電話番号チェック
  phone(value) {
    const regex = /^[0-9]{10,11}$/;
    return regex.test(value.replace(/-/g, ''));
  },
  
  // エラー表示
  showError(fieldId, message) {
    const group = document.querySelector(`#${fieldId}`).closest('.form-group');
    group.classList.add('error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
    }
  },
  
  // エラークリア
  clearError(fieldId) {
    const group = document.querySelector(`#${fieldId}`).closest('.form-group');
    group.classList.remove('error');
  },
  
  // 全エラークリア
  clearAllErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
    });
  }
};

// ========================================
// DOM操作ユーティリティ
// ========================================

const DOM = {
  // ハンバーガーメニュー初期化
  initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.header-nav');
    
    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
      });
    }
  },
  
  // タブ切り替え
  switchTab(tabName) {
    const tabs = document.querySelectorAll('.mypage-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  },
  
  // ローディング表示/非表示
  showLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
      loading.classList.add('active');
    }
  },
  
  hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
      loading.classList.remove('active');
    }
  }
};

// ========================================
// 認証管理
// ========================================

const Auth = {
  TOKEN_KEY: 'authToken',
  REFRESH_KEY: 'refreshToken',
  USER_KEY: 'userData',
  
  // トークン保存
  saveTokens(accessToken, refreshToken) {
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) {
      sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
    }
  },
  
  // ユーザー情報保存
  saveUser(user) {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  
  // トークン取得
  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },
  
  // リフレッシュトークン取得
  getRefreshToken() {
    return sessionStorage.getItem(this.REFRESH_KEY);
  },
  
  // ユーザー情報取得
  getUser() {
    const data = sessionStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  // ログイン状態確認
  isLoggedIn() {
    return !!this.getToken();
  },
  
  // ログアウト
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    ReservationStorage.clear();
  },
  
  // ログインページへリダイレクト
  redirectToLogin() {
    window.location.href = 'login.html';
  },
  
  // 認証チェック（未ログインならリダイレクト）
  requireAuth() {
    if (!this.isLoggedIn()) {
      this.redirectToLogin();
      return false;
    }
    return true;
  },
  
  // ログイン処理
  async login(email, password) {
    const result = await API.post('/v1/auth/login', { email, password });
    
    if (result.accessToken) {
      this.saveTokens(result.accessToken, result.refreshToken);
      if (result.user) {
        this.saveUser(result.user);
      }
    }
    
    return result;
  },
  
  // 新規登録処理
  async register(data) {
    return await API.post('/v1/auth/register', data);
  },
  
  // メール確認
  async verifyEmail(userId, code) {
    return await API.post('/v1/auth/verify-email', { userId, code });
  },
  
  // パスワードリセット要求
  async forgotPassword(email) {
    return await API.post('/v1/auth/forgot-password', { email });
  },
  
  // プロフィール取得
  async getProfile() {
    return await API.get('/v1/me');
  },
  
  // プロフィール更新
  async updateProfile(data) {
    return await API.put('/v1/me', data);
  },
  
  // パスワード変更
  async changePassword(currentPassword, newPassword) {
    return await API.post('/v1/me/change-password', { currentPassword, newPassword });
  },
  
  // 退会
  async withdraw(password, reason) {
    return await API.delete('/v1/me', {
      body: JSON.stringify({ password, reason }),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // トークン更新
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const result = await API.post('/v1/auth/refresh', { refreshToken });
    if (result.accessToken) {
      this.saveTokens(result.accessToken, result.refreshToken);
    }
    return result;
  }
};

// ========================================
// 予約API
// ========================================

const ReservationAPI = {
  // 予約作成
  async create(data) {
    return await API.post('/v1/reservations', data);
  },
  
  // 予約一覧取得
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status) query.set('status', params.status);
    
    const queryStr = query.toString();
    return await API.get(`/v1/reservations${queryStr ? '?' + queryStr : ''}`);
  },
  
  // 予約詳細取得
  async get(id) {
    return await API.get(`/v1/reservations/${id}`);
  },
  
  // キャンセル申請
  async cancel(id, reason) {
    return await API.post(`/v1/reservations/${id}/cancel`, { reason });
  },
  
  // 返却予定更新
  async updatePlannedReturn(id, plannedReturnAt) {
    return await API.put(`/v1/reservations/${id}/planned-return`, { plannedReturnAt });
  }
};

// ========================================
// ページ初期化
// ========================================

// ========================================
// グローバル関数（後方互換性）
// ========================================

// ハンバーガーメニュートグル（onclick用）
function toggleMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header-nav');
  if (hamburger && nav) {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  }
}

// ログアウト
function logout() {
  if (confirm('ログアウトしますか？')) {
    Auth.logout();
    window.location.href = 'login.html';
  }
}

// ========================================
// ページ初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  DOM.initHamburger();
  
  // 認証が必要なページかチェック（login.html, register.html, index.html以外）
  const publicPages = ['login.html', 'register.html', 'index.html', 'verify-email.html', 'reset-password.html', 'terms.html', 'privacy.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // 管理画面は別の認証チェック
  if (currentPage.startsWith('admin/') || window.location.pathname.includes('/admin/')) {
    return; // 管理画面は独自の認証チェックを持つ
  }
  
  // 公開ページ以外で未ログインならリダイレクト
  if (!publicPages.includes(currentPage) && !Auth.isLoggedIn()) {
    window.location.href = 'login.html';
  }
});
