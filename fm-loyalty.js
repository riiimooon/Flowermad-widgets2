/* ==========================================================
   FlowerMad — Loyalty Widget (Bilingual, "Gift Tag" redesign)
   ==========================================================
   Usage:
   1. Set APPS_SCRIPT_URL below to your Apps Script Web App URL.
   2. Upload this file as-is to GitHub Pages.
   3. In Ecwid (Custom code section) add just:

      <div id="fm-loyalty-root"></div>
      <script src="https://YOUR-USERNAME.github.io/YOUR-REPO/fm-loyalty.js"></script>

   Design notes:
   - Brand palette: EC247E (pink, primary) / 1E1E24 (ink) /
     FFF8F0 (cream) / 111D4A (navy) / FFCF99 (peach).
   - Concept: a florist's gift tag / ticket stub. A pink ribbon
     bar tops the card, a punched "tag hole" sits at the corner,
     a dashed ticket-stub divider separates balance from tiers,
     and the point tiers render as a ribbon of blooming roses
     (bud -> half -> open -> full) that fill in pink as they
     unlock — the flower literally blooms with your points.
   - Fonts: Fraunces + Inter for EN, Cairo for AR — loaded
     dynamically by this script, nothing static needed in Ecwid.
   - Respects prefers-reduced-motion.
   ========================================================== */
(function () {
  // ⚠️ Replace this with your Apps Script Web App URL
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-_QqKJ1Wc-cAb-H1Wrv3v8AQ8dy1JvFyYap6wDhPmb_UEIua4jbpv9oJoFoNe-E1iew/exec';

  const TIERS = [
    { points: 100, discount: 30 },
    { points: 200, discount: 65 },
    { points: 350, discount: 120 },
    { points: 500, discount: 180 }
  ];

  // Bloom icons: petals fill in with brand pink as each stage unlocks,
  // stems/centers use ink & navy for depth. Locked stages stay peach.
  const BLOOM_ICONS = {
    bud: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V16" stroke="#111D4A" stroke-width="2" stroke-linecap="round"/><path d="M16 16C16 16 10 14 10 9C10 5.5 13 3 16 3C19 3 22 5.5 22 9C22 14 16 16 16 16Z" fill="#FFCF99" stroke="#EC247E" stroke-width="1.6"/></svg>',
    half: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V15" stroke="#111D4A" stroke-width="2" stroke-linecap="round"/><path d="M16 8C16 8 21 9 21 13.5C21 17 16 18.5 16 18.5C16 18.5 11 17 11 13.5C11 9 16 8 16 8Z" fill="rgba(236,36,126,0.5)" stroke="#EC247E" stroke-width="1.6"/><path d="M16 8C13.5 6 13.5 3.5 16 2C18.5 3.5 18.5 6 16 8Z" fill="rgba(236,36,126,0.5)" stroke="#EC247E" stroke-width="1.4"/></svg>',
    open: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V16" stroke="#111D4A" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="10" r="4" fill="#EC247E"/><path d="M16 10C16 10 9 9 8 4C13 3 16 10 16 10Z" fill="rgba(236,36,126,0.78)" stroke="#EC247E" stroke-width="1.2"/><path d="M16 10C16 10 23 9 24 4C19 3 16 10 16 10Z" fill="rgba(236,36,126,0.78)" stroke="#EC247E" stroke-width="1.2"/><path d="M16 10C16 10 15 3 19 0C22 4 16 10 16 10Z" fill="rgba(236,36,126,0.78)" stroke="#EC247E" stroke-width="1.2"/></svg>',
    full: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 30V17" stroke="#111D4A" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="10" r="3.4" fill="#1E1E24"/><path d="M16 10C16 10 8 10 6 4C12 2 16 10 16 10Z" fill="#EC247E" stroke="#1E1E24" stroke-width="1"/><path d="M16 10C16 10 24 10 26 4C20 2 16 10 16 10Z" fill="#EC247E" stroke="#1E1E24" stroke-width="1"/><path d="M16 10C16 10 10 4 12 -1C18 0 16 10 16 10Z" fill="rgba(236,36,126,0.9)" stroke="#1E1E24" stroke-width="1"/><path d="M16 10C16 10 22 4 20 -1C14 0 16 10 16 10Z" fill="rgba(236,36,126,0.9)" stroke="#1E1E24" stroke-width="1"/></svg>'
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
      sub: 'كل 10 جنيه في أي أوردر = نقطة<br>اكتب إيميلك اللي بتطلب بيه وشوف رصيدك',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'اعرض رصيدي',
      tiersTitle: 'درجات الاستبدال',
      tierRow: (index, points, discount) => `<span class="fm-tier-num">${index + 1}</span><span class="fm-tier-pts">${points} نقطة</span><span class="fm-tier-discount">خصم ${discount} جنيه</span>`,
      historyBtn: 'كوبوناتي السابقة',
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
      eyebrow: 'FlowerMad Points Program',
      heading: 'Your Points Balance',
      sub: 'Every 10 EGP on any order = 1 point <br> Enter the email you order with to check your balance.',
      emailPlaceholder: 'example@email.com',
      checkBtn: 'Check My Balance',
      tiersTitle: 'Redemption Tiers',
      tierRow: (index, points, discount) => `<span class="fm-tier-num">${index + 1}</span><span class="fm-tier-pts">${points} pts</span><span class="fm-tier-discount">${discount} EGP off</span>`,
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

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- Load brand fonts once ----------
  function injectFonts() {
    if (document.getElementById('fm-loyalty-fonts')) return;
    const link = document.createElement('link');
    link.id = 'fm-loyalty-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  // ---------- Inject CSS once ----------
  function injectStyles() {
    if (document.getElementById('fm-loyalty-styles')) return;
    const style = document.createElement('style');
    style.id = 'fm-loyalty-styles';
    style.textContent = `
      #fm-loyalty-root {
        --fm-pink: #EC247E; --fm-ink: #1E1E24; --fm-cream: #FFF8F0;
        --fm-navy: #111D4A; --fm-peach: #FFCF99;
        --fm-line: rgba(17,29,74,0.16); --fm-ink-soft: rgba(30,30,36,0.62);
        --fm-pink-15: rgba(236,36,126,0.14); --fm-pink-50: rgba(236,36,126,0.5);
        --fm-font: 'Inter', Tahoma, Arial, sans-serif;
        --fm-font-display: 'Fraunces', Georgia, serif;
        color: var(--fm-ink); font-family: var(--fm-font);
        max-width: 440px; margin: 0 auto; box-sizing: border-box;
      }
      #fm-loyalty-root[lang="ar"] {
        --fm-font: 'Cairo', Tahoma, Arial, sans-serif;
        --fm-font-display: 'Cairo', Tahoma, Arial, sans-serif;
      }
      #fm-loyalty-root * { box-sizing: border-box; }

      @keyframes fm-fade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        #fm-loyalty-root * { animation: none !important; transition: none !important; }
      }

      #fm-loyalty-root .fm-card {
        position: relative;
        background: var(--fm-cream);
        border: 1px solid var(--fm-line);
        border-radius: 6px 28px 6px 28px;
        padding: 44px 34px 34px;
        overflow: visible;
        animation: fm-fade .3s ease both;
      }
      #fm-loyalty-root .fm-ribbon {
        position: absolute; inset-block-start: 0; inset-inline-start: 0; inset-inline-end: 0;
        height: 5px; background: var(--fm-pink);
        border-radius: 6px 28px 0 0;
      }
      #fm-loyalty-root .fm-tag-hole {
        position: absolute; inset-block-start: -12px; inset-inline-start: 30px;
        width: 22px; height: 22px; border-radius: 50%;
        background: var(--fm-cream); border: 2px solid var(--fm-navy);
        display: flex; align-items: center; justify-content: center;
      }
      #fm-loyalty-root .fm-tag-hole::after {
        content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--fm-pink);
      }

      #fm-loyalty-root .fm-eyebrow {
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
        color: var(--fm-navy); font-weight: 700; margin: 6px 0 16px;
        font-family: 'Inter', Tahoma, Arial, sans-serif;
      }
      #fm-loyalty-root[lang="ar"] .fm-eyebrow { font-family: var(--fm-font); letter-spacing: 0; }
      #fm-loyalty-root .fm-eyebrow-icon { width: 13px; height: 13px; color: var(--fm-pink); flex-shrink: 0; }

      #fm-loyalty-root h1 {
        font-family: var(--fm-font-display);
        font-weight: 600; font-size: 27px; letter-spacing: -.01em; line-height: 1.2; margin: 0 0 10px;
      }
      #fm-loyalty-root[lang="ar"] h1 { font-weight: 800; }
      #fm-loyalty-root .fm-sub {
        font-size: 13.5px; color: var(--fm-ink-soft); margin: 0 0 26px; line-height: 1.7;
      }

      #fm-loyalty-root .fm-row { display: flex; flex-direction: column; gap: 10px; }
      #fm-loyalty-root .fm-row input[type="email"], #fm-loyalty-root .fm-row button { width: 100%; }
      #fm-loyalty-root input[type="email"], #fm-loyalty-root input[type="text"] {
        padding: 12px 16px; border-radius: 999px; border: 1px solid var(--fm-line);
        font-size: 14px; font-family: var(--fm-font); background: #fff; color: var(--fm-ink);
        transition: border-color .15s ease, box-shadow .15s ease;
      }
      #fm-loyalty-root input:focus {
        outline: none; border-color: var(--fm-pink); box-shadow: 0 0 0 3px var(--fm-pink-15);
      }
      #fm-loyalty-root button {
        font-family: var(--fm-font); font-weight: 700; font-size: 12px; letter-spacing: .06em; text-transform: uppercase;
        border: none; border-radius: 999px; padding: 12px 22px; cursor: pointer;
        transition: opacity .15s ease, transform .1s ease;
      }
      #fm-loyalty-root[lang="ar"] button { letter-spacing: 0; text-transform: none; font-size: 13px; }
      #fm-loyalty-root button:hover { opacity: .85; }
      #fm-loyalty-root button:active { transform: scale(.98); }
      #fm-loyalty-root button:disabled { opacity: .5; cursor: default; }
      #fm-loyalty-root .fm-btn-primary { background: var(--fm-navy); color: var(--fm-cream); }
      #fm-loyalty-root .fm-btn-gold { background: var(--fm-pink); color: var(--fm-cream); width: 100%; margin-top: 18px; padding: 15px; font-size: 13px; }
      #fm-loyalty-root[lang="ar"] .fm-btn-gold { font-size: 14px; }

      #fm-loyalty-root .fm-result { margin-top: 22px; display: none; }
      #fm-loyalty-root .fm-result.fm-show { display: block; animation: fm-fade .3s ease both; }

      #fm-loyalty-root .fm-balance-block {
        display: flex; align-items: baseline; gap: 10px; padding-bottom: 18px;
      }
      #fm-loyalty-root .fm-balance-num {
        font-family: var(--fm-font-display); font-size: 42px; font-weight: 700; line-height: 1; color: var(--fm-navy);
      }
      #fm-loyalty-root .fm-balance-label {
        font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--fm-ink-soft);
      }
      #fm-loyalty-root[lang="ar"] .fm-balance-label { letter-spacing: 0; }

      #fm-loyalty-root .fm-bloom-track { position: relative; display: flex; justify-content: space-between; margin: 4px 0 6px; padding-block-start: 3px; }
      #fm-loyalty-root .fm-bloom-stem {
        position: absolute; inset-inline-start: 22px; inset-inline-end: 22px; inset-block-start: 12px;
        height: 2px; border-radius: 2px;
        background-image: repeating-linear-gradient(to right, var(--fm-navy) 0 4px, transparent 4px 9px);
        opacity: .5;
      }
      #fm-loyalty-root .fm-bloom-stem-fill {
        position: absolute; inset-inline-start: 0; inset-block-start: 0; height: 100%;
        background: var(--fm-pink);
        width: var(--fm-fill, 0%); transition: width .5s ease;
      }
      #fm-loyalty-root .fm-bloom { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 44px; }
      #fm-loyalty-root .fm-bloom svg { width: 24px; height: 24px; }
      #fm-loyalty-root .fm-bloom .fm-bloom-pts { font-size: 11px; color: var(--fm-ink-soft); font-weight: 700; }
      #fm-loyalty-root .fm-bloom.fm-locked svg { opacity: .45; }
      #fm-loyalty-root .fm-bloom.fm-locked .fm-bloom-pts { opacity: .55; }

      #fm-loyalty-root .fm-next { font-size: 13px; color: var(--fm-ink-soft); text-align: center; margin-top: 6px; line-height: 1.6; }
      #fm-loyalty-root .fm-next b { color: var(--fm-ink); }

      #fm-loyalty-root .fm-divider { display: flex; align-items: center; gap: 8px; margin: 24px 0 20px; }
      #fm-loyalty-root .fm-divider-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--fm-navy); opacity: .5; flex-shrink: 0; }
      #fm-loyalty-root .fm-divider-line { flex: 1; border-top: 2px dashed var(--fm-line); }

      #fm-loyalty-root .fm-tiers-title {
        font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
        color: var(--fm-ink-soft); margin-bottom: 10px;
      }
      #fm-loyalty-root[lang="ar"] .fm-tiers-title { letter-spacing: 0; text-transform: none; }
      #fm-loyalty-root .fm-tier-row {
        display: flex; align-items: center; gap: 12px; font-size: 14px;
        padding: 9px 0; border-bottom: 1px solid var(--fm-pink-15);
      }
      #fm-loyalty-root .fm-tier-row:last-child { border-bottom: none; }
      #fm-loyalty-root .fm-tier-num {
        display: flex; align-items: center; justify-content: center;
        width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
        background: var(--fm-peach); color: var(--fm-navy); font-weight: 700; font-size: 11px;
      }
      #fm-loyalty-root .fm-tier-pts { flex: 1; color: var(--fm-ink-soft); }
      #fm-loyalty-root .fm-tier-discount { font-weight: 700; color: var(--fm-pink); }

      #fm-loyalty-root .fm-coupon-box {
        background: var(--fm-navy); color: var(--fm-cream);
        border-radius: 16px; padding: 26px 22px; text-align: center; margin-top: 16px;
      }
      #fm-loyalty-root .fm-coupon-label { font-size: 12px; color: rgba(255,248,240,0.65); }
      #fm-loyalty-root .fm-coupon-code {
        font-family: var(--fm-font-display); font-size: 24px; font-weight: 700; letter-spacing: .04em; color: var(--fm-pink); margin: 8px 0 12px;
      }
      #fm-loyalty-root .fm-coupon-note { font-size: 13px; color: rgba(255,248,240,0.8); line-height: 1.6; }
      #fm-loyalty-root .fm-copy-btn {
        margin-top: 14px; background: var(--fm-pink); border: none;
        color: var(--fm-cream); padding: 9px 18px; font-size: 11px;
      }
      #fm-loyalty-root .fm-copy-btn:hover { opacity: .85; }

      #fm-loyalty-root .fm-empty, #fm-loyalty-root .fm-error {
        text-align: center; padding: 18px 8px; font-size: 14px; color: var(--fm-ink-soft); line-height: 1.7;
      }
      #fm-loyalty-root .fm-error { color: var(--fm-ink); font-weight: 600; }
      #fm-loyalty-root .fm-loading { text-align: center; padding: 20px; font-size: 14px; color: var(--fm-ink-soft); }

      #fm-loyalty-root .fm-history-link, #fm-loyalty-root .fm-resend-link {
        display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--fm-ink-soft);
        text-decoration: underline; background: none; border: none; cursor: pointer; width: 100%; padding: 6px;
        text-transform: none; letter-spacing: 0; font-weight: 500;
      }
      #fm-loyalty-root .fm-history-link:hover, #fm-loyalty-root .fm-resend-link:hover { color: var(--fm-pink); opacity: 1; }

      #fm-loyalty-root .fm-history-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 11px 0; border-bottom: 1px solid var(--fm-pink-15); font-size: 13px;
      }
      #fm-loyalty-root .fm-history-code { font-weight: 700; font-size: 15px; font-family: var(--fm-font-display); }
      #fm-loyalty-root .fm-history-meta { font-size: 11.5px; color: var(--fm-ink-soft); margin-top: 2px; }
      #fm-loyalty-root .fm-badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; flex-shrink: 0; }
      #fm-loyalty-root .fm-badge-active { background: var(--fm-peach); color: var(--fm-navy); }
      #fm-loyalty-root .fm-badge-used { background: rgba(17,29,74,0.08); color: var(--fm-ink-soft); }

      #fm-loyalty-root .fm-lang-switch {
        position: absolute; inset-block-start: 18px; inset-inline-end: 18px;
        display: flex; border-radius: 999px; overflow: hidden; font-size: 11px;
        background: rgba(17,29,74,0.06);
      }
      #fm-loyalty-root .fm-lang-btn {
        border: none; background: transparent; color: var(--fm-ink-soft); padding: 5px 11px; cursor: pointer; font-weight: 700;
        border-radius: 999px; transition: background .15s ease, color .15s ease;
      }
      #fm-loyalty-root .fm-lang-btn.fm-lang-active { background: var(--fm-pink); color: var(--fm-cream); }
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
        <div class="fm-ribbon"></div>
        <div class="fm-tag-hole"></div>
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
        <div class="fm-divider"><span class="fm-divider-dot"></span><span class="fm-divider-line"></span><span class="fm-divider-dot"></span></div>
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
          <div class="fm-balance-num" id="fm-balance-num">0</div>
          <div class="fm-balance-label">${t('pointsAvailable')}</div>
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
          <div style="font-size:14px;margin-bottom:12px;">${t('otpSentMsg')}</div>
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
          <div class="fm-coupon-label">${t('yourCode')}</div>
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
        <div style="font-size:13px;font-weight:700;color:var(--fm-ink-soft);margin-bottom:10px;">${t('yourCodesTitle')}</div>
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
