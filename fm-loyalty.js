/* ==========================================================
   FlowerMad — Loyalty Widget (Bilingual: Arabic / English)
   ==========================================================
   Usage:
   1. Set APPS_SCRIPT_URL below to your Apps Script Web App URL.
   2. Upload this file as-is to GitHub Pages.
   3. In Ecwid (Custom code section) add just:

      <div id="fm-loyalty-root"></div>
      <script src="https://YOUR-USERNAME.github.io/YOUR-REPO/fm-loyalty.js"></script>

   The widget remembers the visitor's language choice (localStorage)
   and defaults to Arabic on first visit.
   ========================================================== */
(function () {
  // ⚠️ Replace this with your Apps Script Web App URL
  const APPS_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';

  const TIERS = [
    { points: 100, discount: 30 },
    { points: 200, discount: 65 },
    { points: 350, discount: 120 },
    { points: 500, discount: 180 }
  ];

  const BLOOM_ICONS = {
    bud: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V16" stroke="#4C6444" stroke-width="2" stroke-linecap="round"/><path d="M16 16C16 16 10 14 10 9C10 5.5 13 3 16 3C19 3 22 5.5 22 9C22 14 16 16 16 16Z" fill="#E9DAD3" stroke="#B23A48" stroke-width="1.6"/></svg>',
    half: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V15" stroke="#4C6444" stroke-width="2" stroke-linecap="round"/><path d="M16 8C16 8 21 9 21 13.5C21 17 16 18.5 16 18.5C16 18.5 11 17 11 13.5C11 9 16 8 16 8Z" fill="#F3C9CE" stroke="#B23A48" stroke-width="1.6"/><path d="M16 8C13.5 6 13.5 3.5 16 2C18.5 3.5 18.5 6 16 8Z" fill="#F3C9CE" stroke="#B23A48" stroke-width="1.4"/></svg>',
    open: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V16" stroke="#4C6444" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="10" r="4" fill="#B23A48"/><path d="M16 10C16 10 9 9 8 4C13 3 16 10 16 10Z" fill="#D96471" stroke="#B23A48" stroke-width="1.2"/><path d="M16 10C16 10 23 9 24 4C19 3 16 10 16 10Z" fill="#D96471" stroke="#B23A48" stroke-width="1.2"/><path d="M16 10C16 10 15 3 19 0C22 4 16 10 16 10Z" fill="#C24555" stroke="#B23A48" stroke-width="1.2"/></svg>',
    full: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V17" stroke="#4C6444" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="10" r="3.4" fill="#8C2C38"/><path d="M16 10C16 10 8 10 6 4C12 2 16 10 16 10Z" fill="#B23A48" stroke="#8C2C38" stroke-width="1"/><path d="M16 10C16 10 24 10 26 4C20 2 16 10 16 10Z" fill="#B23A48" stroke="#8C2C38" stroke-width="1"/><path d="M16 10C16 10 15 1 20 -2" fill="none"/><path d="M16 10C16 10 10 4 12 -1C18 0 16 10 16 10Z" fill="#C24555" stroke="#8C2C38" stroke-width="1"/><path d="M16 10C16 10 22 4 20 -1C14 0 16 10 16 10Z" fill="#C24555" stroke="#8C2C38" stroke-width="1"/></svg>'
  };
  const BLOOM_SEQUENCE = ['bud', 'half', 'open', 'full'];

  // ---------- Language strings ----------
  const STRINGS = {
    ar: {
      dir: 'rtl',
      dateLocale: 'ar-EG',
      eyebrow: '🌹 برنامج نقاط FlowerMad',
      heading: 'نقاطك بتتجمع من نفسها',
      sub: 'كل 10 جنيه في أي أوردر = نقطة. اكتب إيميلك اللي بتطلب بيه وشوف رصيدك.',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'اعرض رصيدي',
      tiersTitle: 'درجات الاستبدال',
      tierRow: (points, discount) => `<span>${points} نقطة</span><span>خصم ${discount} جنيه</span>`,
      historyBtn: 'أكوادي السابقة',
      invalidEmail: 'اكتب إيميل صحيح الأول 🙏',
      fetchingBalance: 'بنجيب رصيدك...',
      notFound: 'لسه معندناش نقاط باسم الإيميل ده.<br>اطلب أول باقة وابدأ تجمع نقاطك 🌹',
      pointsAvailable: 'نقطة متاحة',
      canRedeem: (discount) => `تقدر تستبدل دلوقتي بخصم <b>${discount} جنيه</b>`,
      redeemBtn: 'استبدل نقاطي دلوقتي',
      needMore: (n) => `محتاج <b>${n} نقطة</b> كمان عشان توصل لأقرب مكافأة`,
      connError: 'حصلت مشكلة في الاتصال، حاول تاني بعد شوية',
      sendingOtp: 'بنبعتلك كود تحقق على إيميلك...',
      otpSendFail: 'حصلت مشكلة في إرسال الكود، حاول تاني',
      otpSentMsg: 'بعتنالك كود من 6 أرقام على إيميلك، اكتبه هنا:',
      otpConfirm: 'تأكيد',
      otpResend: 'مستلمتش الكود؟ ابعته تاني',
      otpEnter6: 'اكتب الكود المكوّن من 6 أرقام',
      verifying: 'بنتحقق من الكود...',
      genericFail: 'حصلت مشكلة، حاول تاني',
      yourCode: 'كود الخصم بتاعك',
      couponNote: (discount, remaining) => `خصم ${discount} جنيه — الصقه في خانة الكوبون وقت الدفع.<br>رصيدك المتبقي: ${remaining} نقطة.`,
      copyBtn: 'نسخ الكود',
      copiedBtn: 'اتنسخ ✓',
      enterEmailForHistory: 'اكتب إيميلك الأول عشان نعرض أكوادك 🙏',
      fetchingHistory: 'بنجيب أكوادك...',
      noRedemptions: 'لسه معملتش أي استبدال. لما تجمع نقاط كفاية تقدر تستبدلها من فوق.',
      yourCodesTitle: 'أكوادك',
      active: 'لسه شغال',
      used: 'مستخدم',
      historyMeta: (discount, pointsUsed) => `خصم ${discount} جنيه — ${pointsUsed} نقطة`,
      usedInOrder: (orderNumber, date) => `استُخدم في أوردر #${orderNumber}${date ? ' — ' + date : ''}`
    },
    en: {
      dir: 'ltr',
      dateLocale: 'en-US',
      eyebrow: '🌹 FlowerMad Loyalty Program',
      heading: 'Your points add up automatically',
      sub: 'Every 10 EGP on any order = 1 point. Enter the email you order with to check your balance.',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'Check My Balance',
      tiersTitle: 'Redemption Tiers',
      tierRow: (points, discount) => `<span>${points} points</span><span>${discount} EGP off</span>`,
      historyBtn: 'My Previous Codes',
      invalidEmail: 'Please enter a valid email first 🙏',
      fetchingBalance: 'Fetching your balance...',
      notFound: "We don't have any points under this email yet.<br>Place your first order and start earning points 🌹",
      pointsAvailable: 'points available',
      canRedeem: (discount) => `You can redeem now for <b>${discount} EGP off</b>`,
      redeemBtn: 'Redeem My Points Now',
      needMore: (n) => `You need <b>${n} more points</b> to reach the next reward`,
      connError: 'Something went wrong connecting. Please try again shortly.',
      sendingOtp: 'Sending a verification code to your email...',
      otpSendFail: 'There was a problem sending the code. Please try again.',
      otpSentMsg: 'We sent a 6-digit code to your email. Enter it here:',
      otpConfirm: 'Confirm',
      otpResend: "Didn't get the code? Resend",
      otpEnter6: 'Enter the 6-digit code',
      verifying: 'Verifying your code...',
      genericFail: 'Something went wrong. Please try again.',
      yourCode: 'Your discount code',
      couponNote: (discount, remaining) => `${discount} EGP off — paste it in the coupon field at checkout.<br>Remaining balance: ${remaining} points.`,
      copyBtn: 'Copy Code',
      copiedBtn: 'Copied ✓',
      enterEmailForHistory: 'Please enter your email first to view your codes 🙏',
      fetchingHistory: 'Fetching your codes...',
      noRedemptions: "You haven't redeemed anything yet. Once you have enough points, you can redeem them above.",
      yourCodesTitle: 'Your Codes',
      active: 'Active',
      used: 'Used',
      historyMeta: (discount, pointsUsed) => `${discount} EGP off — ${pointsUsed} points`,
      usedInOrder: (orderNumber, date) => `Used on order #${orderNumber}${date ? ' — ' + date : ''}`
    }
  };

  let currentLang = 'ar';
  try {
    const saved = localStorage.getItem('fm-loyalty-lang');
    if (saved === 'ar' || saved === 'en') currentLang = saved;
  } catch (e) { /* localStorage may be unavailable, default to ar */ }

  function t(key) {
    return STRINGS[currentLang][key];
  }

  // ---------- Inject CSS once ----------
  function injectStyles() {
    if (document.getElementById('fm-loyalty-styles')) return;
    const style = document.createElement('style');
    style.id = 'fm-loyalty-styles';
    style.textContent = `
      #fm-loyalty-root {
        --fm-ink: #3A2436; --fm-ink-soft: #7A6670; --fm-rose: #B23A48;
        --fm-rose-deep: #8C2C38; --fm-gold: #B8862F; --fm-sage: #4C6444; --fm-line: #E9DAD3;
        font-family: 'Cairo', Tahoma, 'Segoe UI', sans-serif; color: var(--fm-ink);
        max-width: 480px; margin: 0 auto; box-sizing: border-box;
      }
      #fm-loyalty-root * { box-sizing: border-box; }
      #fm-loyalty-root .fm-card { background: #fff; border: 1px solid var(--fm-line); border-radius: 16px; padding: 24px; position: relative; }
      #fm-loyalty-root .fm-lang-switch {
        position: absolute; top: 16px; ${currentLang === 'ar' ? 'left: 16px;' : 'right: 16px;'}
        display: flex; border: 1.5px solid var(--fm-line); border-radius: 999px; overflow: hidden; font-size: 11px;
      }
      #fm-loyalty-root .fm-lang-btn {
        border: none; background: #fff; color: var(--fm-ink-soft); padding: 4px 10px; cursor: pointer; font-weight: 700;
      }
      #fm-loyalty-root .fm-lang-btn.fm-lang-active { background: var(--fm-rose); color: #fff; }
      #fm-loyalty-root .fm-eyebrow { font-size: 13px; color: var(--fm-rose); font-weight: 700; margin-bottom: 6px; padding-${currentLang === 'ar' ? 'left' : 'right'}: 70px; }
      #fm-loyalty-root h1 { font-size: 26px; font-weight: 700; margin: 0 0 6px; }
      #fm-loyalty-root .fm-sub { font-size: 14px; color: var(--fm-ink-soft); margin: 0 0 20px; line-height: 1.7; }
      #fm-loyalty-root .fm-row { display: flex; gap: 8px; }
      #fm-loyalty-root input[type="email"], #fm-loyalty-root input[type="text"] {
        flex: 1; padding: 12px 14px; border-radius: 10px; border: 1.5px solid var(--fm-line);
        font-size: 15px; background: #FDFAF8; color: var(--fm-ink);
      }
      #fm-loyalty-root button { font-weight: 700; font-size: 14px; border: none; border-radius: 10px; padding: 12px 18px; cursor: pointer; }
      #fm-loyalty-root button:disabled { opacity: 0.55; }
      #fm-loyalty-root .fm-btn-primary { background: var(--fm-rose); color: #fff; }
      #fm-loyalty-root .fm-btn-gold { background: var(--fm-gold); color: #fff; width: 100%; margin-top: 14px; padding: 14px; }
      #fm-loyalty-root .fm-result { margin-top: 20px; display: none; }
      #fm-loyalty-root .fm-result.fm-show { display: block; }
      #fm-loyalty-root .fm-balance-block { display: flex; justify-content: space-between; border-top: 1px dashed var(--fm-line); border-bottom: 1px dashed var(--fm-line); padding: 16px 0; margin-bottom: 16px; }
      #fm-loyalty-root .fm-balance-num { font-size: 40px; font-weight: 700; color: var(--fm-rose-deep); }
      #fm-loyalty-root .fm-balance-label { font-size: 13px; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-bloom-track { display: flex; justify-content: space-between; margin: 6px 0 8px; }
      #fm-loyalty-root .fm-bloom { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 44px; }
      #fm-loyalty-root .fm-bloom svg { width: 28px; height: 28px; }
      #fm-loyalty-root .fm-bloom .fm-bloom-pts { font-size: 11px; color: var(--fm-ink-soft); font-weight: 700; }
      #fm-loyalty-root .fm-bloom.fm-locked svg { opacity: 0.35; }
      #fm-loyalty-root .fm-bloom.fm-locked .fm-bloom-pts { opacity: 0.5; }
      #fm-loyalty-root .fm-next { font-size: 13px; color: var(--fm-ink-soft); text-align: center; margin-top: 4px; }
      #fm-loyalty-root .fm-next b { color: var(--fm-ink); }
      #fm-loyalty-root .fm-tiers { margin-top: 20px; border-top: 1px solid var(--fm-line); padding-top: 14px; }
      #fm-loyalty-root .fm-tiers-title { font-size: 13px; font-weight: 700; color: var(--fm-ink-soft); margin-bottom: 8px; }
      #fm-loyalty-root .fm-tier-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #F3E9E4; }
      #fm-loyalty-root .fm-tier-row span:last-child { font-weight: 700; color: var(--fm-sage); }
      #fm-loyalty-root .fm-coupon-box { background: #FBF3EF; border: 1.5px dashed var(--fm-gold); border-radius: 12px; padding: 16px; text-align: center; margin-top: 14px; }
      #fm-loyalty-root .fm-coupon-code { font-size: 24px; font-weight: 700; color: var(--fm-rose-deep); margin: 4px 0 8px; }
      #fm-loyalty-root .fm-coupon-note { font-size: 13px; color: var(--fm-ink-soft); line-height: 1.6; }
      #fm-loyalty-root .fm-copy-btn { margin-top: 8px; background: transparent; border: 1.5px solid var(--fm-gold); color: var(--fm-gold); padding: 8px 14px; font-size: 13px; }
      #fm-loyalty-root .fm-empty, #fm-loyalty-root .fm-error { text-align: center; padding: 16px 8px; font-size: 14px; color: var(--fm-ink-soft); line-height: 1.8; }
      #fm-loyalty-root .fm-error { color: var(--fm-rose-deep); }
      #fm-loyalty-root .fm-loading { text-align: center; padding: 18px; font-size: 14px; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-history-link, #fm-loyalty-root .fm-resend-link {
        display: block; text-align: center; margin-top: 12px; font-size: 13px; color: var(--fm-ink-soft);
        text-decoration: underline; background: none; border: none; cursor: pointer; width: 100%; padding: 6px;
      }
      #fm-loyalty-root .fm-history-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F3E9E4; font-size: 13px; }
      #fm-loyalty-root .fm-history-code { font-weight: 700; font-size: 15px; }
      #fm-loyalty-root .fm-history-meta { font-size: 11.5px; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
      #fm-loyalty-root .fm-badge-active { background: #E9F0E5; color: var(--fm-sage); }
      #fm-loyalty-root .fm-badge-used { background: #F1E9EB; color: #A08A93; }
    `;
    document.head.appendChild(style);
  }

  function bloomStageIndex(points) {
    let unlocked = 0;
    TIERS.forEach(t => { if (points >= t.points) unlocked++; });
    return unlocked;
  }

  function renderBloomTrack(points) {
    const unlocked = bloomStageIndex(points);
    return `
      <div class="fm-bloom-track">
        ${TIERS.map((tier, i) => `
          <div class="fm-bloom ${i < unlocked ? '' : 'fm-locked'}">
            ${BLOOM_ICONS[BLOOM_SEQUENCE[i]]}
            <span class="fm-bloom-pts">${tier.points}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  let rootEl = null;

  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem('fm-loyalty-lang', lang); } catch (e) { /* ignore */ }
    // إعادة بناء الـ CSS عشان اتجاه الزرار يتظبط مع اللغة الجديدة
    const oldStyle = document.getElementById('fm-loyalty-styles');
    if (oldStyle) oldStyle.remove();
    injectStyles();
    render(rootEl);
  }

  function render(root) {
    rootEl = root;
    root.setAttribute('dir', t('dir'));
    root.setAttribute('lang', currentLang);

    root.innerHTML = `
      <div class="fm-card">
        <div class="fm-lang-switch">
          <button class="fm-lang-btn ${currentLang === 'ar' ? 'fm-lang-active' : ''}" data-lang="ar">AR</button>
          <button class="fm-lang-btn ${currentLang === 'en' ? 'fm-lang-active' : ''}" data-lang="en">EN</button>
        </div>
        <div class="fm-eyebrow">${t('eyebrow')}</div>
        <h1>${t('heading')}</h1>
        <p class="fm-sub">${t('sub')}</p>
        <div class="fm-row">
          <input type="email" id="fm-email" placeholder="${t('emailPlaceholder')}" />
          <button class="fm-btn-primary" id="fm-check-btn">${t('checkBtn')}</button>
        </div>
        <div class="fm-result" id="fm-result"></div>
        <div class="fm-tiers">
          <div class="fm-tiers-title">${t('tiersTitle')}</div>
          ${TIERS.map(tier => `<div class="fm-tier-row">${t('tierRow')(tier.points, tier.discount)}</div>`).join('')}
        </div>
        <button class="fm-history-link" id="fm-history-btn">${t('historyBtn')}</button>
      </div>
    `;

    root.querySelectorAll('.fm-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => switchLang(btn.dataset.lang));
    });

    document.getElementById('fm-check-btn').addEventListener('click', checkBalance);
    document.getElementById('fm-history-btn').addEventListener('click', showHistory);
    document.getElementById('fm-email').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkBalance();
    });
  }

  async function checkBalance() {
    const emailInput = document.getElementById('fm-email');
    const email = emailInput.value.trim();
    const resultBox = document.getElementById('fm-result');

    if (!email || !email.includes('@')) {
      resultBox.className = 'fm-result fm-show';
      resultBox.innerHTML = `<div class="fm-error">${t('invalidEmail')}</div>`;
      return;
    }

    resultBox.className = 'fm-result fm-show';
    resultBox.innerHTML = `<div class="fm-loading">${t('fetchingBalance')}</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!data.found) {
        resultBox.innerHTML = `<div class="fm-empty">${t('notFound')}</div>`;
        return;
      }

      let html = `
        <div class="fm-balance-block">
          <div>
            <div class="fm-balance-num">${data.points}</div>
            <div class="fm-balance-label">${t('pointsAvailable')}</div>
          </div>
        </div>
        ${renderBloomTrack(data.points)}
      `;

      if (data.canRedeem) {
        html += `
          <div class="fm-next">${t('canRedeem')(data.eligibleDiscount)}</div>
          <button class="fm-btn-gold" id="fm-redeem-btn">${t('redeemBtn')}</button>
        `;
      } else if (data.pointsToNextTier) {
        html += `<div class="fm-next">${t('needMore')(data.pointsToNextTier)}</div>`;
      }

      resultBox.innerHTML = html;

      const redeemBtn = document.getElementById('fm-redeem-btn');
      if (redeemBtn) {
        redeemBtn.addEventListener('click', () => redeemPoints(email));
      }
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">${t('connError')}</div>`;
    }
  }

  async function redeemPoints(email) {
    const resultBox = document.getElementById('fm-result');
    resultBox.innerHTML = `<div class="fm-loading">${t('sendingOtp')}</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=request-otp`);
      const data = await res.json();

      if (!data.success) {
        resultBox.innerHTML = `<div class="fm-error">${t('otpSendFail')}</div>`;
        return;
      }

      resultBox.innerHTML = `
        <div class="fm-otp-box">
          <div style="font-size:14px;margin-bottom:10px;">${t('otpSentMsg')}</div>
          <div class="fm-row">
            <input type="text" id="fm-otp-input" placeholder="------" maxlength="6" inputmode="numeric" />
            <button class="fm-btn-primary" id="fm-otp-confirm">${t('otpConfirm')}</button>
          </div>
          <button class="fm-resend-link" id="fm-otp-resend">${t('otpResend')}</button>
        </div>
      `;

      document.getElementById('fm-otp-confirm').addEventListener('click', () => confirmOtp(email));
      document.getElementById('fm-otp-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmOtp(email);
      });
      document.getElementById('fm-otp-resend').addEventListener('click', () => redeemPoints(email));
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">${t('connError')}</div>`;
    }
  }

  async function confirmOtp(email) {
    const otpInput = document.getElementById('fm-otp-input');
    const otp = otpInput.value.trim();
    const resultBox = document.getElementById('fm-result');

    if (!otp || otp.length !== 6) {
      resultBox.innerHTML = `<div class="fm-error">${t('otpEnter6')}</div>` + resultBox.innerHTML;
      return;
    }

    resultBox.innerHTML = `<div class="fm-loading">${t('verifying')}</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=redeem&otp=${encodeURIComponent(otp)}`);
      const data = await res.json();

      if (!data.success) {
        resultBox.innerHTML = `<div class="fm-error">${data.message || t('genericFail')}</div>`;
        return;
      }

      resultBox.innerHTML = `
        <div class="fm-coupon-box">
          <div style="font-size:13px;color:var(--fm-ink-soft)">${t('yourCode')}</div>
          <div class="fm-coupon-code">${data.couponCode}</div>
          <div class="fm-coupon-note">${t('couponNote')(data.discount, data.remainingPoints)}</div>
          <button class="fm-copy-btn" id="fm-copy-btn">${t('copyBtn')}</button>
        </div>
      `;

      document.getElementById('fm-copy-btn').addEventListener('click', function () {
        navigator.clipboard.writeText(data.couponCode);
        this.textContent = t('copiedBtn');
        setTimeout(() => { this.textContent = t('copyBtn'); }, 1800);
      });
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">${t('connError')}</div>`;
    }
  }

  async function showHistory() {
    const emailInput = document.getElementById('fm-email');
    const email = emailInput.value.trim();
    const resultBox = document.getElementById('fm-result');

    if (!email || !email.includes('@')) {
      resultBox.className = 'fm-result fm-show';
      resultBox.innerHTML = `<div class="fm-error">${t('enterEmailForHistory')}</div>`;
      return;
    }

    resultBox.className = 'fm-result fm-show';
    resultBox.innerHTML = `<div class="fm-loading">${t('fetchingHistory')}</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=history`);
      const data = await res.json();

      if (!data.coupons || data.coupons.length === 0) {
        resultBox.innerHTML = `<div class="fm-empty">${t('noRedemptions')}</div>`;
        return;
      }

      const statusLabel = (status) => status === 'ACTIVE'
        ? `<span class="fm-badge fm-badge-active">${t('active')}</span>`
        : `<span class="fm-badge fm-badge-used">${t('used')}</span>`;

      const formatDate = (d) => {
        if (!d) return null;
        const parsed = new Date(d.replace(' ', 'T').replace(' +0000', 'Z'));
        if (isNaN(parsed)) return d.split(' ')[0];
        return parsed.toLocaleDateString(t('dateLocale'), { day: 'numeric', month: 'short', year: 'numeric' });
      };

      resultBox.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:var(--fm-ink-soft);margin-bottom:6px;">${t('yourCodesTitle')}</div>
        ${data.coupons.map(c => `
          <div class="fm-history-item">
            <div>
              <div class="fm-history-code">${c.couponCode}</div>
              <div class="fm-history-meta">
                ${t('historyMeta')(c.discount, c.pointsUsed)}
                ${c.orderNumber ? `<br>${t('usedInOrder')(c.orderNumber, c.usedDate ? formatDate(c.usedDate) : null)}` : ''}
              </div>
            </div>
            ${statusLabel(c.status)}
          </div>
        `).join('')}
      `;
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">${t('connError')}</div>`;
    }
  }

  // ---------- Boot the widget ----------
  function init() {
    const root = document.getElementById('fm-loyalty-root');
    if (!root) return; // this page doesn't have the widget, do nothing
    injectStyles();
    render(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
