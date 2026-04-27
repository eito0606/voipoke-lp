// script.js — VoiPoke 事前登録 LP のクライアント側ロジック（v0.2 design-led）
//
// 役割:
//   1. リリース日（2026/06/30 09:00 JST）までのカウントダウン
//   2. 事前登録フォームの送信ハンドリング
//   3. オーブのマウス追従パララックス（ヒーロー視線誘導）
//   4. スクロール連動で各セクションをフェードアップ
//
// 設計方針:
//   - 外部依存ゼロ（CDN なし、ライブラリなし）
//   - prefers-reduced-motion を尊重
//   - すべての処理は IIFE で隔離、グローバル汚染なし

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // 1. カウントダウン
  // ========================================

  // リリース日：2026年6月30日 09:00 JST
  const RELEASE_AT = new Date('2026-06-30T09:00:00+09:00').getTime();
  const TICK_MS = 30_000; // 30秒間隔（分単位の表示で十分）

  const cd = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
  };

  const pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

  function updateCountdown() {
    const diff = RELEASE_AT - Date.now();
    if (diff <= 0) {
      cd.days && (cd.days.textContent = '00');
      cd.hours && (cd.hours.textContent = '00');
      cd.mins && (cd.mins.textContent = '00');
      return false;
    }
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff / 3_600_000) % 24);
    const mins = Math.floor((diff / 60_000) % 60);
    cd.days && (cd.days.textContent = pad2(days));
    cd.hours && (cd.hours.textContent = pad2(hours));
    cd.mins && (cd.mins.textContent = pad2(mins));
    return true;
  }

  if (cd.days && cd.hours && cd.mins) {
    updateCountdown();
    const timer = setInterval(() => {
      if (!updateCountdown()) clearInterval(timer);
    }, TICK_MS);

    // タブが見えるようになったら即同期
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateCountdown();
    });
  }

  // ========================================
  // 2. フォーム送信
  // ========================================
  const form = document.getElementById('signup-form');
  const result = document.getElementById('signup-result');

  if (form && result) {
    const FORM_ENDPOINT = form.action;
    const isPlaceholder = FORM_ENDPOINT.includes('REPLACE_ME');

    form.addEventListener('submit', async (event) => {
      if (isPlaceholder) {
        event.preventDefault();
        result.textContent = '✋ 受付システムは準備中。エイトの SNS をフォローしておいてください。';
        result.className = 'signup-result is-success';
        return;
      }

      event.preventDefault();
      const data = new FormData(form);
      const email = data.get('email');

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        result.textContent = '✗ メアドの形式を確認してください。';
        result.className = 'signup-result is-error';
        return;
      }

      result.textContent = '送信中…';
      result.className = 'signup-result';

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (res.ok) {
          result.textContent = '✓ 登録完了。リリース日（6/30）にお知らせします。';
          result.className = 'signup-result is-success';
          form.reset();
        } else {
          result.textContent = '✗ 送信に失敗しました。少し時間をおいて再度お試しください。';
          result.className = 'signup-result is-error';
        }
      } catch {
        result.textContent = '✗ ネットワークエラー。あとで試してください。';
        result.className = 'signup-result is-error';
      }
    });
  }

  // ========================================
  // 3. オーブのマウス追従パララックス
  // ========================================
  // ヒーロー右側のオーブが、マウス位置に追従して微妙に動く。
  // 「ドラッグで動く」体験を予告する視覚的フック。

  if (!reduceMotion) {
    const orb = document.getElementById('orb');
    const stage = document.getElementById('orb-stage');

    if (orb && stage) {
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let rafId = null;

      // 実装ノート：
      //   - マウス位置を stage 中心からの相対座標で正規化（-1.0 ~ 1.0）
      //   - オーブの最大移動量は ±18px（控えめ）
      //   - ease-out で追従（直接代入だとカクつく）

      const MAX_OFFSET = 18;
      const EASE = 0.085;

      function tick() {
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
          rafId = null;
          return;
        }
        currentX += dx * EASE;
        currentY += dy * EASE;
        orb.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
        rafId = requestAnimationFrame(tick);
      }

      // ステージ全体ではなくページ全体のマウスを追う（より自然）
      window.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // 中心からの相対距離を正規化（画面端で ±1 になる）
        const nx = (e.clientX - cx) / window.innerWidth;
        const ny = (e.clientY - cy) / window.innerHeight;
        targetX = nx * MAX_OFFSET * 2;
        targetY = ny * MAX_OFFSET * 2;
        if (!rafId) rafId = requestAnimationFrame(tick);
      }, { passive: true });

      // タッチデバイス：タップで波紋風に小さく弾ませる
      orb.addEventListener('pointerdown', () => {
        orb.animate(
          [
            { transform: orb.style.transform + ' scale(1)' },
            { transform: orb.style.transform + ' scale(0.92)' },
            { transform: orb.style.transform + ' scale(1)' },
          ],
          { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
      });
    }
  }

  // ========================================
  // 4. スクロール連動 reveal
  // ========================================
  // セクション/カードに .reveal を付与し、視界に入ったら .is-in を追加。
  // 各セクションが下から fade-up で現れる。

  if (!reduceMotion && 'IntersectionObserver' in window) {
    // 対象を自動付与（HTML を汚さない）
    const targets = document.querySelectorAll(
      '.exp, .bento-heading, .bento-card, .dev-card, .sns-heading, .sns-link, .closing-headline'
    );
    targets.forEach((el) => el.classList.add('reveal'));

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    targets.forEach((el) => io.observe(el));
  }
})();
