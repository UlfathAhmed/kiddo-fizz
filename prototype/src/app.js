/* KiddoFizz Cola — motion prototype.
   One procedurally-built bottle, pinned centre-stage, rotating a quarter turn
   per scroll beat while the page colour tweens underneath it.

   The bottle is a lathe: a 2D profile curve revolved around Y. That means no
   asset pipeline for the pitch, and when the client's real dieline arrives it
   replaces buildBottle() without touching any of the scroll code below. */
(function () {
  "use strict";

  // ?motion=reduced forces the reduced-motion build, so the accessible variant can
  // be demonstrated without changing an OS setting.
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                location.search.indexOf("motion=reduced") !== -1;
  if (REDUCED) document.documentElement.classList.add("reduced");

  var ACCENTS = {
    cyan:  { hex: 0x14BEE1, css: "#14BEE1", dark: "#0A7E99", onLight: true },
    yel:   { hex: 0xFFC72C, css: "#FFC72C", dark: "#96690A", onLight: true },
    green: { hex: 0x37B34A, css: "#37B34A", dark: "#1F6E2C", onLight: true },
    red:   { hex: 0xDE2C24, css: "#DE2C24", dark: "#DE2C24", onLight: false }
  };
  var PAPER = { r: 253, g: 251, b: 247 };

  var beats = [].slice.call(document.querySelectorAll(".beat"));
  var dots = [].slice.call(document.querySelectorAll(".dots i"));
  var order = beats.map(function (b) { return b.getAttribute("data-accent"); });
  var canvas = document.getElementById("scene");

  // ---------------------------------------------------------------- helpers
  function hexToRgb(h) { return { r: (h >> 16) & 255, g: (h >> 8) & 255, b: h & 255 }; }
  function mix(a, b, t) {
    return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
  }
  function css(c) {
    return "rgb(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + ")";
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  // frame-rate independent easing toward a target
  function damp(cur, target, lambda, dt) { return target + (cur - target) * Math.exp(-lambda * dt); }

  var root = document.documentElement;
  function paint(accentKey, blendKey, t) {
    var a = ACCENTS[accentKey], b = ACCENTS[blendKey];
    var rgb = mix(hexToRgb(a.hex), hexToRgb(b.hex), t);
    root.style.setProperty("--accent", css(rgb));
    root.style.setProperty("--accent-dark", t < 0.5 ? a.dark : b.dark);
    // page background is the accent laid very lightly over paper, never the accent itself
    root.style.setProperty("--bg", css(mix(PAPER, rgb, 0.10)));
  }
  paint(order[0], order[0], 0);

  // The pill floats over the red hero first and over pale sections afterwards, so
  // its own colours travel with the scroll rather than being fixed either way.
  var NAV_RED = { fg: [255,255,255,1], line: [255,255,255,.38], fill: [255,255,255,.07],
                  btn: [255,255,255,.16], b1: [255,255,255,1], b2: [255,199,44,1] };
  var NAV_LIT = { fg: [27,22,20,1], line: [27,22,20,.13], fill: [253,251,247,.9],
                  btn: [27,22,20,.07], b1: [222,44,36,1], b2: [27,111,224,1] };

  function mix4(a, b, t) {
    return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t, a[3]+(b[3]-a[3])*t];
  }
  function rgba(c) {
    return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," +
           (Math.round(c[3] * 1000) / 1000) + ")";
  }
  function paintNav(t) {
    root.style.setProperty("--nav-fg", rgba(mix4(NAV_RED.fg, NAV_LIT.fg, t)));
    root.style.setProperty("--nav-line", rgba(mix4(NAV_RED.line, NAV_LIT.line, t)));
    root.style.setProperty("--nav-fill", rgba(mix4(NAV_RED.fill, NAV_LIT.fill, t)));
    root.style.setProperty("--nav-btn", rgba(mix4(NAV_RED.btn, NAV_LIT.btn, t)));
    root.style.setProperty("--brand-1", rgba(mix4(NAV_RED.b1, NAV_LIT.b1, t)));
    root.style.setProperty("--brand-2", rgba(mix4(NAV_RED.b2, NAV_LIT.b2, t)));
    root.style.setProperty("--nav-shadow", t > 0.55 ? "0 12px 32px rgba(27,22,20,.11)" : "none");
  }

  // ------------------------------------------------------------ the 3D part
  var renderer, scene, camera, bottle, bubbles, ready = false;

  function makeEnvironment() {
    // A studio-ish equirectangular gradient, built in a 2D canvas and run through
    // PMREM. Keeps the page self-contained: no HDRI to fetch, and the CSP would
    // block one anyway.
    var c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    var g = c.getContext("2d");
    var grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.45, "#e7eef3");
    grad.addColorStop(0.72, "#b9c1c7");
    grad.addColorStop(1, "#6f767c");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 256);
    [[110, 60, 70], [370, 40, 55], [250, 150, 90]].forEach(function (b) {
      var rg = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
      rg.addColorStop(0, "rgba(255,255,255,.95)");
      rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg;
      g.beginPath();
      g.arc(b[0], b[1], b[2], 0, Math.PI * 2);
      g.fill();
    });
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    var pmrem = new THREE.PMREMGenerator(renderer);
    var env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose();
    tex.dispose();
    return env;
  }

  // The bottle silhouette, bottom to top, as [radius, height] pairs.
  // What makes it read as a COLA bottle rather than a generic one: the contour
  // waist at y=1.80, the twin bulges either side of it, and a long narrow neck
  // (0.20 against a 0.70 body - roughly the 29% a real contour bottle runs).
  var PROFILE = [
    [0.000, 0.00], [0.320, 0.00], [0.560, 0.025], [0.650, 0.10], [0.680, 0.26],
    [0.700, 0.90], [0.690, 1.34], [0.628, 1.80], [0.662, 2.22], [0.672, 2.56],
    [0.620, 2.92], [0.498, 3.22], [0.358, 3.52], [0.258, 3.80], [0.205, 4.02],
    [0.198, 4.44], [0.236, 4.52], [0.236, 4.62], [0.000, 4.62]
  ];
  var BODY_TOP = 4.62;

  // One spline through the profile, resampled once and then sliced. Slicing a
  // shared sample keeps the label sitting exactly on the glass through the waist,
  // which a straight cylinder cannot do.
  var PROFILE_PTS = (function () {
    var pts = PROFILE.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    return new THREE.SplineCurve(pts).getPoints(190).map(function (p) {
      return new THREE.Vector2(Math.max(0, p.x), p.y); // the spline can overshoot the axis
    });
  })();

  // radiusScale nudges the surface in or out; yMin/yMax slice a band out of it;
  // closeAt appends a flat disc so the shape is watertight.
  function lathe(radiusScale, yMin, yMax, closeAt) {
    var pts = [];
    for (var i = 0; i < PROFILE_PTS.length; i++) {
      var p = PROFILE_PTS[i];
      if (yMin != null && p.y < yMin) continue;
      if (yMax != null && p.y > yMax) continue;
      pts.push(new THREE.Vector2(p.x * radiusScale, p.y));
    }
    if (closeAt != null) pts.push(new THREE.Vector2(0, closeAt));
    return new THREE.LatheGeometry(pts, 96);
  }

  function drawLabel(ctx, x, w, h, accent) {
    var cx = x + w / 2;
    ctx.fillStyle = accent.css;
    ctx.fillRect(x, 0, w, h);

    // white field, the way a real wrap label carries the mark
    var fw = w * 0.62, fh = h * 0.375, fx = cx - fw / 2, fy = h * 0.13, r = 30;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(fx + r, fy);
    ctx.arcTo(fx + fw, fy, fx + fw, fy + fh, r);
    ctx.arcTo(fx + fw, fy + fh, fx, fy + fh, r);
    ctx.arcTo(fx, fy + fh, fx, fy, r);
    ctx.arcTo(fx, fy, fx + fw, fy, r);
    ctx.closePath();
    ctx.fill();

    // two-tone wordmark, measured so the pair sits centred
    ctx.textBaseline = "alphabetic";
    ctx.font = "700 74px Fredoka, sans-serif";
    var w1 = ctx.measureText("Kiddo").width, w2 = ctx.measureText("Fizz").width;
    var sx = cx - (w1 + w2) / 2, by = fy + fh * 0.62;
    ctx.textAlign = "left";
    ctx.fillStyle = "#DE2C24"; ctx.fillText("Kiddo", sx, by);
    ctx.fillStyle = "#1B6FE0"; ctx.fillText("Fizz", sx + w1, by);

    ctx.textAlign = "center";
    ctx.fillStyle = "#1B1614";
    try { ctx.letterSpacing = "13px"; } catch (e) { /* older engines: no tracking */ }
    ctx.font = "800 19px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("COLA", cx + 6, fy + fh * 0.90);
    try { ctx.letterSpacing = "0px"; } catch (e) {}

    // claim pill
    var pw = w * 0.42, ph = 50, px = cx - pw / 2, py = h * 0.60;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(px + 25, py);
    ctx.arcTo(px + pw, py, px + pw, py + ph, 25);
    ctx.arcTo(px + pw, py + ph, px, py + ph, 25);
    ctx.arcTo(px, py + ph, px, py, 25);
    ctx.arcTo(px, py, px + pw, py, 25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1B1614";
    ctx.font = "800 21px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(accent.claim, cx, py + ph * 0.68);

    ctx.fillStyle = accent.onLight ? "#1B1614" : "#FFFFFF";
    ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("250ml e", cx, h * 0.90);
  }

  var labelCanvas, labelTexture, labelAccent = null;

  function paintLabelTexture(accent) {
    if (!labelCanvas) {
      labelCanvas = document.createElement("canvas");
      labelCanvas.width = 3072;
      labelCanvas.height = 400;
    }
    var ctx = labelCanvas.getContext("2d");
    for (var i = 0; i < 4; i++) drawLabel(ctx, i * 768, 768, 400, accent);
    if (labelTexture) labelTexture.needsUpdate = true;
    labelAccent = accent;
  }

  function buildBottle(env) {
    var g = new THREE.Group();

    var liquid = new THREE.Mesh(
      lathe(0.93, null, 4.02, 4.02),
      new THREE.MeshPhysicalMaterial({
        color: 0x7C3311, roughness: 0.26, metalness: 0,
        clearcoat: 0.7, clearcoatRoughness: 0.25, envMap: env, envMapIntensity: 0.8
      })
    );
    g.add(liquid);

    var glass = new THREE.Mesh(
      lathe(1, null, null, null),
      new THREE.MeshPhysicalMaterial({
        color: 0xEAF6F6, transparent: true, opacity: 0.30,
        roughness: 0.06, metalness: 0,
        clearcoat: 1, clearcoatRoughness: 0.06,
        envMap: env, envMapIntensity: 1.15,
        side: THREE.DoubleSide, depthWrite: false
      })
    );
    g.add(glass);

    var accent = { css: "#14BEE1", claim: "CAFFEINE FREE", onLight: true };
    paintLabelTexture(accent);
    labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // A lathe, not a cylinder, so the label hugs the contour waist.
    // u=0 on a lathe faces +Z, i.e. straight at the camera, and that is exactly
    // where a seam falls - so shift the lookup half a repeat to put a design
    // centre front and centre instead.
    labelTexture.wrapS = THREE.RepeatWrapping;
    labelTexture.offset.x = 0.125;
    var label = new THREE.Mesh(
      lathe(1.014, 0.62, 2.62, null),
      new THREE.MeshStandardMaterial({
        map: labelTexture, roughness: 0.55, metalness: 0, envMap: env, envMapIntensity: 0.35
      })
    );
    g.add(label);

    var capMat = new THREE.MeshPhysicalMaterial({
      color: 0x14BEE1, roughness: 0.3, metalness: 0.1,
      clearcoat: 0.8, envMap: env, envMapIntensity: 0.9
    });
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.46, 30, 1, false), capMat);
    cap.position.y = 4.40;
    g.add(cap);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.272, 0.055, 30), capMat);
    collar.position.y = 4.15;
    g.add(collar);

    // soft contact shadow so the bottle sits in space rather than floating
    var sc = document.createElement("canvas");
    sc.width = sc.height = 256;
    var sg = sc.getContext("2d");
    var rg = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, "rgba(27,22,20,.42)");
    rg.addColorStop(0.55, "rgba(27,22,20,.13)");
    rg.addColorStop(1, "rgba(27,22,20,0)");
    sg.fillStyle = rg;
    sg.fillRect(0, 0, 256, 256);
    var shadowTex = new THREE.CanvasTexture(sc);
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1, 0.42, 1);
    // The shadow lives outside the rotating group: it belongs to the ground, so it
    // must not swing with the bottle.
    var ground = new THREE.Group();
    ground.add(shadow);

    // The meshes run 0..BODY_TOP in local space, so a group wrapped straight around
    // them pivots at the BASE - tilting it would hinge the bottle at its foot and
    // throw the neck off screen. Offsetting them inside an inner group puts the
    // outer group origin at the bottle centre, which is what the swing rotates about.
    g.position.y = -BODY_TOP / 2;
    var outer = new THREE.Group();
    outer.add(g);
    return { group: outer, cap: capMat, liquid: liquid, ground: ground };
  }

  function buildBubbles() {
    var grp = new THREE.Group();
    var geo = new THREE.SphereGeometry(1, 12, 12);
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.30,
      roughness: 0.05, metalness: 0, envMap: scene.environment, envMapIntensity: 1.4
    });
    for (var i = 0; i < 22; i++) {
      var m = new THREE.Mesh(geo, mat);
      var a = Math.random() * Math.PI * 2;
      var rad = 1.25 + Math.random() * 1.5;
      m.position.set(Math.cos(a) * rad, -2.4 + Math.random() * 5, Math.sin(a) * rad - 0.6);
      var s = 0.035 + Math.random() * 0.075;
      m.scale.setScalar(s);
      m.userData = { speed: 0.16 + Math.random() * 0.34, sway: Math.random() * Math.PI * 2, x0: m.position.x };
      grp.add(m);
    }
    return grp;
  }

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    scene = new THREE.Scene();
    scene.environment = makeEnvironment();

    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11.7);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(3.4, 5, 4.6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xcfe9ff, 1.5);
    rim.position.set(-4.2, 2.4, -3.4);
    scene.add(rim);

    bottle = buildBottle(scene.environment);
    scene.add(bottle.group);
    scene.add(bottle.ground);

    if (!REDUCED) {
      bubbles = buildBubbles();
      scene.add(bubbles);
    }

    resize();
    window.addEventListener("resize", resize);
    ready = true;
  }

  // ------------------------------------------------------------ layout maths
  var mobile = false, view = { w: 0, h: 0 };

  // On narrow screens the bottle and the copy share one column, so its placement
  // is measured from the real layout rather than assumed. Fixed world offsets
  // worked on a tall phone and collided with the copy on a short one.
  var mHero = { y: -1.6, s: 0.64 };
  var mSeq = { y: 0.85, s: 0.72 };

  function worldPerPx() {
    var visible = 2 * camera.position.z * Math.tan((camera.fov * Math.PI / 180) / 2);
    return visible / view.h;
  }

  function bandFit(topPx, bottomPx) {
    var wpp = worldPerPx();
    var bandPx = Math.max(70, bottomPx - topPx);
    var fullPx = BODY_TOP / wpp;                 // bottle height in px at scale 1
    var centrePx = topPx + bandPx / 2;
    return { s: clamp(bandPx / fullPx, 0.32, 0.78), y: (view.h / 2 - centrePx) * wpp };
  }

  function measureMobile() {
    if (!mobile) return;
    var copy = document.querySelector("#hero .copy");
    if (!copy) return;
    // hero starts at document y=0, so this is px from the top of the hero
    var copyBottom = copy.getBoundingClientRect().bottom + window.scrollY;
    mHero = bandFit(copyBottom + 12, view.h - 74);   // clear the scroll cue and badge
    mSeq = bandFit(view.h * 0.03, view.h * 0.46);    // upper half, copy sits under it
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    mobile = w < 860;
    view.w = w; view.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the bottle a constant share of the viewport height rather than of width
    camera.fov = mobile ? 40 : 32;
    camera.updateProjectionMatrix();
    measureMobile();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  // How far off-centre the bottle sits, in world units, for a given beat side.
  function sideOffset(side) {
    if (mobile) return 0;
    return side === "left" ? 1.55 : -1.55; // copy on the left pushes the bottle right
  }

  // ------------------------------------------------------------ scroll state
  var approach = 0; // hero -> sequence
  var seq = 0;      // progress through the four beats
  var exit = 0;     // sequence -> outro

  // Per beat: tilt is the swing in the screen plane, spin is the turn about the
  // bottle own axis. Measured off the reference clip - it swings out hard on the
  // second beat as it turns its back, then settles upright again by the last.
  var TILT = [-22, -58, -30, -14];   // degrees
  var SPIN = [0, 180, 215, 360];     // degrees
  var DEG = Math.PI / 180;
  function smooth(x) { return x * x * (3 - 2 * x); }

  var target = { rot: 0, tilt: 0, x: 0, y: 0, s: 1, op: 1 };
  var current = { rot: 0, tilt: 0, x: 0, y: 0, s: 1, op: 1 };

  function computeTargets() {
    var p = seq * 3; // 0..3 across the four beats
    var i = clamp(Math.floor(p), 0, 2);
    var f = clamp(p - i, 0, 1);

    paint(order[i], order[i + 1], f);
    root.style.setProperty("--veil", String(clamp(1 - approach * 1.15, 0, 1)));
    root.style.setProperty("--hero-fade", String(clamp(1 - approach * 1.4, 0, 1)));
    paintNav(clamp(approach * 1.3, 0, 1));

    var heroX = mobile ? 0 : 2.05;    // hero copy sits left, so the bottle sits right
    var beatX = mix({ r: sideOffset(beats[i].getAttribute("data-side")), g: 0, b: 0 },
                    { r: sideOffset(beats[i + 1].getAttribute("data-side")), g: 0, b: 0 }, f).r;

    var e = smooth(f);
    target.rot = (SPIN[i] + (SPIN[i + 1] - SPIN[i]) * e) * DEG;
    // eased in with approach so the hero pose is left exactly as it was
    target.tilt = (TILT[i] + (TILT[i + 1] - TILT[i]) * e) * DEG * approach;
    var spread = 1 + 0.55 * Math.abs(Math.sin(target.tilt));
    target.x = heroX + (beatX * spread - heroX) * approach;
    target.y = mobile ? (mHero.y + (mSeq.y - mHero.y) * approach) : 0;
    target.s = mobile ? (mHero.s + (mSeq.s - mHero.s) * approach) : (0.94 + 0.10 * approach);
    target.op = 1 - exit;

    // panels cross-fade around their own beat
    for (var k = 0; k < beats.length; k++) {
      var d = Math.abs(p - k);
      var o = clamp((0.72 - d) / 0.42, 0, 1);
      beats[k].style.opacity = String(o);
      beats[k].style.transform = "translateY(" + ((p - k) * 22) + "px)";
      beats[k].style.pointerEvents = o > 0.6 ? "auto" : "none";
    }
    var active = Math.round(p);
    for (var d2 = 0; d2 < dots.length; d2++) dots[d2].classList.toggle("on", d2 === active);

    // the cap and the liquid pick up the beat colour too
    if (bottle) {
      var acc = ACCENTS[f < 0.5 ? order[i] : order[i + 1]];
      bottle.cap.color.setHex(acc.hex);
      if (labelAccent === null || labelAccent.css !== acc.css) {
        paintLabelTexture({
          css: acc.css,
          onLight: acc.onLight,
          claim: ["CAFFEINE FREE", "B3 B5 B6 & C", "ASPARTAME FREE", "BUBBLEGUM"][f < 0.5 ? i : i + 1]
        });
      }
    }
  }

  function wireScroll() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: "#sequence", start: "top bottom", end: "top top", scrub: true,
      onUpdate: function (s) { approach = s.progress; }
    });
    ScrollTrigger.create({
      trigger: "#sequence", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (s) { seq = s.progress; }
    });
    ScrollTrigger.create({
      trigger: "#outro", start: "top bottom", end: "top center", scrub: true,
      onUpdate: function (s) { exit = s.progress; }
    });
  }

  // ------------------------------------------------------------------- loop
  var last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    if (!ready) return;
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    computeTargets();

    current.rot = damp(current.rot, target.rot, 7, dt);
    current.tilt = damp(current.tilt, target.tilt, 7, dt);
    current.x = damp(current.x, target.x, 7, dt);
    current.y = damp(current.y, target.y, 7, dt);
    current.s = damp(current.s, target.s, 7, dt);
    current.op = damp(current.op, target.op, 9, dt);

    var t = now / 1000;
    var bob = Math.sin(t * 0.8) * 0.07;
    bottle.group.rotation.y = current.rot + Math.sin(t * 0.5) * 0.045;
    bottle.group.rotation.z = current.tilt + Math.sin(t * 0.35) * 0.018;
    bottle.group.position.x = current.x;
    bottle.group.position.y = current.y + bob;
    bottle.group.scale.setScalar(current.s);
    bottle.ground.position.x = current.x;
    bottle.ground.position.y = current.y + bob - (BODY_TOP / 2) * current.s;
    bottle.ground.scale.setScalar(current.s);

    if (bubbles) {
      bubbles.position.x = current.x;
      for (var i = 0; i < bubbles.children.length; i++) {
        var b = bubbles.children[i];
        b.position.y += b.userData.speed * dt;
        b.position.x = b.userData.x0 + Math.sin(t * 0.7 + b.userData.sway) * 0.16;
        if (b.position.y > 3.2) b.position.y = -2.6;
      }
    }

    canvas.style.opacity = String(current.op);
    renderer.render(scene, camera);
  }

  // ------------------------------------------------------------------ start
  function boot() {
    try {
      init();
    } catch (err) {
      // No WebGL, or it failed: the page still reads as a normal document.
      document.documentElement.classList.add("reduced");
      canvas.style.display = "none";
      console.warn("KiddoFizz: 3D unavailable, falling back to the static layout.", err);
      return;
    }

    if (REDUCED) {
      // One frame, bottle square-on, no scroll wiring at all.
      var rx = mobile ? 0 : 2.05;
      target.x = current.x = rx;
      target.s = current.s = mobile ? mHero.s : 0.92;
      var ry = mobile ? mHero.y : 0;
      bottle.group.position.x = rx;
      bottle.group.position.y = ry;
      bottle.group.scale.setScalar(current.s);
      bottle.ground.position.set(rx, ry - (BODY_TOP / 2) * current.s, 0);
      bottle.ground.scale.setScalar(current.s);
      // Nothing drives paint() here, so each stacked section carries its own
      // accent locally and the page itself stays neutral.
      root.style.setProperty("--bg", "#FDFBF7");
      var heroEl = document.getElementById("hero");
      var bd = document.querySelector(".backdrop");
      if (heroEl && bd) {
        bd.style.position = "absolute";
        bd.style.height = heroEl.offsetHeight + "px";
        canvas.style.height = heroEl.offsetHeight + "px";
      }
      for (var k = 0; k < beats.length; k++) {
        var a = ACCENTS[order[k]];
        beats[k].style.opacity = "1";
        beats[k].style.setProperty("--accent", a.css);
        beats[k].style.setProperty("--accent-dark", a.dark);
      }
      renderer.render(scene, camera);
      return;
    }

    wireScroll();
    requestAnimationFrame(frame);
  }

  // The label is drawn into a 2D canvas, so it needs the webfonts resolved before
  // it is rasterised - otherwise the wordmark bakes in a fallback face.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
    document.fonts.ready.then(function () {
      if (!ready || !labelAccent) return;
      paintLabelTexture(labelAccent);
      if (REDUCED) renderer.render(scene, camera);
    });
  } else {
    boot();
  }
})();
