/**
 * UCDP CMS Content Loader
 * Fetches JSON data files and updates page elements tagged with data-cms attributes.
 * Falls back gracefully to hardcoded HTML if JSON is unavailable.
 */
(function() {
  // Find the data file path from the page's meta tag
  const meta = document.querySelector('meta[name="cms-data"]');
  if (!meta) return;
  
  const dataPath = meta.getAttribute('content');
  const depth = (dataPath.match(/\.\.\//g) || []).length;
  const base = depth > 0 ? '../'.repeat(depth) : '';

  fetch(dataPath)
    .then(r => { if (!r.ok) throw new Error('No data'); return r.json(); })
    .then(data => {
      // Simple text/html replacement
      document.querySelectorAll('[data-cms]').forEach(el => {
        const key = el.getAttribute('data-cms');
        if (data[key] !== undefined && data[key] !== '') {
          el.innerHTML = data[key];
        }
      });

      // Timeline items
      if (data.timeline) {
        const container = document.getElementById('cms-timeline');
        if (container) {
          container.innerHTML = data.timeline.map(item => `
            <div class="timeline-item">
              <div class="timeline-year">${item.year}</div>
              <div class="timeline-content">
                <h4>${item.title}</h4>
                <p>${item.text}</p>
              </div>
            </div>`).join('');
        }
      }

      // Values cards
      if (data.values) {
        const container = document.getElementById('cms-values');
        if (container) {
          container.innerHTML = data.values.map(v => `
            <div class="value-big">
              <span class="icon">${v.icon}</span>
              <h4>${v.title}</h4>
              <p>${v.text}</p>
            </div>`).join('');
        }
      }

      // Impact cards (projects)
      if (data.impact_cards) {
        const container = document.getElementById('cms-impact-cards');
        if (container) {
          container.innerHTML = data.impact_cards.map(c => `
            <div class="impact-card">
              <div class="num">${c.num}</div>
              <div class="label">${c.label}</div>
            </div>`).join('');
        }
      }

      // Quick facts (projects)
      if (data.quick_facts) {
        const container = document.getElementById('cms-quick-facts');
        if (container) {
          container.innerHTML = data.quick_facts.map(f => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid rgba(201,160,106,0.15);">
              <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); flex-shrink:0;">${f.label}</span>
              <span style="font-size:0.84rem; color:var(--brown); font-weight:600; text-align:right; line-height:1.4;">${f.value}</span>
            </div>`).join('');
        }
      }

      // How it works steps (projects)
      if (data.steps) {
        const container = document.getElementById('cms-steps');
        if (container) {
          container.innerHTML = data.steps.map(s => `
            <div class="step">
              <div class="step-num"></div>
              <div class="step-text"><h4>${s.title}</h4><p>${s.text}</p></div>
            </div>`).join('');
        }
      }

      // Volunteer roles
      if (data.roles) {
        const container = document.getElementById('cms-roles');
        if (container) {
          container.innerHTML = data.roles.map(r => `
            <div class="role-card">
              <span class="r-icon">${r.icon}</span>
              <h3>${r.title}</h3>
              <p>${r.text}</p>
            </div>`).join('');
        }
      }

      // Volunteer expectations
      if (data.expectations) {
        const container = document.getElementById('cms-expectations');
        if (container) {
          container.innerHTML = data.expectations.map(e => `
            <div class="expect-item">
              <div class="expect-icon">${e.icon}</div>
              <div><strong>${e.title}</strong><p>${e.text}</p></div>
            </div>`).join('');
        }
      }

      // Contact details
      if (data.email) {
        document.querySelectorAll('[data-cms-email]').forEach(el => { el.textContent = data.email; el.href = 'mailto:' + data.email; });
      }
      if (data.phone) {
        document.querySelectorAll('[data-cms-phone]').forEach(el => { el.textContent = data.phone; });
      }
      if (data.address) {
        document.querySelectorAll('[data-cms-address]').forEach(el => { el.innerHTML = data.address.replace(/\n/g, '<br/>'); });
      }
    })
    .catch(() => {
      // Silently fall back to hardcoded HTML — no user-visible error
    });
})();
