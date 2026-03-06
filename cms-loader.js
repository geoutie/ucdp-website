/**
 * UCDP CMS Content Loader v3
 * Fetches JSON data and updates all tagged page elements.
 * Falls back silently to hardcoded HTML if data unavailable.
 */
(function () {
  const meta = document.querySelector('meta[name="cms-data"]');
  if (!meta) return;
  const dataPath = meta.getAttribute('content');

  fetch(dataPath)
    .then(r => { if (!r.ok) throw new Error('No data'); return r.json(); })
    .then(data => {

      // Simple data-cms text replacements
      document.querySelectorAll('[data-cms]').forEach(el => {
        const key = el.getAttribute('data-cms');
        if (data[key] !== undefined && data[key] !== '') el.innerHTML = data[key];
      });

      // Timeline
      if (data.timeline) {
        const c = document.getElementById('cms-timeline');
        if (c) c.innerHTML = data.timeline.map(item =>
          '<div class="timeline-item"><div class="timeline-year">' + item.year + '</div>' +
          '<div class="timeline-content"><h4>' + item.title + '</h4><p>' + item.text + '</p></div></div>'
        ).join('');
      }

      // Core Values
      if (data.values) {
        const c = document.getElementById('cms-values');
        if (c) c.innerHTML = data.values.map(v =>
          '<div class="value-big"><span class="icon">' + v.icon + '</span><h4>' + v.title + '</h4><p>' + v.text + '</p></div>'
        ).join('');
      }

      // Impact Cards
      if (data.impact_cards) {
        const c = document.getElementById('cms-impact-cards');
        if (c) c.innerHTML = data.impact_cards.map(card =>
          '<div class="impact-card"><div class="num">' + card.num + '</div><div class="label">' + card.label + '</div></div>'
        ).join('');
      }

      // Project Stats (mobile-youth-advocacy)
      if (data.project_stats) {
        const c = document.getElementById('cms-project-stats');
        if (c) c.innerHTML = data.project_stats.map(s =>
          '<div class="pstat"><div class="num">' + s.num + '</div><div class="label">' + s.label + '</div></div>'
        ).join('');
      }

      // Activity Cards (mobile-youth-advocacy)
      if (data.activity_cards) {
        const c = document.getElementById('cms-activity-cards');
        if (c) c.innerHTML = data.activity_cards.map(a =>
          '<a href="' + a.link + '" class="activity-card">' +
          '<div class="activity-icon">' + a.icon + '</div>' +
          '<h3>' + a.title + '</h3><p>' + a.description + '</p>' +
          '<span class="activity-link">Learn More \u2192</span></a>'
        ).join('');
      }

      // Quick Facts
      if (data.quick_facts) {
        const c = document.getElementById('cms-quick-facts');
        if (c) c.innerHTML = data.quick_facts.map(f =>
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(201,160,106,0.15);">' +
          '<span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);flex-shrink:0;">' + f.label + '</span>' +
          '<span style="font-size:0.84rem;color:var(--brown);font-weight:600;text-align:right;line-height:1.4;">' + f.value + '</span></div>'
        ).join('');
      }

      // Steps
      if (data.steps) {
        const c = document.getElementById('cms-steps');
        if (c) c.innerHTML = data.steps.map(s =>
          '<div class="step"><div class="step-num"></div>' +
          '<div class="step-text"><h4>' + s.title + '</h4><p>' + s.text + '</p></div></div>'
        ).join('');
      }

      // Volunteer Roles
      if (data.roles) {
        const c = document.getElementById('cms-roles');
        if (c) c.innerHTML = data.roles.map(r =>
          '<div class="role-card"><span class="r-icon">' + r.icon + '</span><h3>' + r.title + '</h3><p>' + r.text + '</p></div>'
        ).join('');
      }

      // Volunteer FAQ
      if (data.faqs) {
        const c = document.getElementById('cms-faq-list');
        if (c) c.innerHTML = data.faqs.map(faq =>
          '<div class="faq-item">' +
          '<div class="faq-question" onclick="this.parentElement.classList.toggle(\'open\')">' +
          faq.question + ' <span class="faq-icon">+</span></div>' +
          '<div class="faq-answer"><p>' + faq.answer + '</p></div></div>'
        ).join('');
      }

      // Contact page details
      if (data.phone) {
        const el = document.getElementById('cms-phone');
        const link = document.getElementById('cms-phone-link');
        if (el) el.textContent = data.phone;
        if (link) link.href = 'tel:' + data.phone.replace(/\s/g, '');
      }
      if (data.address) {
        const el = document.getElementById('cms-address');
        if (el) el.innerHTML = data.address.replace(/\n/g, '<br/>');
      }
      if (data.office_hours) {
        const el = document.getElementById('cms-office-hours');
        if (el) el.textContent = data.office_hours;
      }
      if (data.maps_url) {
        const map = document.getElementById('cms-map');
        if (map) map.src = data.maps_url;
      }
      if (data.involve_cards) {
        const c = document.getElementById('cms-involve-cards');
        if (c) c.innerHTML = data.involve_cards.map(card =>
          '<div class="involve-card"><span class="icon">' + card.icon + '</span>' +
          '<h3>' + card.title + '</h3><p>' + card.description + '</p></div>'
        ).join('');
      }

      // Lobby & Advocacy: YouTube videos
      if (data.videos_section) {
        var vs = data.videos_section;
        var featIframe = document.getElementById('cms-featured-video');
        if (featIframe && vs.featured_id && vs.featured_id.indexOf('VIDEO_ID') === -1)
          featIframe.src = 'https://www.youtube.com/embed/' + vs.featured_id;
        var featTitle = document.getElementById('cms-featured-title');
        if (featTitle && vs.featured_title) featTitle.textContent = vs.featured_title;
        if (vs.grid && vs.grid.length) {
          var grid = document.getElementById('cms-video-grid');
          if (grid) grid.innerHTML = vs.grid.map(v =>
            '<div class="video-card"><div class="video-thumb">' +
            '<iframe src="https://www.youtube.com/embed/' + v.id + '" title="' + v.title + '"' +
            ' style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"' +
            ' allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"' +
            ' allowfullscreen loading="lazy"></iframe></div>' +
            '<p class="video-label">' + v.title + '</p></div>'
          ).join('');
        }
        var chanLink = document.getElementById('cms-yt-channel');
        if (chanLink && vs.channel_url) chanLink.href = vs.channel_url;
      }

      // Photo gallery
      if (data.photos && data.photos.length) {
        var gallery = document.querySelector('.gallery-grid');
        if (gallery) gallery.innerHTML = data.photos.map((p, i) => {
          var src = typeof p === 'string' ? p : p.photo;
          return '<div class="gallery-thumb"><img loading="lazy" src="' + src + '" alt="Photo ' + (i+1) + '"/>' +
            '<div class="thumb-overlay"><span>\uD83D\uDD0D</span></div></div>';
        }).join('');
      }

      // Sidebar photo
      if (data.sidebar_photo) {
        var simg = document.querySelector('.project-sidebar img');
        if (simg) simg.src = data.sidebar_photo;
      }

      // About page photos
      if (data.story_photo) {
        var si = document.getElementById('cms-story-photo');
        if (si) si.src = data.story_photo;
      }
      if (data.team_photo) {
        var ti = document.getElementById('cms-team-photo');
        if (ti) ti.src = data.team_photo;
      }

      // Homepage: hero carousel
      if (data.hero_photos && data.hero_photos.length) {
        var slides = document.getElementById('cms-hero-slides');
        if (slides) {
          slides.innerHTML = data.hero_photos.map((p, i) => {
            var src = typeof p === 'string' ? p : p.photo;
            return '<div class="hero-slide' + (i===0?' active':'') + '">' +
              '<img loading="lazy" src="' + src + '" alt="UCDP photo ' + (i+1) + '"/></div>';
          }).join('');
          var dots = document.querySelector('.carousel-dots');
          if (dots) dots.innerHTML = data.hero_photos.map((_, i) =>
            '<button class="carousel-dot' + (i===0?' active':'') + '"></button>').join('');
        }
      }
      // Homepage: about photo
      if (data.about_photo) {
        var ap = document.getElementById('cms-about-photo');
        if (ap) ap.src = data.about_photo;
      }
      // Homepage: vision banner bg
      if (data.vision_bg) {
        var vb = document.querySelector('.vision-banner');
        if (vb) vb.style.backgroundImage =
          'linear-gradient(135deg,rgba(43,26,15,0.92),rgba(107,63,31,0.88)),url(\'' + data.vision_bg + '\')';
      }
      // Homepage: stats
      if (data.stats) {
        document.querySelectorAll('.stat-item').forEach(function(el, i) {
          if (!data.stats[i]) return;
          var num = el.querySelector('.num');
          var label = el.querySelector('.label');
          if (num) num.textContent = data.stats[i].num;
          if (label) label.textContent = data.stats[i].label;
        });
      }

      // Publications (research page)
      if (data.publications) {
        var pc = document.querySelector('.reveal[style*="flex-direction:column"]');
        if (pc) pc.innerHTML = data.publications.map(p =>
          '<div style="background:var(--cream);border:1px solid rgba(201,160,106,0.25);border-radius:14px;padding:24px 28px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;">' +
          '<div><div style="font-size:0.65rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;">' + p.type + ' \xB7 ' + p.year + '</div>' +
          '<h4 style="font-family:\'Playfair Display\',serif;font-size:1rem;font-weight:700;color:var(--brown);margin-bottom:6px;">' + p.title + '</h4>' +
          '<p style="font-size:0.84rem;color:var(--muted);line-height:1.65;">' + p.description + '</p></div>' +
          '<a href="' + p.url + '" target="_blank" style="display:inline-block;background:var(--brown);color:var(--white);text-decoration:none;padding:10px 18px;border-radius:8px;font-size:0.8rem;font-weight:800;white-space:nowrap;">View \u2192</a></div>'
        ).join('');
      }

    })
    .catch(function() {});

})();

// Technical settings — runs on every page to apply GA ID + Formspree IDs
(function() {
  var base = document.querySelector('meta[name="cms-data"]') ? 
    document.querySelector('meta[name="cms-data"]').getAttribute('content').replace(/[^/]+$/, '') : '';
  var depth = (base.match(/\.\.\//g) || []).length;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';
  
  fetch(prefix + '_data/technical.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .catch(function() { return null; })
    .then(function(tech) {
      if (!tech) return;
      if (tech.ga_id && tech.ga_id !== 'G-XXXXXXXXXX') {
        document.querySelectorAll('script[src*="googletagmanager"]').forEach(function(s) {
          s.src = s.src.replace('G-XXXXXXXXXX', tech.ga_id);
        });
      }
      if (tech.formspree_contact && tech.formspree_contact !== 'YOUR_FORM_ID') {
        var f = document.getElementById('contact-form');
        if (f) f.action = 'https://formspree.io/f/' + tech.formspree_contact;
      }
      if (tech.formspree_volunteer && tech.formspree_volunteer !== 'YOUR_FORM_ID_2') {
        var f = document.getElementById('volunteer-form');
        if (f) f.action = 'https://formspree.io/f/' + tech.formspree_volunteer;
      }
    });
})();
