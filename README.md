# Les Philfolles – Netlify site (zero-build + CMS)

Deze site is een pure statische website (HTML/CSS/JS). Agenda en foto's zijn te beheren via **/admin** (Decap CMS).

## Snel live (2 minuten)
1. Maak een nieuwe repo op GitHub en upload deze map.
2. Netlify → **Add new site** → **Import from Git** → kies je repo.
3. Klaar: de site is live op je *.netlify.app domein.

## CMS aanzetten (agenda & foto’s beheren via browser)
1. Netlify → Site settings → **Identity** → Enable.
2. Identity → **Registration**: invite-only (aanrader), en invite de bandleden die mogen beheren.
3. Identity → **Git Gateway** → Enable.
4. Ga naar `https://<jouw-site>.netlify.app/admin` en log in.

## Domein koppelen
Netlify → Domain management → add `philfolles.nl` + `www.philfolles.nl`.
Stel in DNS:
- `www` CNAME → `<jouw-site>.netlify.app`
- `@` A record → `75.2.60.5` (of ALIAS/ANAME → `apex-loadbalancer.netlify.com` als je provider dat ondersteunt)

## Content bestanden (als je zonder CMS wilt)
- `content/site.json` (teksten, socials, boekingen)
- `content/events.json` (agenda)
- `content/photos.json` (fotogalerij)

## Foto's
Uploads landen in `assets/uploads/`.

---

Veel plezier! 🎺
