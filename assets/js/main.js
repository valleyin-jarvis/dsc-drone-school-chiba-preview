/* DSCドローンスクール千葉 — interactions (vanilla, no deps) */
(() => {
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const yen = n => n.toLocaleString('ja-JP');

  d.addEventListener('DOMContentLoaded', () => {
    /* header / progress / mobile CTA */
    const header = d.querySelector('.site-header');
    const bar = d.querySelector('.progress');
    const mcta = d.querySelector('.m-cta');
    let ticking = false;
    const onScroll = () => {
      const y = scrollY, max = Math.max(1, d.documentElement.scrollHeight - innerHeight);
      header && header.classList.toggle('is-solid', y > 8);
      bar && bar.style.setProperty('--p', (y / max * 100).toFixed(2) + '%');
      mcta && mcta.classList.toggle('is-show', y > 500);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();

    /* drawer */
    const btn = d.querySelector('.menu-btn');
    if (btn) {
      const toggle = open => { d.body.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く'); };
      btn.addEventListener('click', () => toggle(!d.body.classList.contains('menu-open')));
      d.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
      d.querySelectorAll('.drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));
    }

    /* reveal */
    const rv = d.querySelectorAll('.rv, .flow li');
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
      rv.forEach(el => io.observe(el));
    } else rv.forEach(el => el.classList.add('is-in'));

    /* count up */
    d.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.count;
      if (reduce) return;
      el.textContent = '0';
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; io.disconnect();
        const t0 = performance.now(), dur = 1500;
        const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      io.observe(el);
    });

    /* lite youtube */
    d.querySelectorAll('.yt[data-id]').forEach(el => {
      const play = () => {
        const f = d.createElement('iframe');
        f.src = `https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0`;
        f.title = el.dataset.title || 'YouTube video';
        f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        el.replaceChildren(f);
      };
      el.addEventListener('click', play, { once: true });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
    });

    /* filter chips */
    d.querySelectorAll('[data-filter-group]').forEach(group => {
      const target = d.getElementById(group.dataset.filterGroup);
      group.addEventListener('click', e => {
        const chip = e.target.closest('.chip'); if (!chip) return;
        group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
        const v = chip.dataset.value;
        target.querySelectorAll('[data-cat]').forEach(it => it.classList.toggle('is-hidden', v !== 'all' && !it.dataset.cat.split('|').includes(v)));
      });
    });

    /* faq search */
    const q = d.getElementById('faq-q');
    if (q) q.addEventListener('input', () => {
      const v = q.value.trim().toLowerCase();
      d.querySelectorAll('#faqs .faq-item').forEach(it => it.classList.toggle('is-hidden', !!v && !it.textContent.toLowerCase().includes(v)));
    });

    /* tabs */
    d.querySelectorAll('[role="tablist"]').forEach(tl => {
      const tabs = [...tl.querySelectorAll('[role="tab"]')];
      const select = t => tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; d.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; select(n); n.focus(); } });
      });
    });

    /* course finder */
    const finder = d.getElementById('finder');
    if (finder) {
      const data = JSON.parse(d.getElementById('course-data').textContent);
      const out = finder.querySelector('.result');
      const render = () => {
        const g = finder.querySelector('[name=grade]:checked').value;
        const exp = finder.querySelector('[name=exp]:checked').value;
        const bvlos = finder.querySelector('[name=bvlos]').checked, night = finder.querySelector('[name=night]').checked;
        const idx = bvlos && night ? 3 : bvlos ? 1 : night ? 2 : 0;
        const plans = data[g][exp];
        if (!plans) {
          out.innerHTML = `<p class="r-name">${data[g].name}（初学者）</p><p class="r-contact">一等の初学者コースは、経験やご希望に合わせて個別にご案内しています。まずは無料相談でお気軽にお問い合わせください。</p><a class="btn" href="/dsc-drone-school-chiba-preview/contact/">無料で相談する <span class="arr">→</span></a>`;
          return;
        }
        const [name, price, ga, ji] = plans[idx];
        const sub = Math.floor(price * 0.75);
        out.innerHTML = `<p class="r-name">${data[g].name}｜${exp === 'beginner' ? '初学者' : '経験者'}｜${name}</p>
          <p class="r-price">${yen(price)}<small>円（税込）</small></p>
          <dl><dt>学科講習</dt><dd>${ga}時間（オンライン）</dd><dt>実地講習</dt><dd>${ji}時間</dd></dl>
          <p class="r-sub">人材開発支援助成金（中小企業・最大75%）を活用した場合の自己負担目安：<b>${yen(price - sub)}円</b></p>
          <a class="btn" href="/dsc-drone-school-chiba-preview/contact/?course=${encodeURIComponent(data[g].name + ' ' + name)}">このコースで相談・申込む <span class="arr">→</span></a>`;
      };
      finder.addEventListener('change', render);
      render();
    }

    /* subsidy calculator */
    const calc = d.getElementById('subsidy-calc');
    if (calc) {
      const sel = calc.querySelector('select'), num = calc.querySelector('input[type=number]');
      const upd = () => {
        const price = +sel.value, n = Math.max(1, +num.value || 1), total = price * n, sub = Math.floor(total * 0.75);
        calc.querySelector('[data-o=total]').textContent = yen(total) + '円';
        calc.querySelector('[data-o=sub]').textContent = yen(sub) + '円';
        calc.querySelector('[data-o=self]').textContent = yen(total - sub) + '円';
      };
      sel.addEventListener('change', upd); num.addEventListener('input', upd); upd();
    }

    /* TOC scroll spy */
    const toc = d.querySelectorAll('.toc a');
    if (toc.length && 'IntersectionObserver' in window) {
      const map = new Map([...toc].map(a => [decodeURIComponent(a.hash.slice(1)), a]));
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { toc.forEach(a => a.classList.remove('is-active')); const a = map.get(e.target.id); a && a.classList.add('is-active'); }
      }), { rootMargin: '-20% 0px -70% 0px' });
      map.forEach((a, id) => { const h = d.getElementById(id); h && io.observe(h); });
    }

    /* prefill contact form from query (?course= / ?type=) */
    const form = d.querySelector('form[data-endpoint]');
    if (form) {
      const p = new URLSearchParams(location.search);
      if (p.get('course') && form.message) form.message.value = `【希望コース】${p.get('course')}\n`;
      if (p.get('type') && form.type) form.type.value = p.get('type');
      form.addEventListener('submit', async e => {
        const ep = form.dataset.endpoint;
        if (!form.checkValidity() || !ep || ep.includes('YOUR_FORM_ID')) return;
        e.preventDefault();
        const out = form.querySelector('.form-status'); out.textContent = '送信中…';
        try {
          const r = await fetch(ep, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          out.textContent = r.ok ? 'お問い合わせを受け付けました。担当者より折り返しご連絡いたします。' : '送信に失敗しました。お電話でお問い合わせください。';
          if (r.ok) form.reset();
        } catch { out.textContent = '通信エラーが発生しました。お電話でお問い合わせください。'; }
      });
    }
  });
})();
