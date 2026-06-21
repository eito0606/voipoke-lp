// script.js — VoiPoke 事前登録 LP のクライアント側ロジック（v0.4 instrument）
//
// 役割:
//   1. リリース日（2026/06/30 09:00 JST）までのカウントダウン（4セル：D/H/M/S）
//   2. 事前登録フォーム送信
//   3. オーブの実ドラッグ（座標表示・L/R メーター連動）
//   4. スクロール連動 reveal
//
// 設計方針:
//   - 外部依存ゼロ（CDN なし、ライブラリなし）
//   - prefers-reduced-motion を尊重
//   - すべての処理は IIFE で隔離

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // 1. カウントダウン（D/H/M/S 4セル）
  // ========================================
  const RELEASE_AT = new Date('2026-06-30T09:00:00+09:00').getTime();
  const TICK_MS = 1000; // 秒単位更新

  const cd = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };

  const pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

  function updateCountdown() {
    const diff = RELEASE_AT - Date.now();
    if (diff <= 0) {
      cd.days && (cd.days.textContent = '00');
      cd.hours && (cd.hours.textContent = '00');
      cd.mins && (cd.mins.textContent = '00');
      cd.secs && (cd.secs.textContent = '00');
      return false;
    }
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff / 3_600_000) % 24);
    const mins = Math.floor((diff / 60_000) % 60);
    const secs = Math.floor((diff / 1_000) % 60);
    cd.days && (cd.days.textContent = pad2(days));
    cd.hours && (cd.hours.textContent = pad2(hours));
    cd.mins && (cd.mins.textContent = pad2(mins));
    cd.secs && (cd.secs.textContent = pad2(secs));
    return true;
  }

  if (cd.days && cd.hours && cd.mins && cd.secs) {
    updateCountdown();
    let timer = setInterval(() => {
      if (!updateCountdown()) clearInterval(timer);
    }, TICK_MS);

    // タブ切替時の同期＋一時停止（バッテリー優しく）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateCountdown();
        if (!timer) timer = setInterval(updateCountdown, TICK_MS);
      } else {
        clearInterval(timer); timer = null;
      }
    });
  }

  // ========================================
  // 2. フォーム送信
  // ========================================
  // ⚠️ 新 voipoke-lp（React 排除版）では index.html の inline <script> が
  //   document.addEventListener('submit') で signup-form を捕まえて
  //   Supabase Edge Function /functions/v1/signup-lp に anon key 付きで送る。
  //   ここで二重 listen すると preventDefault は片方しか効かず両方が fetch を
  //   呼んでしまい二重登録になるため、script.js 側は何もしない。
  //
  //   旧 React 版時代に script.js が form 処理を担っていた名残はコメントだけ残し、
  //   実コードは index.html の inline script に統一する。

  // ========================================
  // 3. オーブの実ドラッグ（座標 + L/R メーター連動）
  // ========================================
  // ヒーロー右側のオーブをドラッグすると、X/Y 座標が更新され、
  // L/R チャネルメーターが声の左右配置を視覚化する。
  // 「ドラッグで声が動く」を体験前に予告する触感的フック。

  const orb = document.getElementById('orb');
  const stage = document.getElementById('hero-stage');

  if (orb && stage) {
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const meterLFill = document.getElementById('meter-l-fill');
    const meterRFill = document.getElementById('meter-r-fill');

    let dragging = false;
    let posX = 0; // -1.0 ~ 1.0
    let posY = 0;

    // 自動軌道（ユーザーがドラッグしてないとき、ゆっくり旋回）
    // ⚠️ モバイル（max-width:980px）では orb を完全中央固定にする。
    //   理由：モバイルだと stage の物理サイズが小さく、auto orbit の振幅
    //   (±0.55 × 35% = ±19%) でも orb 本体 + 発光（::before 200x200）が
    //   stage 中央軸から大きく外れて見える＝「中央配置されてない」と感じる。
    //   生きてる感は orb-core の発光と ::before のグロウだけで十分。
    //   touchscreen には hover/cursor の概念も無く、ユーザーが触ったら反応する
    //   のが mobile UX の素直な形（voilab-lp も同様）。
    const isMobile = window.matchMedia('(max-width: 980px)').matches;
    // アプリの OrbView 同様、待機時は画面を旋回せず"その場で呼吸＋フロート"（CSSアニメ）。
    // 旧LPの自動旋回（画面を周回）は廃止＝アプリ忠実コピーのため auto は常に false。
    let auto = false;
    let autoT = 0;

    const fmt = (n) => (n >= 0 ? '+' : '') + n.toFixed(2);

    function applyPos(nx, ny) {
      // クランプ
      posX = Math.max(-1, Math.min(1, nx));
      posY = Math.max(-1, Math.min(1, ny));

      // オーブを中心からの相対位置で配置（半径の70%以内に制限）
      // ⚠️ オーブの base CSS は `.orb { transform: translate(-50%, -50%) }` で
      //   inline style の left:50%/top:50% に対して自身の中心を合わせている。
      //   ここで単純に `translate(x, y)` を書くと base 中央オフセットを潰してしまい
      //   オーブの左上角が stage 中央に来る＝ orb と発光（::before 200x200）が
      //   右下にズレて overflow:hidden で見切れる（モバイルで顕著）。
      //   transform は後勝ちなので両方残すには 1 つの transform 内で 2 段に合成する。
      const rect = stage.getBoundingClientRect();
      const r = Math.min(rect.width, rect.height) * 0.35;
      orb.style.transform =
        `translate(-50%, -50%) translate(${(posX * r).toFixed(1)}px, ${(posY * r).toFixed(1)}px)`;

      // 座標表示
      if (coordX) coordX.textContent = fmt(posX);
      if (coordY) coordY.textContent = fmt(-posY); // 上が +Y

      // L/R メーター（左に行くほど L が強く、右に行くほど R が強く）
      // ベース 30% + 左右オフセット
      const lLevel = 30 + Math.max(0, -posX) * 60;
      const rLevel = 30 + Math.max(0, posX) * 60;
      if (meterLFill) meterLFill.style.height = `${lLevel.toFixed(0)}%`;
      if (meterRFill) meterRFill.style.height = `${rLevel.toFixed(0)}%`;

      // ARIA
      orb.setAttribute('aria-valuenow', String(Math.round(posX * 100)));

      // 音声デモ・モジュール連携（疎結合・CustomEvent）。
      // posX:-1(左)..+1(右) / posY:-1(上=遠い)..+1(下=近い)。
      orb.dispatchEvent(new CustomEvent('orbmove', { detail: { x: posX, y: posY } }));
    }

    // 初期位置
    applyPos(0, 0);

    function pointerToPos(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const r = Math.min(rect.width, rect.height) * 0.35;
      return {
        nx: (clientX - cx) / r,
        ny: (clientY - cy) / r,
      };
    }

    function onDown(e) {
      dragging = true;
      auto = false;
      orb.dispatchEvent(new CustomEvent('orbinteract')); // ユーザー操作（自動旋回・初期化とは区別）
      orb.setPointerCapture && orb.setPointerCapture(e.pointerId);
      const { nx, ny } = pointerToPos(e.clientX, e.clientY);
      applyPos(nx, ny);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const { nx, ny } = pointerToPos(e.clientX, e.clientY);
      applyPos(nx, ny);
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      orb.releasePointerCapture && orb.releasePointerCapture(e.pointerId);
      orb.dispatchEvent(new CustomEvent('orbup')); // リリース＝アプリの"ぷるん"バネ演出トリガー
      // 旋回は廃止したので再開しない（その場で呼吸/フロートを継続）
    }

    orb.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // キーボード操作（アクセシビリティ）
    orb.addEventListener('keydown', (e) => {
      auto = false;
      const step = 0.1;
      let nx = posX, ny = posY;
      switch (e.key) {
        case 'ArrowLeft': nx -= step; break;
        case 'ArrowRight': nx += step; break;
        case 'ArrowUp': ny -= step; break;
        case 'ArrowDown': ny += step; break;
        case 'Home': nx = 0; ny = 0; break;
        default: return;
      }
      e.preventDefault();
      orb.dispatchEvent(new CustomEvent('orbinteract')); // キーボード操作もユーザー操作
      applyPos(nx, ny);
    });

    // 自動軌道（reduce-motion では無効）
    if (!reduceMotion) {
      let lastT = performance.now();
      function tick(now) {
        const dt = (now - lastT) / 1000;
        lastT = now;
        if (auto && !dragging) {
          autoT += dt * 0.5; // 旋回速度
          const nx = Math.cos(autoT) * 0.55;
          const ny = Math.sin(autoT * 1.3) * 0.35;
          applyPos(nx, ny);
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // ウィンドウリサイズで位置再計算
    window.addEventListener('resize', () => applyPos(posX, posY), { passive: true });
  }

  // ========================================
  // 4. Scroll-driven reveal
  // ========================================
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.exp, .bento-heading, .bento-card, .dev-card, .sns-heading, .sns-link, .closing-headline, .ticker'
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    targets.forEach((el) => io.observe(el));
  }
})();
