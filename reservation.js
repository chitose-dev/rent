// ===================================
// 予約フォームのロジック
// ===================================

// 予約データを保存するオブジェクト
const reservationData = {
    vehicleClass: '',
    vehicleName: '',
    startDate: '',
    rentalPeriod: '',
    pickupTime: '',
    insurance: 'none',
    name: '',
    kana: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    remarks: '',
    basePrice: 0,
    insurancePrice: 0,
    totalPrice: 0,
    paymentMethod: 'credit'
};

// 車両の料金データ
const vehiclePrices = {
    'kei': {
        name: '軽自動車クラス',
        '10': 25000,
        '20': 45000,
        '30': 60000
    },
    'van': {
        name: '商用車クラス',
        '10': 35000,
        '20': 65000,
        '30': 90000
    }
};

// 保険の料金データ（1日あたり）
const insurancePrices = {
    'none': 0,
    'bronze': 1100,
    'silver': 2200,
    'gold': 3300
};

// ===================================
// ステップ移動
// ===================================
function goToStep(stepNumber) {
    // 現在のステップを非表示
    document.querySelectorAll('.reservation__step').forEach(step => {
        step.classList.remove('active');
    });

    // 進捗バーの更新
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index < stepNumber) {
            step.classList.add('completed');
        }
    });

    // 指定されたステップを表示
    document.getElementById(`step${stepNumber}`).classList.add('active');
    document.querySelectorAll('.progress-step')[stepNumber - 1].classList.add('active');

    // ステップ4の場合は確認内容を表示
    if (stepNumber === 4) {
        displayConfirmation();
    }

    // ページトップへスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// ステップ1: 車両選択
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        const selectBtn = card.querySelector('.vehicle-select-btn');
        
        selectBtn.addEventListener('click', function() {
            const vehicleClass = card.dataset.class;
            
            // 車両情報を保存
            reservationData.vehicleClass = vehicleClass;
            reservationData.vehicleName = vehiclePrices[vehicleClass].name;
            
            // カードを選択状態にする
            vehicleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // 次のステップへ
            setTimeout(() => {
                goToStep(2);
            }, 300);
        });
    });

    // ===================================
    // ステップ2: 日程・オプション選択
    // ===================================
    const startDateInput = document.getElementById('start-date');
    const rentalPeriodSelect = document.getElementById('rental-period');
    const pickupTimeSelect = document.getElementById('pickup-time');

    // 今日の日付を最小値に設定
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDateInput.min = tomorrow.toISOString().split('T')[0];

    // 日程変更時の処理
    startDateInput.addEventListener('change', function() {
        reservationData.startDate = this.value;
        updatePrice();
    });

    rentalPeriodSelect.addEventListener('change', function() {
        reservationData.rentalPeriod = this.value;
        updatePrice();
    });

    pickupTimeSelect.addEventListener('change', function() {
        reservationData.pickupTime = this.value;
    });

    // 保険選択時の処理
    const insuranceInputs = document.querySelectorAll('input[name="insurance"]');
    insuranceInputs.forEach(input => {
        input.addEventListener('change', function() {
            reservationData.insurance = this.value;
            updatePrice();
        });
    });

    // ===================================
    // ステップ3: お客様情報入力
    // ===================================
    document.getElementById('name').addEventListener('input', function() {
        reservationData.name = this.value;
    });

    document.getElementById('kana').addEventListener('input', function() {
        reservationData.kana = this.value;
    });

    document.getElementById('email').addEventListener('input', function() {
        reservationData.email = this.value;
    });

    document.getElementById('phone').addEventListener('input', function() {
        reservationData.phone = this.value;
    });

    document.getElementById('postal-code').addEventListener('input', function() {
        reservationData.postalCode = this.value;
    });

    document.getElementById('address').addEventListener('input', function() {
        reservationData.address = this.value;
    });

    document.getElementById('remarks').addEventListener('input', function() {
        reservationData.remarks = this.value;
    });

    // ===================================
    // 支払い方法選択
    // ===================================
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            reservationData.paymentMethod = this.value;
        });
    });
});

// ===================================
// 料金計算
// ===================================
function updatePrice() {
    const vehicleClass = reservationData.vehicleClass;
    const period = reservationData.rentalPeriod;
    const insurance = reservationData.insurance;

    if (vehicleClass && period) {
        // 基本料金
        reservationData.basePrice = vehiclePrices[vehicleClass][period];
        
        // 保険料金（日数×日額）
        reservationData.insurancePrice = insurancePrices[insurance] * parseInt(period);
        
        // 合計金額
        reservationData.totalPrice = reservationData.basePrice + reservationData.insurancePrice;
    }
}

// ===================================
// 確認画面の表示
// ===================================
function displayConfirmation() {
    // 予約内容
    document.getElementById('confirm-vehicle').textContent = reservationData.vehicleName;
    document.getElementById('confirm-start-date').textContent = reservationData.startDate;
    document.getElementById('confirm-period').textContent = `${reservationData.rentalPeriod}日間`;
    document.getElementById('confirm-time').textContent = reservationData.pickupTime;
    
    // 保険表示
    let insuranceText = 'なし';
    if (reservationData.insurance === 'bronze') insuranceText = 'ブロンズプラン';
    if (reservationData.insurance === 'silver') insuranceText = 'シルバープラン';
    if (reservationData.insurance === 'gold') insuranceText = 'ゴールドプラン';
    document.getElementById('confirm-insurance').textContent = insuranceText;

    // お客様情報
    document.getElementById('confirm-name').textContent = reservationData.name;
    document.getElementById('confirm-email').textContent = reservationData.email;
    document.getElementById('confirm-phone').textContent = reservationData.phone;
    document.getElementById('confirm-address').textContent = 
        `〒${reservationData.postalCode} ${reservationData.address}`;

    // 料金
    document.getElementById('price-base').textContent = 
        reservationData.basePrice.toLocaleString() + '円';
    document.getElementById('price-insurance').textContent = 
        reservationData.insurancePrice.toLocaleString() + '円';
    document.getElementById('price-total').textContent = 
        reservationData.totalPrice.toLocaleString() + '円';
}

// ===================================
// 予約確定
// ===================================
function submitReservation() {
    // バリデーション
    if (!validateReservation()) {
        alert('入力内容に不備があります。');
        return;
    }

    // クレジットカード決済の場合
    if (reservationData.paymentMethod === 'credit') {
        // Stripe決済画面へ遷移（後で実装）
        processStripePayment();
    } else {
        // 現金払いの場合は直接完了画面へ
        completeReservation();
    }
}

// バリデーション
function validateReservation() {
    if (!reservationData.vehicleClass) {
        alert('車両を選択してください。');
        goToStep(1);
        return false;
    }

    if (!reservationData.startDate || !reservationData.rentalPeriod || !reservationData.pickupTime) {
        alert('日程・時間を選択してください。');
        goToStep(2);
        return false;
    }

    if (!reservationData.name || !reservationData.email || !reservationData.phone || !reservationData.address) {
        alert('必須項目を入力してください。');
        goToStep(3);
        return false;
    }

    return true;
}

// Stripe決済処理（仮実装）
function processStripePayment() {
    // TODO: Stripe決済の実装
    console.log('Stripe決済処理', reservationData);
    
    // 仮で完了画面へ
    setTimeout(() => {
        completeReservation();
    }, 1000);
}

// 予約完了処理
function completeReservation() {
    // 予約番号生成（仮）
    const reservationNumber = 'R' + new Date().getTime();
    document.getElementById('reservation-number').textContent = reservationNumber;

    // TODO: バックエンドへデータ送信
    console.log('予約データ送信', reservationData);

    // 完了画面へ
    goToStep(5);
}
