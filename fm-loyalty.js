/* ==========================================================
   FlowerMad — Loyalty Widget (English version, external hosting)
   ==========================================================
   Usage:
   1. Set APPS_SCRIPT_URL below to your Apps Script Web App URL.
   2. Upload this file as-is to GitHub Pages.
   3. In Ecwid (Custom code section) add just:

      <div id="fm-loyalty-root"></div>
      <script src="https://YOUR-USERNAME.github.io/YOUR-REPO/fm-loyalty.js"></script>

   ========================================================== */
(function () {
  // ⚠️ Replace this with your Apps Script Web App URL
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzdwDo5gs1ZlHyx-SEQS_nrqBdCCcchGdjI87Feys49XFs5Ot0wppclKZDG9yoVO21rA/exec';

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

  // ---------- Inject CSS once ----------
  function injectStyles() {
    if (document.getElementById('fm-loyalty-styles')) return;
    const style = document.createElement('style');
    style.id = 'fm-loyalty-styles';
    style.textContent = `
      #fm-loyalty-root {
        --fm-ink: #3A2436; --fm-ink-soft: #7A6670; --fm-rose: #B23A48;
        --fm-rose-deep: #8C2C38; --fm-gold: #B8862F; --fm-sage: #4C6444; --fm-line: #E9DAD3;
        font-family: Tahoma, 'Segoe UI', sans-serif; color: var(--fm-ink);
        max-width: 480px; margin: 0 auto; box-sizing: border-box;
        direction: ltr; text-align: left;
      }
      #fm-loyalty-root * { box-sizing: border-box; }
      #fm-loyalty-root .fm-card { background: #fff; border: 1px solid var(--fm-line); border-radius: 16px; padding: 24px; }
      #fm-loyalty-root .fm-eyebrow { font-size: 13px; color: var(--fm-rose); font-weight: 700; margin-bottom: 6px; }
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
        ${TIERS.map((t, i) => `
          <div class="fm-bloom ${i < unlocked ? '' : 'fm-locked'}">
            ${BLOOM_ICONS[BLOOM_SEQUENCE[i]]}
            <span class="fm-bloom-pts">${t.points}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function render(root) {
    root.innerHTML = `
      <div class="fm-card">
        <div class="fm-eyebrow">🌹 FlowerMad Loyalty Program</div>
        <h1>Your points add up automatically</h1>
        <p class="fm-sub">Every 10 EGP on any order = 1 point. Enter the email you order with to check your balance.</p>
        <div class="fm-row">
          <input type="email" id="fm-email" placeholder="example@email.com" />
          <button class="fm-btn-primary" id="fm-check-btn">Check My Balance</button>
        </div>
        <div class="fm-result" id="fm-result"></div>
        <div class="fm-tiers">
          <div class="fm-tiers-title">Redemption Tiers</div>
          ${TIERS.map(t => `
            <div class="fm-tier-row">
              <span>${t.points} points</span>
              <span>${t.discount} EGP off</span>
            </div>`).join('')}
        </div>
        <button class="fm-history-link" id="fm-history-btn">My Previous Codes</button>
      </div>
    `;

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
      resultBox.innerHTML = `<div class="fm-error">Please enter a valid email first 🙏</div>`;
      return;
    }

    resultBox.className = 'fm-result fm-show';
    resultBox.innerHTML = `<div class="fm-loading">Fetching your balance...</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!data.found) {
        resultBox.innerHTML = `
          <div class="fm-empty">
            We don't have any points under this email yet.<br>
            Place your first order and start earning points 🌹
          </div>`;
        return;
      }

      let html = `
        <div class="fm-balance-block">
          <div>
            <div class="fm-balance-num">${data.points}</div>
            <div class="fm-balance-label">points available</div>
          </div>
        </div>
        ${renderBloomTrack(data.points)}
      `;

      if (data.canRedeem) {
        html += `
          <div class="fm-next">You can redeem now for <b>${data.eligibleDiscount} EGP off</b></div>
          <button class="fm-btn-gold" id="fm-redeem-btn">Redeem My Points Now</button>
        `;
      } else if (data.pointsToNextTier) {
        html += `
          <div class="fm-next">You need <b>${data.pointsToNextTier} more points</b> to reach the next reward</div>
        `;
      }

      resultBox.innerHTML = html;

      const redeemBtn = document.getElementById('fm-redeem-btn');
      if (redeemBtn) {
        redeemBtn.addEventListener('click', () => redeemPoints(email));
      }
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">Something went wrong connecting. Please try again shortly.</div>`;
    }
  }

  async function redeemPoints(email) {
    const resultBox = document.getElementById('fm-result');
    resultBox.innerHTML = `<div class="fm-loading">Sending a verification code to your email...</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=request-otp`);
      const data = await res.json();

      if (!data.success) {
        resultBox.innerHTML = `<div class="fm-error">There was a problem sending the code. Please try again.</div>`;
        return;
      }

      resultBox.innerHTML = `
        <div class="fm-otp-box">
          <div style="font-size:14px;margin-bottom:10px;">We sent a 6-digit code to your email. Enter it here:</div>
          <div class="fm-row">
            <input type="text" id="fm-otp-input" placeholder="------" maxlength="6" inputmode="numeric" />
            <button class="fm-btn-primary" id="fm-otp-confirm">Confirm</button>
          </div>
          <button class="fm-resend-link" id="fm-otp-resend">Didn't get the code? Resend</button>
        </div>
      `;

      document.getElementById('fm-otp-confirm').addEventListener('click', () => confirmOtp(email));
      document.getElementById('fm-otp-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmOtp(email);
      });
      document.getElementById('fm-otp-resend').addEventListener('click', () => redeemPoints(email));
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">Something went wrong connecting. Please try again shortly.</div>`;
    }
  }

  async function confirmOtp(email) {
    const otpInput = document.getElementById('fm-otp-input');
    const otp = otpInput.value.trim();
    const resultBox = document.getElementById('fm-result');

    if (!otp || otp.length !== 6) {
      resultBox.innerHTML = `<div class="fm-error">Please enter the 6-digit code</div>` + resultBox.innerHTML;
      return;
    }

    resultBox.innerHTML = `<div class="fm-loading">Verifying your code...</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=redeem&otp=${encodeURIComponent(otp)}`);
      const data = await res.json();

      if (!data.success) {
        resultBox.innerHTML = `<div class="fm-error">${data.message || 'Something went wrong. Please try again.'}</div>`;
        return;
      }

      resultBox.innerHTML = `
        <div class="fm-coupon-box">
          <div style="font-size:13px;color:var(--fm-ink-soft)">Your discount code</div>
          <div class="fm-coupon-code">${data.couponCode}</div>
          <div class="fm-coupon-note">
            ${data.discount} EGP off — paste it in the coupon field at checkout.<br>
            Remaining balance: ${data.remainingPoints} points.
          </div>
          <button class="fm-copy-btn" id="fm-copy-btn">Copy Code</button>
        </div>
      `;

      document.getElementById('fm-copy-btn').addEventListener('click', function () {
        navigator.clipboard.writeText(data.couponCode);
        this.textContent = 'Copied ✓';
        setTimeout(() => { this.textContent = 'Copy Code'; }, 1800);
      });
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">Something went wrong connecting. Please try again shortly.</div>`;
    }
  }

  async function showHistory() {
    const emailInput = document.getElementById('fm-email');
    const email = emailInput.value.trim();
    const resultBox = document.getElementById('fm-result');

    if (!email || !email.includes('@')) {
      resultBox.className = 'fm-result fm-show';
      resultBox.innerHTML = `<div class="fm-error">Please enter your email first to view your codes 🙏</div>`;
      return;
    }

    resultBox.className = 'fm-result fm-show';
    resultBox.innerHTML = `<div class="fm-loading">Fetching your codes...</div>`;

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}&action=history`);
      const data = await res.json();

      if (!data.coupons || data.coupons.length === 0) {
        resultBox.innerHTML = `<div class="fm-empty">You haven't redeemed anything yet. Once you have enough points, you can redeem them above.</div>`;
        return;
      }

      const statusLabel = (status) => status === 'ACTIVE'
        ? '<span class="fm-badge fm-badge-active">Active</span>'
        : '<span class="fm-badge fm-badge-used">Used</span>';

      const formatDate = (d) => {
        if (!d) return null;
        const parsed = new Date(d.replace(' ', 'T').replace(' +0000', 'Z'));
        if (isNaN(parsed)) return d.split(' ')[0];
        return parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      };

      resultBox.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:var(--fm-ink-soft);margin-bottom:6px;">Your Codes</div>
        ${data.coupons.map(c => `
          <div class="fm-history-item">
            <div>
              <div class="fm-history-code">${c.couponCode}</div>
              <div class="fm-history-meta">
                ${c.discount} EGP off — ${c.pointsUsed} points
                ${c.orderNumber ? `<br>Used on order #${c.orderNumber}${c.usedDate ? ' — ' + formatDate(c.usedDate) : ''}` : ''}
              </div>
            </div>
            ${statusLabel(c.status)}
          </div>
        `).join('')}
      `;
    } catch (err) {
      resultBox.innerHTML = `<div class="fm-error">Something went wrong connecting. Please try again shortly.</div>`;
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
