/* ─────────────────────────────────────────────────────────────────────────────
   HGUGM Neurocirugía — Curso de Residentes MIR — Service Worker
   HGUGM · Residentes
───────────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'neurosurgery-hgugm-v1';

const PRECACHE_ASSETS = [
  './', './index.html', './manifest.json',
  './assets/css/main.css', './assets/js/app.js', './assets/js/reader.js',
  './assets/js/quiz.js', './assets/js/progress.js', './assets/js/search.js',
  './assets/js/knowledge.js', './assets/js/abbreviations.js', './assets/js/i18n.js',
  './content/i18n/en.json', './content/i18n/es.json', './assets/img/logo.svg',
  './content/pearls/daily_pearls.json',
  // Block A — Neuro-Oncología
  './content/chapters/a1_glioblastoma.json',
  './content/chapters/a2_gliomas_bajo_grado.json',
  './content/chapters/a3_meningiomas.json',
  './content/chapters/a4_metastasis_cerebrales.json',
  './content/chapters/a5_tumores_hipofisarios.json',
  './content/chapters/a6_linfoma_snc.json',
  './content/chapters/a7_tumores_pediatricos.json',
  // Block B — Cerebrovascular
  './content/chapters/b1_ictus_isquemico.json',
  './content/chapters/b2_hemorragia_intracerebral.json',
  './content/chapters/b3_hemorragia_subaracnoidea.json',
  './content/chapters/b4_aneurismas_intracraneales.json',
  './content/chapters/b5_malformaciones_av.json',
  // Block C — Columna
  './content/chapters/c1_patologia_cervical.json',
  './content/chapters/c2_hernia_discal_lumbar.json',
  './content/chapters/c3_estenosis_espinal.json',
  './content/chapters/c4_tumores_espinales.json',
  './content/chapters/c5_traumatismo_vertebral.json',
  // Block D — Funcional
  './content/chapters/d1_cirugia_epilepsia.json',
  './content/chapters/d2_estimulacion_cerebral_profunda.json',
  './content/chapters/d3_dolor_cronico.json',
  './content/chapters/d4_neuralgia_trigemino.json',
  // Block E — Base de Cráneo
  './content/chapters/e1_base_craneo.json',
  './content/chapters/e2_schwannoma_vestibular.json',
  './content/chapters/e3_nervio_periferico.json',
  // Block F — Urgencias
  './content/chapters/f1_tce_grave.json',
  './content/chapters/f2_hematomas_craneales.json',
  './content/chapters/f3_hidrocefalia.json',
  // Block G — Investigación
  './content/chapters/g1_diseno_ensayos.json',
  './content/chapters/g2_neuroimagen.json',
  './content/chapters/g3_monitorizacion_intraoperatoria.json',
  './content/chapters/g4_escritura_cientifica.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
