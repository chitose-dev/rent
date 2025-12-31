// ===================================
// ハンバーガーメニュー
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    if (hamburger && menu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // メニューリンククリックで閉じる
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }

    // ===================================
    // FAQアコーディオン
    // ===================================
    const faqQuestions = document.querySelectorAll('.faq__question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            const answer = item.querySelector('.faq__answer');
            
            // 他のFAQを閉じる
            document.querySelectorAll('.faq__item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // クリックされたFAQを開閉
            item.classList.toggle('active');
        });
    });

    // ===================================
    // スムーススクロール
    // ===================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===================================
    // 保険説明アコーディオン
    // ===================================
    const insuranceBtn = document.querySelector('.insurance__btn');
    
    if (insuranceBtn) {
        const btnTitle = insuranceBtn.querySelector('.insurance__btn_title');
        
        if (btnTitle) {
            btnTitle.addEventListener('click', function() {
                insuranceBtn.classList.toggle('open');
            });
        }
    }
});
