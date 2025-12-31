// ===================================
// マイページのロジック
// ===================================

let currentReservationId = null;

document.addEventListener('DOMContentLoaded', function() {
    // ===================================
    // タブ切り替え
    // ===================================
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.dataset.tab;
            
            // アクティブ状態を切り替え
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツを切り替え
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// ===================================
// 予約詳細表示
// ===================================
function showReservationDetail(reservationId) {
    // TODO: バックエンドからデータ取得
    // 仮のデータ
    const reservationData = {
        'R20251227-001': {
            status: '予約確定',
            number: 'R20251227-001',
            date: '2024年12月27日',
            vehicle: '軽自動車クラス',
            startDate: '2025年1月10日 9:00',
            endDate: '2025年1月20日 18:00',
            period: '10日間',
            insurance: 'ブロンズプラン',
            basePrice: 25000,
            insurancePrice: 11000,
            totalPrice: 36000,
            paymentMethod: 'クレジットカード',
            name: '山田 太郎',
            phone: '090-1234-5678',
            email: 'yamada@example.com'
        },
        'R20241215-001': {
            status: '利用完了',
            number: 'R20241215-001',
            date: '2024年12月1日',
            vehicle: '商用車クラス',
            startDate: '2024年12月15日 10:00',
            endDate: '2024年12月25日 18:00',
            period: '10日間',
            insurance: 'なし',
            basePrice: 35000,
            insurancePrice: 0,
            totalPrice: 35000,
            paymentMethod: '現金',
            name: '山田 太郎',
            phone: '090-1234-5678',
            email: 'yamada@example.com'
        },
        'R20241120-001': {
            status: 'キャンセル済み',
            number: 'R20241120-001',
            date: '2024年11月10日',
            vehicle: '軽自動車クラス',
            startDate: '2024年11月20日 9:00',
            endDate: '2024年11月30日 18:00',
            period: '10日間',
            insurance: 'なし',
            cancelReason: '都合により',
            cancelDate: '2024年11月15日',
            name: '山田 太郎',
            phone: '090-1234-5678',
            email: 'yamada@example.com'
        }
    };

    const data = reservationData[reservationId];
    
    if (!data) {
        alert('予約情報が見つかりません');
        return;
    }

    // モーダルの内容を作成
    let modalContent = `
        <table class="confirmation-table">
            <tr>
                <th>予約番号</th>
                <td>${data.number}</td>
            </tr>
            <tr>
                <th>予約日</th>
                <td>${data.date}</td>
            </tr>
            <tr>
                <th>ステータス</th>
                <td>${data.status}</td>
            </tr>
            <tr>
                <th>車両クラス</th>
                <td>${data.vehicle}</td>
            </tr>
            <tr>
                <th>貸出開始</th>
                <td>${data.startDate}</td>
            </tr>
            <tr>
                <th>返却予定</th>
                <td>${data.endDate}</td>
            </tr>
            <tr>
                <th>期間</th>
                <td>${data.period}</td>
            </tr>
            <tr>
                <th>免責保証</th>
                <td>${data.insurance}</td>
            </tr>
    `;

    if (data.status !== 'キャンセル済み') {
        modalContent += `
            <tr>
                <th>基本料金</th>
                <td>¥${data.basePrice.toLocaleString()}</td>
            </tr>
            <tr>
                <th>免責保証</th>
                <td>¥${data.insurancePrice.toLocaleString()}</td>
            </tr>
            <tr>
                <th>合計金額</th>
                <td style="font-size: 20px; font-weight: bold; color: var(--primary-dark);">¥${data.totalPrice.toLocaleString()}</td>
            </tr>
            <tr>
                <th>支払い方法</th>
                <td>${data.paymentMethod}</td>
            </tr>
        `;
    } else {
        modalContent += `
            <tr>
                <th>キャンセル日</th>
                <td>${data.cancelDate}</td>
            </tr>
            <tr>
                <th>キャンセル理由</th>
                <td>${data.cancelReason}</td>
            </tr>
        `;
    }

    modalContent += `
            <tr>
                <th>お名前</th>
                <td>${data.name}</td>
            </tr>
            <tr>
                <th>電話番号</th>
                <td>${data.phone}</td>
            </tr>
            <tr>
                <th>メールアドレス</th>
                <td>${data.email}</td>
            </tr>
        </table>
    `;

    document.getElementById('modalBody').innerHTML = modalContent;
    document.getElementById('detailModal').classList.add('show');
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('detailModal').classList.remove('show');
}

// ===================================
// キャンセル確認
// ===================================
function confirmCancel(reservationId) {
    currentReservationId = reservationId;
    document.getElementById('cancelModal').classList.add('show');
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('show');
    currentReservationId = null;
}

function executeCancel() {
    if (!currentReservationId) {
        alert('エラーが発生しました');
        return;
    }

    // TODO: バックエンドにキャンセルリクエスト送信
    console.log('予約キャンセル:', currentReservationId);

    alert('予約をキャンセルしました');
    closeCancelModal();
    
    // ページをリロード（実際はデータを更新）
    location.reload();
}

// モーダル外クリックで閉じる
window.addEventListener('click', function(e) {
    const detailModal = document.getElementById('detailModal');
    const cancelModal = document.getElementById('cancelModal');
    
    if (e.target === detailModal) {
        closeModal();
    }
    if (e.target === cancelModal) {
        closeCancelModal();
    }
});

// ===================================
// プロフィール保存
// ===================================
function saveProfile() {
    const profileData = {
        name: document.getElementById('profile-name').value,
        kana: document.getElementById('profile-kana').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        postal: document.getElementById('profile-postal').value,
        address: document.getElementById('profile-address').value
    };

    // バリデーション
    if (!profileData.name || !profileData.email || !profileData.phone || !profileData.address) {
        alert('必須項目を入力してください');
        return;
    }

    // TODO: バックエンドに送信
    console.log('プロフィール更新:', profileData);

    alert('登録情報を更新しました');
}

// ===================================
// パスワード変更
// ===================================
function changePassword() {
    const currentPassword = prompt('現在のパスワードを入力してください');
    
    if (!currentPassword) {
        return;
    }

    const newPassword = prompt('新しいパスワードを入力してください');
    
    if (!newPassword || newPassword.length < 8) {
        alert('パスワードは8文字以上で入力してください');
        return;
    }

    const confirmPassword = prompt('新しいパスワードを再入力してください');
    
    if (newPassword !== confirmPassword) {
        alert('パスワードが一致しません');
        return;
    }

    // TODO: バックエンドに送信
    console.log('パスワード変更リクエスト');

    alert('パスワードを変更しました');
}

// ===================================
// アカウント削除確認
// ===================================
function confirmDeleteAccount() {
    if (!confirm('本当にアカウントを削除しますか？\nこの操作は取り消せません。')) {
        return;
    }

    const confirmation = prompt('削除する場合は「削除」と入力してください');
    
    if (confirmation !== '削除') {
        alert('キャンセルしました');
        return;
    }

    // TODO: バックエンドに削除リクエスト送信
    console.log('アカウント削除リクエスト');

    alert('アカウントを削除しました');
    
    // ログアウトしてトップページへ
    window.location.href = 'index.html';
}

// ===================================
// ログアウト確認
// ===================================
function confirmLogout() {
    if (confirm('ログアウトしますか？')) {
        logout();
    }
}

function logout() {
    // TODO: セッション削除処理
    console.log('ログアウト');
    
    alert('ログアウトしました');
    window.location.href = 'index.html';
}
