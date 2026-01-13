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
// 設定値（将来は管理画面から取得）
// ========================================

const AppConfig = {
  // 営業時間
  openTime: '09:00',
  closeTime: '18:00',
  timeStepMinutes: 15,
  
  // 予約可能期間
  maxFutureMonths: 6,
  
  // 車両クラスマスタ（将来はAPIから取得）
  carClasses: [
    {
      id: 'class-001',
      name: '軽自動車クラス',
      description: '街乗りに最適なコンパクトカー',
      notes: '4人乗り / オートマ / ナビ付き',
      imageUrl: null
    },
    {
      id: 'class-002',
      name: 'コンパクトクラス',
      description: '小回りが利いて運転しやすい',
      notes: '5人乗り / オートマ / ナビ付き',
      imageUrl: null
    },
    {
      id: 'class-003',
      name: 'スタンダードクラス',
      description: '広々快適な定番セダン',
      notes: '5人乗り / オートマ / ナビ・ETC付き',
      imageUrl: null
    },
    {
      id: 'class-004',
      name: 'ミニバンクラス',
      description: '大人数・荷物多めにおすすめ',
      notes: '7-8人乗り / オートマ / ナビ・ETC付き',
      imageUrl: null
    }
  ],
  
  // 料金表（将来はAPIから取得）
  pricingPlans: [
    // 軽自動車クラス
    { carClassId: 'class-001', days: 1, price: 4000, label: '1日' },
    { carClassId: 'class-001', days: 2, price: 7500, label: '2日' },
    { carClassId: 'class-001', days: 3, price: 10500, label: '3日' },
    { carClassId: 'class-001', days: 7, price: 22000, label: '1週間' },
    
    // コンパクトクラス
    { carClassId: 'class-002', days: 1, price: 5000, label: '1日' },
    { carClassId: 'class-002', days: 2, price: 9500, label: '2日' },
    { carClassId: 'class-002', days: 3, price: 13500, label: '3日' },
    { carClassId: 'class-002', days: 7, price: 28000, label: '1週間' },
    
    // スタンダードクラス
    { carClassId: 'class-003', days: 1, price: 6500, label: '1日' },
    { carClassId: 'class-003', days: 2, price: 12500, label: '2日' },
    { carClassId: 'class-003', days: 3, price: 18000, label: '3日' },
    { carClassId: 'class-003', days: 7, price: 38000, label: '1週間' },
    
    // ミニバンクラス
    { carClassId: 'class-004', days: 1, price: 8500, label: '1日' },
    { carClassId: 'class-004', days: 2, price: 16500, label: '2日' },
    { carClassId: 'class-004', days: 3, price: 24000, label: '3日' },
    { carClassId: 'class-004', days: 7, price: 52000, label: '1週間' }
  ],
  
  // 予約不可日（将来はAPIから取得）
  disabledDates: [
    // 例: '2026-02-15', '2026-03-20'
  ]
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
// ページ初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  DOM.initHamburger();
});
