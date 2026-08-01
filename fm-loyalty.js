/* ==========================================================
   FlowerMad — Loyalty Widget (Bilingual, distinctive redesign)
   ==========================================================
   Usage:
   1. Set APPS_SCRIPT_URL below to your Apps Script Web App URL.
   2. Upload this file as-is to GitHub Pages.
   3. In Ecwid (Custom code section) add just:

      <div id="fm-loyalty-root"></div>
      <script src="https://YOUR-USERNAME.github.io/YOUR-REPO/fm-loyalty.js"></script>

   Design notes:
   - Palette is unchanged (rose / gold / sage / ink), only the
     typography, layout and motion were redesigned.
   - Fonts (Fraunces + Inter for EN, Markazi Text + Cairo for AR)
     are loaded dynamically by this script — nothing static needs
     to be added to the Ecwid HTML.
   - Respects prefers-reduced-motion.
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

  const MINI_BUD_ICON = '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M16 16C16 16 9 14 9 8.5C9 4.8 12.3 2 16 2C19.7 2 23 4.8 23 8.5C23 14 16 16 16 16Z" fill="currentColor"/></svg>';

  // ---------- Language strings ----------
  const STRINGS = {
    ar: {
      dir: 'rtl',
      dateLocale: 'ar-EG',
      eyebrow: 'برنامج نقاط FlowerMad',
      heading: 'رصيد نقاطك',
      sub: 'كل 10 جنيه في أي أوردر = نقطة. اكتب إيميلك اللي بتطلب بيه وشوف رصيدك.',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'اعرض رصيدي',
      tiersTitle: 'درجات الاستبدال',
      tierRow: (index, points, discount) => `<span class="fm-tier-num">${String(index + 1).padStart(2, '0')}</span><span class="fm-tier-pts">${points} نقطة</span><span class="fm-tier-discount">خصم ${discount} جنيه</span>`,
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
      eyebrow: 'FlowerMad Loyalty Program',
      heading: 'Your Points Balance',
      sub: 'Every 10 EGP on any order = 1 point. Enter the email you order with to check your balance.',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'Check My Balance',
      tiersTitle: 'Redemption Tiers',
      tierRow: (index, points, discount) => `<span class="fm-tier-num">${String(index + 1).padStart(2, '0')}</span><span class="fm-tier-pts">${points} pts</span><span class="fm-tier-discount">${discount} EGP off</span>`,
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

  let currentLang = 'en';
  try {
    const saved = localStorage.getItem('fm-loyalty-lang');
    if (saved === 'ar' || saved === 'en') currentLang = saved;
  } catch (e) { /* localStorage may be unavailable, default to en */ }

  function t(key) {
    return STRINGS[currentLang][key];
  }

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- Load display/body fonts once ----------
  function injectFonts() {
    if (document.getElementById('fm-loyalty-fonts')) return;
    const link = document.createElement('link');
    link.id = 'fm-loyalty-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=Almarai:wght@400;700;800&family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&family=Work+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // ---------- Inject CSS once ----------
  function injectStyles() {
    if (document.getElementById('fm-loyalty-styles')) return;
    const style = document.createElement('style');
    style.id = 'fm-loyalty-styles';
    style.textContent = `
      #fm-loyalty-root {
        --fm-ink: #3A2436; --fm-ink-soft: #7A6670; --fm-rose: #B23A48;
        --fm-rose-deep: #8C2C38; --fm-gold: #B8862F; --fm-sage: #4C6444;
        --fm-line: #E9DAD3; --fm-blush: #FBF3EF;
        --fm-display: 'El Messiri', Tahoma, sans-serif;
        --fm-body: 'Almarai', Tahoma, sans-serif;
        color: var(--fm-ink); font-family: var(--fm-body);
        max-width: 480px; margin: 0 auto; box-sizing: border-box;
      }
      #fm-loyalty-root[lang="en"] {
        --fm-display: 'Newsreader', Georgia, serif;
        --fm-body: 'Work Sans', 'Segoe UI', sans-serif;
      }
      #fm-loyalty-root * { box-sizing: border-box; }

      @keyframes fm-rise {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fm-breathe {
        0%, 100% { transform: scale(1); opacity: .85; }
        50% { transform: scale(1.12); opacity: 1; }
      }
      @keyframes fm-unfurl {
        from { opacity: 0; transform: scaleY(.85); }
        to { opacity: 1; transform: scaleY(1); }
      }
      @keyframes fm-pop {
        0% { transform: scale(.85); opacity: 0; }
        60% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        #fm-loyalty-root * { animation: none !important; transition: none !important; }
      }

      #fm-loyalty-root .fm-card {
        position: relative;
        background: linear-gradient(165deg, #fff 55%, var(--fm-blush) 100%);
        border: 1px solid var(--fm-line);
        border-radius: 30px 10px 30px 10px;
        padding: 30px 26px 26px;
        overflow: hidden;
        animation: fm-rise .5s ease both;
      }
      #fm-loyalty-root .fm-card::before {
        content: '';
        position: absolute; inset-block-start: 0; inset-inline-start: 0; inset-inline-end: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--fm-gold), var(--fm-rose) 55%, var(--fm-rose-deep));
      }

      #fm-loyalty-root .fm-eyebrow {
        display: flex; align-items: center; gap: 6px;
        font-size: 12.5px; letter-spacing: .09em; text-transform: uppercase;
        color: var(--fm-rose); font-weight: 700; margin-bottom: 10px;
        animation: fm-rise .5s ease .05s both;
      }
      #fm-loyalty-root .fm-eyebrow-icon { width: 15px; height: 15px; color: var(--fm-gold); animation: fm-breathe 3.2s ease-in-out infinite; }

      #fm-loyalty-root h1 {
        font-family: var(--fm-display); font-weight: 600; font-size: 28px;
        letter-spacing: -0.01em; line-height: 1.15; margin: 0 0 8px;
        animation: fm-rise .5s ease .1s both;
      }
      #fm-loyalty-root .fm-sub {
        font-size: 14px; color: var(--fm-ink-soft); margin: 0 0 22px; line-height: 1.7;
        animation: fm-rise .5s ease .15s both;
      }

      #fm-loyalty-root .fm-row { display: flex; gap: 8px; animation: fm-rise .5s ease .2s both; }
      #fm-loyalty-root input[type="email"], #fm-loyalty-root input[type="text"] {
        flex: 1; padding: 12px 15px; border-radius: 12px; border: 1.5px solid var(--fm-line);
        font-size: 15px; font-family: var(--fm-body); background: #FDFAF8; color: var(--fm-ink);
        transition: border-color .15s ease, box-shadow .15s ease;
      }
      #fm-loyalty-root input:focus {
        outline: none; border-color: var(--fm-rose); box-shadow: 0 0 0 3px rgba(178,58,72,.12);
      }
      #fm-loyalty-root button {
        font-family: var(--fm-body); font-weight: 700; font-size: 14px; border: none;
        border-radius: 12px; padding: 12px 20px; cursor: pointer;
        transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
      }
      #fm-loyalty-root button:active { transform: scale(.97); }
      #fm-loyalty-root button:disabled { opacity: .55; cursor: default; }
      #fm-loyalty-root .fm-btn-primary { background: var(--fm-rose); color: #fff; }
      #fm-loyalty-root .fm-btn-primary:hover { filter: brightness(1.06); box-shadow: 0 6px 16px -6px rgba(178,58,72,.55); transform: translateY(-1px); }
      #fm-loyalty-root .fm-btn-gold { background: var(--fm-gold); color: #fff; width: 100%; margin-top: 16px; padding: 14px; }
      #fm-loyalty-root .fm-btn-gold:hover { filter: brightness(1.06); box-shadow: 0 6px 16px -6px rgba(184,134,47,.55); transform: translateY(-1px); }

      #fm-loyalty-root .fm-result { margin-top: 22px; display: none; }
      #fm-loyalty-root .fm-result.fm-show { display: block; animation: fm-unfurl .35s ease both; transform-origin: top; }

      #fm-loyalty-root .fm-balance-block {
        display: flex; align-items: baseline; justify-content: space-between;
        border-block: 1px dashed var(--fm-line); padding: 18px 0; margin-bottom: 18px;
      }
      #fm-loyalty-root .fm-balance-num {
        font-family: var(--fm-display); font-size: 46px; font-weight: 700; line-height: 1;
        color: var(--fm-rose-deep);
      }
      #fm-loyalty-root .fm-balance-label { font-size: 13px; color: var(--fm-ink-soft); }

      #fm-loyalty-root .fm-bloom-track { position: relative; display: flex; justify-content: space-between; margin: 8px 0 10px; padding-block-start: 3px; }
      #fm-loyalty-root .fm-bloom-stem {
        position: absolute; inset-inline-start: 22px; inset-inline-end: 22px; inset-block-start: 12px;
        height: 2px; background: var(--fm-line); overflow: hidden; border-radius: 2px;
      }
      #fm-loyalty-root .fm-bloom-stem-fill {
        position: absolute; inset-inline-start: 0; inset-block-start: 0; height: 100%;
        background: linear-gradient(90deg, var(--fm-sage), var(--fm-gold));
        width: var(--fm-fill, 0%); transition: width .7s cubic-bezier(.22,.9,.3,1);
      }
      #fm-loyalty-root .fm-bloom { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 44px; }
      #fm-loyalty-root .fm-bloom svg { width: 26px; height: 26px; }
      #fm-loyalty-root .fm-bloom .fm-bloom-pts { font-size: 11px; color: var(--fm-ink-soft); font-weight: 700; }
      #fm-loyalty-root .fm-bloom.fm-locked svg { opacity: .3; }
      #fm-loyalty-root .fm-bloom.fm-locked .fm-bloom-pts { opacity: .5; }
      #fm-loyalty-root .fm-bloom:not(.fm-locked) svg { animation: fm-pop .5s ease both; }

      #fm-loyalty-root .fm-next { font-size: 13px; color: var(--fm-ink-soft); text-align: center; margin-top: 6px; }
      #fm-loyalty-root .fm-next b { color: var(--fm-ink); }

      #fm-loyalty-root .fm-tiers { margin-top: 22px; }
      #fm-loyalty-root .fm-tiers-title {
        font-size: 12.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
        color: var(--fm-ink-soft); margin-bottom: 10px;
      }
      #fm-loyalty-root .fm-tier-row {
        display: flex; align-items: center; gap: 12px; font-size: 14px;
        padding: 9px 0; border-bottom: 1px solid var(--fm-blush);
      }
      #fm-loyalty-root .fm-tier-row:last-child { border-bottom: none; }
      #fm-loyalty-root .fm-tier-num {
        font-family: var(--fm-display); font-weight: 600; font-size: 15px; color: var(--fm-gold); min-width: 22px;
      }
      #fm-loyalty-root .fm-tier-pts { flex: 1; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-tier-discount { font-weight: 700; color: var(--fm-sage); }

      #fm-loyalty-root .fm-coupon-box {
        position: relative; background: var(--fm-blush); border: 1.5px dashed var(--fm-gold);
        border-radius: 14px; padding: 20px; text-align: center; margin-top: 16px;
        animation: fm-pop .4s ease both;
      }
      #fm-loyalty-root .fm-coupon-code {
        font-family: var(--fm-display); font-size: 26px; font-weight: 700;
        letter-spacing: .06em; color: var(--fm-rose-deep); margin: 6px 0 10px;
      }
      #fm-loyalty-root .fm-coupon-note { font-size: 13px; color: var(--fm-ink-soft); line-height: 1.6; }
      #fm-loyalty-root .fm-copy-btn {
        margin-top: 10px; background: transparent; border: 1.5px solid var(--fm-gold);
        color: var(--fm-gold); padding: 8px 16px; font-size: 13px;
      }
      #fm-loyalty-root .fm-copy-btn:hover { background: var(--fm-gold); color: #fff; }

      #fm-loyalty-root .fm-empty, #fm-loyalty-root .fm-error {
        text-align: center; padding: 18px 8px; font-size: 14px; color: var(--fm-ink-soft); line-height: 1.8;
      }
      #fm-loyalty-root .fm-error { color: var(--fm-rose-deep); }
      #fm-loyalty-root .fm-loading { text-align: center; padding: 20px; font-size: 14px; color: var(--fm-ink-soft); }

      #fm-loyalty-root .fm-history-link, #fm-loyalty-root .fm-resend-link {
        display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--fm-ink-soft);
        background: none; border: none; cursor: pointer; width: 100%; padding: 6px;
        position: relative;
      }
      #fm-loyalty-root .fm-history-link::after, #fm-loyalty-root .fm-resend-link::after {
        content: ''; display: block; width: 0; height: 1px; background: var(--fm-rose);
        margin-inline: auto; transition: width .2s ease;
      }
      #fm-loyalty-root .fm-history-link:hover::after, #fm-loyalty-root .fm-resend-link:hover::after { width: 60%; }

      #fm-loyalty-root .fm-history-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 11px 0; border-bottom: 1px solid var(--fm-blush); font-size: 13px;
      }
      #fm-loyalty-root .fm-history-code { font-family: var(--fm-display); font-weight: 700; font-size: 16px; }
      #fm-loyalty-root .fm-history-meta { font-size: 11.5px; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-badge { font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 999px; }
      #fm-loyalty-root .fm-badge-active { background: #E9F0E5; color: var(--fm-sage); }
      #fm-loyalty-root .fm-badge-used { background: #F1E9EB; color: #A08A93; }

      #fm-loyalty-root .fm-lang-switch {
        position: absolute; inset-block-start: 18px; inset-inline-end: 20px;
        display: flex; border: 1.5px solid var(--fm-line); border-radius: 999px; overflow: hidden; font-size: 11px; z-index: 2;
      }
      #fm-loyalty-root .fm-lang-btn {
        border: none; background: #fff; color: var(--fm-ink-soft); padding: 4px 10px; cursor: pointer; font-weight: 700;
      }
      #fm-loyalty-root .fm-lang-btn.fm-lang-active { background: var(--fm-rose); color: #fff; }
    `;
    document.head.appendChild(style);
  }

  function bloomStageIndex(points) {
    let unlocked = 0;
    TIERS.forEach(tier => { if (points >= tier.points) unlocked++; });
    return unlocked;
  }

  function renderBloomTrack(points) {
    const unlocked = bloomStageIndex(points);
    const fillPct = (unlocked / TIERS.length) * 100;
    return `
      <div class="fm-bloom-track">
        <div class="fm-bloom-stem"><div class="fm-bloom-stem-fill" style="--fm-fill:${fillPct}%"></div></div>
        ${TIERS.map((tier, i) => `
          <div class="fm-bloom ${i < unlocked ? '' : 'fm-locked'}">
            ${BLOOM_ICONS[BLOOM_SEQUENCE[i]]}
            <span class="fm-bloom-pts">${tier.points}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function animateCountUp(el, endValue) {
    if (prefersReducedMotion() || !endValue) {
      el.textContent = endValue;
      return;
    }
    const duration = 800;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(endValue * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let rootEl = null;

  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem('fm-loyalty-lang', lang); } catch (e) { /* ignore */ }
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
        <div class="fm-eyebrow"><span class="fm-eyebrow-icon">${MINI_BUD_ICON}</span>${t('eyebrow')}</div>
        <h1>${t('heading')}</h1>
        <p class="fm-sub">${t('sub')}</p>
        <div class="fm-row">
          <input type="email" id="fm-email" placeholder="${t('emailPlaceholder')}" />
          <button class="fm-btn-primary" id="fm-check-btn">${t('checkBtn')}</button>
        </div>
        <div class="fm-result" id="fm-result"></div>
        <div class="fm-tiers">
          <div class="fm-tiers-title">${t('tiersTitle')}</div>
          ${TIERS.map((tier, i) => `<div class="fm-tier-row">${t('tierRow')(i, tier.points, tier.discount)}</div>`).join('')}
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
            <div class="fm-balance-num" id="fm-balance-num">0</div>
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
      animateCountUp(document.getElementById('fm-balance-num'), data.points);

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
        <div style="font-size:13px;font-weight:700;color:var(--fm-ink-soft);margin-bottom:8px;">${t('yourCodesTitle')}</div>
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
    injectFonts();
    injectStyles();
    render(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();