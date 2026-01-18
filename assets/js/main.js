/* Les Philfolles – zero-build static site
   Content is editable via Decap CMS (Netlify CMS fork).
*/

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function pad2(n){return String(n).padStart(2,'0');}
function formatDateNL(iso){
  // iso may be YYYY-MM-DD
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m-1, d));
  return dt.toLocaleDateString('nl-NL', { weekday: 'short', day:'2-digit', month:'short', year:'numeric', timeZone:'UTC' });
}

function safeUrl(u){
  try{
    if(!u) return '';
    const url = new URL(u, window.location.origin);
    return url.href;
  }catch{ return '' }
}

async function loadJson(path){
  const res = await fetch(path, { cache: 'no-cache' });
  if(!res.ok) throw new Error(`Could not load ${path}`);
  return await res.json();
}

function sortEvents(events){
  return [...events].sort((a,b) => (a.date||'').localeCompare(b.date||''));
}

function isPastEvent(e){
  if(!e?.date) return false;
  const today = new Date();
  const [y,m,d] = e.date.split('-').map(Number);
  const dt = new Date(y, m-1, d, 23, 59, 59);
  return dt < today;
}

function renderEvents(events){
  const upcomingEl = $('#eventsUpcoming');
  const pastEl = $('#eventsPast');
  if(!upcomingEl || !pastEl) return;

  const upcoming = sortEvents(events).filter(e => !isPastEvent(e));
  const past = sortEvents(events).filter(e => isPastEvent(e)).reverse();

  const makeCard = (e) => {
    const url = safeUrl(e.url);
    const time = [e.start_time, e.end_time].filter(Boolean).join('–');
    const cityVenue = [e.city, e.venue].filter(Boolean).join(' · ');

    return `
      <article class="event">
        <div class="event__meta">
          <div class="event__date">${formatDateNL(e.date)}</div>
          ${time ? `<div class="event__time">${time}</div>` : ''}
        </div>
        <div class="event__main">
          <h3 class="event__title">${escapeHtml(e.title || 'Optreden')}</h3>
          ${cityVenue ? `<div class="event__sub">${escapeHtml(cityVenue)}</div>` : ''}
          ${e.notes ? `<p class="event__notes">${escapeHtml(e.notes)}</p>` : ''}
        </div>
        <div class="event__cta">
          ${url ? `<a class="btn btn--ghost" href="${url}" target="_blank" rel="noopener">Info</a>` : '<span class="btn btn--ghost btn--disabled" aria-disabled="true">Info</span>'}
        </div>
      </article>
    `;
  };

  upcomingEl.innerHTML = upcoming.length
    ? upcoming.map(makeCard).join('')
    : `<div class="empty">Nog geen optredens ingepland. Boek ons en zet de eerste datum!</div>`;

  pastEl.innerHTML = past.slice(0, 8).length
    ? past.slice(0, 8).map(makeCard).join('')
    : `<div class="empty">Binnenkort vullen we deze met mooie herinneringen.</div>`;
}

function renderGallery(photos){
  const grid = $('#galleryGrid');
  if(!grid) return;

  const items = (photos || []).slice(0, 30);
  grid.innerHTML = items.map((p, idx) => {
    const src = p.image;
    const caption = p.caption ? escapeHtml(p.caption) : '';
    const alt = p.alt ? escapeHtml(p.alt) : (caption || 'Les Philfolles');
    return `
      <button class="gitem" data-idx="${idx}" aria-label="Open foto">
        <img loading="lazy" src="${src}" alt="${alt}" />
        ${caption ? `<span class="gcap">${caption}</span>` : ''}
      </button>
    `;
  }).join('');

  // Lightbox
  const modal = $('#lightbox');
  const modalImg = $('#lightboxImg');
  const modalCap = $('#lightboxCaption');
  const closeBtn = $('#lightboxClose');

  function open(idx){
    const p = items[idx];
    if(!p) return;
    modalImg.src = p.image;
    modalImg.alt = p.alt || p.caption || 'Les Philfolles';
    modalCap.textContent = p.caption || '';
    modal.showModal();
  }
  function close(){
    modal.close();
  }

  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.gitem');
    if(!btn) return;
    open(Number(btn.dataset.idx));
  });
  closeBtn?.addEventListener('click', close);
  modal?.addEventListener('click', (ev) => {
    const rect = modal.getBoundingClientRect();
    const inDialog = rect.top <= ev.clientY && ev.clientY <= rect.top + rect.height
      && rect.left <= ev.clientX && ev.clientX <= rect.left + rect.width;
    if(!inDialog) close();
  });
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal?.open) close();
  });
}

function applySite(site){
  if(!site) return;
  if(site.tagline) $('#tagline').textContent = site.tagline;
  if(site.hero_cta_text) $('#heroCta').textContent = site.hero_cta_text;
  if(site.hero_cta_href) $('#heroCta').setAttribute('href', site.hero_cta_href);

  if(site.about_title) $('#aboutTitle').textContent = site.about_title;
  if(site.about_body) $('#aboutBody').textContent = site.about_body;

  if(site.booking_name) $('#bookingName').textContent = site.booking_name;
  if(site.booking_phone) {
    $('#bookingPhone').textContent = site.booking_phone;
    $('#bookingPhone').setAttribute('href', `tel:${site.booking_phone.replace(/\s+/g,'')}`);
  }
  if(site.booking_email) {
    $('#bookingEmail').textContent = site.booking_email;
    $('#bookingEmail').setAttribute('href', `mailto:${site.booking_email}`);
  }

  const social = {
    facebook: site.facebook_url,
    instagram: site.instagram_url,
    youtube: site.youtube_url,
  };
  for(const [k,v] of Object.entries(social)){
    const a = document.querySelector(`[data-social="${k}"]`);
    if(!a) continue;
    const url = safeUrl(v);
    if(url){
      a.href = url;
      a.classList.remove('is-hidden');
    }else{
      a.classList.add('is-hidden');
    }
  }

  if(site.presskit_pdf){
    const a = $('#presskit');
    a.href = site.presskit_pdf;
    a.classList.remove('is-hidden');
  }

  if(site.youtube_embed){
    const iframe = $('#youtubeEmbed');
    iframe.src = site.youtube_embed;
    iframe.closest('.video')?.classList.remove('is-hidden');
  }
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

(async function init(){
  try{
    const [site, events, photos] = await Promise.all([
      loadJson('/content/site.json'),
      loadJson('/content/events.json'),
      loadJson('/content/photos.json'),
    ]);
    applySite(site);
    renderEvents(events.events || []);
    renderGallery(photos.photos || []);
  }catch(err){
    console.error(err);
  }
})();
