/**
 * discord-invite.js — ぼいラボ Discord 自動招待 LP 側スクリプト
 *
 * 役割:
 *   ページ内にある data-discord-invite="..." 属性を持つリンクを
 *   全部「Edge Function /discord-oauth-callback (init) -> authorize_url」フローに置換する。
 *
 * 使い方:
 *   <a href="https://discord.gg/M9Za7XZgbF"
 *      data-discord-invite="voilab-lp"
 *      data-color-code="">
 *     Discordに参加する
 *   </a>
 *
 *   ページ末尾で:
 *     <script src="/assets/discord-invite.js"></script>
 *
 * このスクリプトは:
 *   1) ページロード時に該当リンクを全部探す
 *   2) クリック時に preventDefault して fetch(/init)
 *   3) 返ってきた authorize_url に location.href
 *   4) ネット失敗時は元の静的招待リンクにフォールバック（生存性最優先）
 *
 * 設定:
 *   window.DISCORD_INVITE_CONFIG = {
 *     supabaseUrl:   '...',
 *     supabaseAnon:  '...',
 *     fallbackUrl:   'https://discord.gg/M9Za7XZgbF',
 *   }
 *   をこのスクリプト読み込みより前に定義しておく。
 */

(function () {
  'use strict';

  var cfg = (window.DISCORD_INVITE_CONFIG || {});
  var SUPABASE_URL  = cfg.supabaseUrl  || '';
  var SUPABASE_ANON = cfg.supabaseAnon || '';
  var FALLBACK_URL  = cfg.fallbackUrl  || 'https://discord.gg/M9Za7XZgbF';
  var INIT_URL      = SUPABASE_URL + '/functions/v1/discord-oauth-callback';

  // ────────────────────────────────────────────
  // utm の取得
  // ────────────────────────────────────────────
  function readUtm() {
    try {
      var p = new URLSearchParams(location.search);
      return {
        utm_source:   p.get('utm_source') || null,
        utm_medium:   p.get('utm_medium') || null,
        utm_campaign: p.get('utm_campaign') || null,
      };
    } catch (e) {
      return { utm_source: null, utm_medium: null, utm_campaign: null };
    }
  }

  // ────────────────────────────────────────────
  // init API を叩いて authorize_url を取得
  // ────────────────────────────────────────────
  async function fetchAuthorizeUrl(source, colorCode) {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      console.warn('[discord-invite] Supabase config missing, using fallback');
      return null;
    }
    try {
      var utm = readUtm();
      var res = await fetch(INIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
        },
        body: JSON.stringify({
          action: 'init',
          source: source,
          color_code: colorCode || null,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
        }),
      });
      var data = await res.json();
      if (data && data.ok && typeof data.authorize_url === 'string') {
        return data.authorize_url;
      }
      console.warn('[discord-invite] init returned not ok:', data);
      return null;
    } catch (e) {
      console.warn('[discord-invite] init failed:', e);
      return null;
    }
  }

  // ────────────────────────────────────────────
  // クリック乗っ取り
  // ────────────────────────────────────────────
  function bindLink(el) {
    if (el.dataset.discordInviteBound === '1') return;
    el.dataset.discordInviteBound = '1';

    el.addEventListener('click', async function (e) {
      var source = el.getAttribute('data-discord-invite');
      var colorCode = el.getAttribute('data-color-code') || null;
      if (!source) return; // 何もしない＝静的リンクのまま

      // 通常のクリックのみ乗っ取る（middle-click / cmd+click は素通し）
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();

      // UI 上の連打防止
      if (el.dataset.discordInviting === '1') return;
      el.dataset.discordInviting = '1';
      var prevText = el.getAttribute('aria-label') || '';
      try {
        var url = await fetchAuthorizeUrl(source, colorCode);
        if (url) {
          location.href = url;
          return;
        }
        // フォールバック：静的招待リンクへ
        location.href = el.href || FALLBACK_URL;
      } finally {
        el.dataset.discordInviting = '';
      }
    });
  }

  function bindAll() {
    var els = document.querySelectorAll('[data-discord-invite]');
    for (var i = 0; i < els.length; i++) {
      bindLink(els[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  // 動的に追加された要素にも反応する MutationObserver
  try {
    var mo = new MutationObserver(bindAll);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* ignore */ }
})();
