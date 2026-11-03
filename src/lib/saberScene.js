// @ts-nocheck -- ported prototype code; typing every scratch object isn't worth the noise.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (current, target, lambda, dt) =>
	current + (target - current) * (1 - Math.exp(-lambda * dt));
const smooth = (x) => x * x * (3 - 2 * x);
const smoothstep = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1));

function seeded(a) {
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const NAME_TEXT = 'ilona van oosbree';
const NAME_FONT = '"Starjhol", "Arial Black", sans-serif';
const NAME_COLOUR = 0xffe81f;

const LEGACY = Math.PI;

/**
 * @param {{ canvas: HTMLCanvasElement, intro: HTMLElement, nameSlot: HTMLElement, role: HTMLElement,
 *   skillsList: HTMLElement, scrollHint: HTMLElement, workSection: HTMLElement }} els
 */
export function createSaberScene({ canvas, intro, nameSlot, role, skillsList, scrollHint, workSection }) {
	const root = document.documentElement;
	const cardItems = Array.from(skillsList.children);
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	THREE.ColorManagement.enabled = false;

	let renderer;
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
	} catch {
		// Without 3D the page still works: the role and cards are simply shown.
		scrollHint.style.opacity = '1';
		return () => {};
	}

	let stopped = false;
	let raf = 0;
	const timers = [];
	const listeners = new AbortController();

	/* ---------- renderer, scene, camera ---------- */
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x060810, 1);
	const maxAniso = renderer.capabilities.getMaxAnisotropy();

	const scene = new THREE.Scene();
	const CAM_Z = 10;
	const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
	camera.position.set(0, 0, CAM_Z);

	const view = { w: 1, h: 1, visW: 1, visH: 1, narrow: false };
	function measureView() {
		view.w = root.clientWidth || window.innerWidth;
		view.h = window.innerHeight;
		camera.aspect = view.w / view.h;
		camera.updateProjectionMatrix();
		view.visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
		view.visW = view.visH * camera.aspect;
		view.narrow = camera.aspect < 1.05;
		renderer.setSize(view.w, view.h, false);
	}

	/* ---------- the wall ---------- */
	function makePanelTexture() {
		const size = 1024;
		const c = document.createElement('canvas');
		c.width = c.height = size;
		const g = c.getContext('2d');
		const rand = seeded(11);
		const rowH = 256;
		for (let y = 0; y < size; y += rowH) {
			let x = 0;
			while (x < size) {
				const w = Math.min(size - x, 128 * (1 + Math.floor(rand() * 3)));
				const shade = 118 + Math.floor(rand() * 34);
				g.fillStyle = 'rgb(' + shade + ',' + (shade + 2) + ',' + (shade + 7) + ')';
				g.fillRect(x, y, w, rowH);
				if (rand() < 0.16 && w >= 256) {
					g.fillStyle = 'rgb(46,49,55)';
					for (let k = 0; k < 6; k++) g.fillRect(x + 28, y + 44 + k * 30, w - 56, 12);
				}
				g.fillStyle = 'rgb(12,13,16)';
				g.fillRect(x, y, w, 5);
				g.fillRect(x, y, 5, rowH);
				g.fillStyle = 'rgba(235,238,242,0.35)';
				g.fillRect(x + 5, y + 5, w - 5, 2);
				g.fillRect(x + 5, y + 5, 2, rowH - 5);
				g.fillStyle = 'rgba(232,235,240,0.65)';
				[
					[16, 18],
					[w - 16, 18],
					[16, rowH - 16],
					[w - 16, rowH - 16]
				].forEach(function (p) {
					g.beginPath();
					g.arc(x + p[0], y + p[1], 4, 0, Math.PI * 2);
					g.fill();
				});
				x += w;
			}
		}
		const img = g.getImageData(0, 0, size, size);
		const d = img.data;
		for (let i = 0; i < d.length; i += 4) {
			const n = (rand() - 0.5) * 20;
			d[i] += n;
			d[i + 1] += n;
			d[i + 2] += n;
		}
		g.putImageData(img, 0, 0);
		const tex = new THREE.CanvasTexture(c);
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
		tex.anisotropy = maxAniso;
		return tex;
	}

	const wallTex = makePanelTexture();
	wallTex.repeat.set(9, 5);
	const wall = new THREE.Mesh(
		new THREE.PlaneGeometry(54, 30),
		new THREE.MeshStandardMaterial({
			color: 0x2a2e35,
			map: wallTex,
			bumpMap: wallTex,
			bumpScale: 0.045,
			roughness: 0.72,
			metalness: 0.15
		})
	);
	wall.position.z = -3;
	scene.add(wall);

	scene.add(new THREE.AmbientLight(0x1b2436, 0.1 * LEGACY));
	const keyLight = new THREE.DirectionalLight(0x8fa6ff, 0.03 * LEGACY);
	keyLight.position.set(-4, 5, 8);
	scene.add(keyLight);
	const SABER = { blade: 3.3, hilt: 0.95 };

	const START_DELAY = 3000;
	const FADE_FOR = 2.5;
	const PULSE_DEPTH = 0.45;

	function bladeGeometry(r) {
		const pts = [new THREE.Vector2(r, 0), new THREE.Vector2(r, 1)];
		const steps = 8;
		for (let i = 1; i <= steps; i++) {
			const a = ((i / steps) * Math.PI) / 2;
			pts.push(new THREE.Vector2(Math.max(0.0001, Math.cos(a) * r), 1 + Math.sin(a) * r));
		}
		return new THREE.LatheGeometry(pts, 32);
	}

	const bladeVertex = /* glsl */ `
		uniform float uLength;
		varying vec3 vN;
		varying vec3 vV;
		void main() {
			vec3 p = position;
			p.y = p.y > 1.0 ? uLength + (p.y - 1.0) : p.y * uLength;
			vec4 mv = modelViewMatrix * vec4(p, 1.0);
			vN = normalize(normalMatrix * normal);
			vV = normalize(-mv.xyz);
			gl_Position = projectionMatrix * mv;
		}`;

	const coreFragment = /* glsl */ `
		uniform vec3 uEdge;
		uniform float uFlicker;
		varying vec3 vN;
		varying vec3 vV;
		void main() {
			float f = abs(dot(normalize(vN), normalize(vV)));
			vec3 col = mix(uEdge, vec3(1.0, 0.97, 0.95), smoothstep(0.15, 0.75, f));
			gl_FragColor = vec4(col * uFlicker, 1.0);
		}`;

	const glowFragment = /* glsl */ `
		uniform vec3 uColor;
		uniform float uPower;
		uniform float uIntensity;
		varying vec3 vN;
		varying vec3 vV;
		void main() {
			float f = abs(dot(normalize(vN), normalize(vV)));
			float a = pow(f, uPower) * uIntensity;
			gl_FragColor = vec4(uColor * a, 1.0);
		}`;

	const metal = new THREE.MeshStandardMaterial({ color: 0xd5d9df, emissive: 0x23262c, metalness: 0.6, roughness: 0.3 });
	const gunmetal = new THREE.MeshStandardMaterial({ color: 0x4a4f57, emissive: 0x15171b, metalness: 0.5, roughness: 0.45 });
	const rubber = new THREE.MeshStandardMaterial({ color: 0x131417, metalness: 0.1, roughness: 0.85 });

	function makeHilt(buttonColour) {
		const hilt = new THREE.Group();
		const button = new THREE.MeshStandardMaterial({
			color: 0x1a1d22,
			emissive: buttonColour,
			emissiveIntensity: 0.8,
			roughness: 0.4
		});
		function piece(rTop, rBottom, height, top, material) {
			const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, 40), material);
			mesh.position.y = top - height / 2;
			hilt.add(mesh);
		}
		piece(0.08, 0.066, 0.13, 0, metal);
		piece(0.05, 0.05, 0.008, 0.002, rubber);
		piece(0.061, 0.061, 0.04, -0.13, rubber);
		piece(0.058, 0.058, 0.26, -0.17, metal);
		piece(0.057, 0.057, 0.38, -0.43, gunmetal);
		for (let i = 0; i < 7; i++) piece(0.065, 0.065, 0.028, -0.448 - i * 0.05, rubber);
		piece(0.062, 0.052, 0.1, -0.81, metal);
		piece(0.04, 0.04, 0.02, -0.91, rubber);
		const box = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.03), rubber);
		box.position.set(0, -0.29, 0.062);
		hilt.add(box);
		const knob = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), button);
		knob.position.set(0, -0.29, 0.08);
		hilt.add(knob);
		return hilt;
	}

	function makeSaber(spec) {
		const group = new THREE.Group();
		const uLength = { value: 0 };
		const coreUniforms = {
			uLength,
			uEdge: { value: new THREE.Color().fromArray(spec.edge) },
			uFlicker: { value: 1 }
		};
		const core = new THREE.Mesh(
			bladeGeometry(0.032),
			new THREE.ShaderMaterial({
				uniforms: coreUniforms,
				vertexShader: bladeVertex,
				fragmentShader: coreFragment,
				// Additive, so a dimmed core fades into the dark instead of showing as a black stick.
				transparent: true,
				blending: THREE.AdditiveBlending
			})
		);
		core.frustumCulled = false;
		group.add(core);

		const shells = spec.glow.map(function (g) {
			const mesh = new THREE.Mesh(
				bladeGeometry(g.r),
				new THREE.ShaderMaterial({
					uniforms: {
						uLength,
						uColor: { value: new THREE.Color().fromArray(g.color) },
						uPower: { value: g.power },
						uIntensity: { value: 0 }
					},
					vertexShader: bladeVertex,
					fragmentShader: glowFragment,
					transparent: true,
					depthWrite: false,
					blending: THREE.AdditiveBlending,
					side: THREE.DoubleSide
				})
			);
			mesh.frustumCulled = false;
			mesh.renderOrder = 3;
			group.add(mesh);
			return mesh;
		});

		group.add(makeHilt(spec.button));
		scene.add(group);

		const lights = [];
		for (let i = 0; i < 3; i++) {
			const light = new THREE.PointLight(spec.light, 0, 10, 1);
			scene.add(light);
			lights.push(light);
		}

		const pose = { px: 0, py: 0, pz: spec.depth, s: 1.8, rx: 0.1, rz: 0, len: 1, sc: 1 };
		return {
			spec,
			group,
			core,
			coreUniforms,
			shells,
			uLength,
			lights,
			igniteAt: reduceMotion ? -Infinity : Infinity,
			flickerAt: -Infinity,
			pose,
			goal: Object.assign({}, pose),
			a: new THREE.Vector3(),
			b: new THREE.Vector3()
		};
	}

	const BLUE = {
		side: -1,
		depth: -0.2,
		edge: [0.3, 0.55, 1.0],
		light: 0x2f6bff,
		button: 0x3a8bff,
		glow: [
			{ r: 0.08, color: [0.32, 0.6, 1.0], power: 1.2, intensity: 0.85 },
			{ r: 0.22, color: [0.1, 0.35, 1.0], power: 2.2, intensity: 0.55 },
			{ r: 0.6, color: [0.04, 0.15, 0.95], power: 3.2, intensity: 0.25 }
		]
	};
	const RED = {
		side: 1,
		depth: -0.45,
		edge: [1.0, 0.3, 0.24],
		light: 0xff2a1a,
		button: 0xff2b1c,
		glow: [
			{ r: 0.08, color: [1.0, 0.3, 0.24], power: 1.2, intensity: 0.85 },
			{ r: 0.22, color: [1.0, 0.12, 0.07], power: 2.2, intensity: 0.5 },
			{ r: 0.6, color: [0.85, 0.05, 0.03], power: 3.2, intensity: 0.22 }
		]
	};
	const sabers = [makeSaber(BLUE), makeSaber(RED)];

	/* ---------- the name, drawn into a texture on a 3D plane ---------- */
	const nameCanvas = document.createElement('canvas');
	const nameCtx = nameCanvas.getContext('2d');
	let nameTex = null;
	const nameState = { aspect: 8, inkTopFrac: 0, inkBottomFrac: 0.8 };

	const nameMat = new THREE.MeshStandardMaterial({
		color: NAME_COLOUR,
		emissive: NAME_COLOUR,
		emissiveIntensity: 0.62,
		roughness: 0.55,
		metalness: 0.05,
		transparent: true,
		alphaTest: 0.08
	});
	const nameMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), nameMat);
	nameMesh.renderOrder = 1;
	scene.add(nameMesh);

	function splitLines(text, narrow) {
		const i = text.indexOf(' ');
		return narrow && i > 0 ? [text.slice(0, i), text.slice(i + 1)] : [text];
	}

	function drawNameTexture() {
		const lines = splitLines(NAME_TEXT, view.narrow);
		let fontPx = 220;
		const measure = function (px) {
			nameCtx.font = px + 'px ' + NAME_FONT;
			nameCtx.textBaseline = 'middle';
			return lines.map(function (line) {
				const m = nameCtx.measureText(line);
				const left = Math.abs(m.actualBoundingBoxLeft || 0);
				const right = Math.abs(m.actualBoundingBoxRight || m.width);
				return {
					left,
					width: Math.max(left + right, 1),
					asc: Math.abs(m.actualBoundingBoxAscent || px * 0.4),
					desc: Math.abs(m.actualBoundingBoxDescent || px * 0.4)
				};
			});
		};
		let metrics = measure(fontPx);
		let maxW = Math.max(...metrics.map((m) => m.width));
		const limit = 4000;
		if (maxW + fontPx * 0.7 > limit) {
			fontPx = Math.floor((fontPx * (limit - fontPx * 0.7)) / maxW);
			metrics = measure(fontPx);
			maxW = Math.max(...metrics.map((m) => m.width));
		}
		const pad = Math.round(fontPx * 0.35);
		const inkH = Math.max(...metrics.map((m) => m.asc + m.desc));
		const lineH = Math.max(fontPx * 1.2, inkH * 1.15);
		const cw = Math.ceil(maxW + pad * 2);
		const ch = Math.ceil(lineH * lines.length + pad);

		nameCanvas.width = cw;
		nameCanvas.height = ch;
		nameCtx.clearRect(0, 0, cw, ch);
		nameCtx.font = fontPx + 'px ' + NAME_FONT;
		nameCtx.textBaseline = 'middle';
		nameCtx.textAlign = 'left';
		nameCtx.fillStyle = '#ffffff';
		lines.forEach(function (line, i) {
			const m = metrics[i];
			nameCtx.fillText(line, (cw - m.width) / 2 + m.left, pad / 2 + lineH * (i + 0.5));
		});

		const firstY = pad / 2 + lineH * 0.5;
		const lastY = pad / 2 + lineH * (lines.length - 0.5);
		nameState.inkTopFrac = Math.max(0, (firstY - metrics[0].asc) / ch);
		nameState.inkBottomFrac = Math.min(1, (lastY + metrics[metrics.length - 1].desc) / ch);
		nameState.aspect = cw / ch;

		const tex = new THREE.CanvasTexture(nameCanvas);
		tex.anisotropy = maxAniso;
		if (nameTex) nameTex.dispose();
		nameTex = tex;
		nameMat.map = tex;
		nameMat.emissiveMap = tex;
		nameMat.needsUpdate = true;
	}

	function layoutName() {
		root.style.setProperty('--name-aspect', nameState.aspect.toFixed(4));
		const slotH = nameSlot.getBoundingClientRect().height;
		root.style.setProperty('--name-trim-top', (nameState.inkTopFrac * slotH).toFixed(1) + 'px');
		root.style.setProperty('--name-trim-bottom', ((1 - nameState.inkBottomFrac) * slotH).toFixed(1) + 'px');
		const planeW = (nameSlot.getBoundingClientRect().width / view.w) * view.visW;
		const old = nameMesh.geometry;
		nameMesh.geometry = new THREE.PlaneGeometry(planeW, planeW / nameState.aspect);
		old.dispose();
	}

	/* ---------- dust ---------- */
	const DUST = 260;
	const dustRand = seeded(3);
	const dustPos = new Float32Array(DUST * 3);
	const dustCol = new Float32Array(DUST * 3);
	const dustVel = new Float32Array(DUST * 3);
	for (let i = 0; i < DUST; i++) {
		dustPos[i * 3] = (dustRand() - 0.5) * 14;
		dustPos[i * 3 + 1] = (dustRand() - 0.5) * 8.4;
		dustPos[i * 3 + 2] = -2.7 + dustRand() * 4.2;
		dustVel[i * 3] = (dustRand() - 0.5) * 0.06;
		dustVel[i * 3 + 1] = 0.02 + dustRand() * 0.05;
		dustVel[i * 3 + 2] = (dustRand() - 0.5) * 0.03;
	}
	const dustGeo = new THREE.BufferGeometry();
	dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
	dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));
	const dotCanvas = document.createElement('canvas');
	dotCanvas.width = dotCanvas.height = 64;
	const dotCtx = dotCanvas.getContext('2d');
	const dotGradient = dotCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
	dotGradient.addColorStop(0, 'rgba(255,255,255,1)');
	dotGradient.addColorStop(0.35, 'rgba(255,255,255,0.5)');
	dotGradient.addColorStop(1, 'rgba(255,255,255,0)');
	dotCtx.fillStyle = dotGradient;
	dotCtx.fillRect(0, 0, 64, 64);
	const dust = new THREE.Points(
		dustGeo,
		new THREE.PointsMaterial({
			size: 0.09,
			map: new THREE.CanvasTexture(dotCanvas),
			vertexColors: true,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	dust.renderOrder = 4;
	dust.frustumCulled = false;
	scene.add(dust);

	/* ---------- where the sabers are ---------- */
	const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
	const X = { angle: 0.8, sc: 1.6, s0: 1.8, cy: 0 };
	let introEnd = 1;
	let workTop = 2;
	let maxScroll = 3;

	// The crossed pose: tilted toward the screen corners and sized to fill most of the screen.
	function measureSabers() {
		const W = view.visW;
		const H = view.visH;
		const total = SABER.blade + SABER.hilt;
		X.angle = clamp(Math.atan2(W, H), 0.6, 0.96);
		const byHeight = (H * 0.78) / (total * Math.cos(X.angle));
		const byWidth = (W * 0.98) / (total * Math.sin(X.angle));
		X.sc = clamp(Math.min(byHeight, byWidth), 0.6, 2.4);
		X.s0 = SABER.blade * 0.55;
		// The blades cross a bit above the middle of each saber, so lift the crossing to centre the whole X.
		X.cy = (X.s0 - (SABER.blade - SABER.hilt) / 2) * X.sc * Math.cos(X.angle);
	}

	function measureScroll() {
		const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
		introEnd = Math.max(1, docTop(intro) + intro.offsetHeight - view.h);
		workTop = Math.max(introEnd + 1, docTop(workSection));
		maxScroll = Math.max(workTop + 1, root.scrollHeight - view.h);
	}

	function saberGoal(sb, pIntro, lenEnd) {
		const a = X.angle;
		const dx = -sb.spec.side * Math.sin(a);
		const dy = Math.cos(a);
		const tipTarget = -view.visH / 2 + view.visH * 0.22;
		const back = (SABER.blade - X.s0) * X.sc - (tipTarget - X.cy) / dy;
		const k = back * smooth(clamp(pIntro / 0.75, 0, 1));
		const g = sb.goal;
		g.px = -dx * k;
		g.py = X.cy - dy * k;
		g.pz = sb.spec.depth;
		g.s = X.s0;
		g.rx = 0.1;
		g.rz = sb.spec.side * a;
		g.len = lenEnd;
		g.sc = X.sc;
	}

	const axisTmp = new THREE.Vector3();
	function applyPose(sb) {
		const p = sb.pose;
		sb.group.rotation.set(p.rx, 0, p.rz);
		sb.group.scale.setScalar(p.sc);
		axisTmp.set(0, p.s * p.sc, 0).applyEuler(sb.group.rotation);
		sb.group.position.set(p.px - axisTmp.x, p.py - axisTmp.y, p.pz - axisTmp.z);
		sb.group.updateMatrixWorld(true);
	}

	/* ---------- blades, light, flash ---------- */
	const tmp = new THREE.Vector3();

	function updateBlade(sb, t) {
		const e = t - sb.igniteAt;
		const rise = clamp(e / FADE_FOR, 0, 1);
		const len = (1 - Math.pow(1 - rise, 3)) * sb.pose.len;
		let hum = smooth(clamp(rise / 0.4, 0, 1));
		if (!reduceMotion) hum *= 1 - PULSE_DEPTH * (0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 2.6 + sb.spec.side * 1.3));
		const f = t - sb.flickerAt;
		const dip = f >= 0.55 ? f - 0.55 : f;
		if (!reduceMotion && f >= 0 && f < 0.85 && dip < 0.3) hum *= 1 - 0.7 * Math.sin((Math.PI * dip) / 0.3);
		const glow = smooth(clamp(len / 0.12, 0, 1)) * hum;
		sb.uLength.value = SABER.blade * len;
		const on = len > 0.002;
		sb.core.visible = on;
		sb.coreUniforms.uFlicker.value = hum;
		sb.shells.forEach(function (mesh, i) {
			mesh.visible = on;
			mesh.material.uniforms.uIntensity.value = sb.spec.glow[i].intensity * glow;
		});
		sb.lights.forEach(function (light, i) {
			tmp.set(0, (sb.uLength.value * (i + 0.5)) / sb.lights.length, 0.02);
			sb.group.localToWorld(tmp);
			light.position.copy(tmp);
			light.intensity = 2.6 * LEGACY * glow;
		});
		sb.group.localToWorld(sb.a.set(0, 0, 0));
		sb.group.localToWorld(sb.b.set(0, sb.uLength.value, 0));
		return glow;
	}

	function nearBlade(sb, x, y, z) {
		const abx = sb.b.x - sb.a.x;
		const aby = sb.b.y - sb.a.y;
		const abz = sb.b.z - sb.a.z;
		const ab2 = abx * abx + aby * aby + abz * abz || 1e-6;
		const apx = x - sb.a.x;
		const apy = y - sb.a.y;
		const apz = z - sb.a.z;
		const k = clamp((apx * abx + apy * aby + apz * abz) / ab2, 0, 1);
		const dx = apx - abx * k;
		const dy = apy - aby * k;
		const dz = apz - abz * k;
		return Math.exp(-(dx * dx + dy * dy + dz * dz) / 0.8);
	}

	function updateDust(glowBlue, glowRed, dt) {
		for (let i = 0; i < DUST; i++) {
			const j = i * 3;
			if (!reduceMotion) {
				dustPos[j] += dustVel[j] * dt;
				dustPos[j + 1] += dustVel[j + 1] * dt;
				dustPos[j + 2] += dustVel[j + 2] * dt;
				if (dustPos[j + 1] > 4.2) dustPos[j + 1] -= 8.4;
				if (dustPos[j] > 7) dustPos[j] -= 14;
				if (dustPos[j] < -7) dustPos[j] += 14;
				if (dustPos[j + 2] > 1.5) dustPos[j + 2] -= 4.2;
				if (dustPos[j + 2] < -2.7) dustPos[j + 2] += 4.2;
			}
			const b = 1.5 * glowBlue * nearBlade(sabers[0], dustPos[j], dustPos[j + 1], dustPos[j + 2]);
			const r = 1.5 * glowRed * nearBlade(sabers[1], dustPos[j], dustPos[j + 1], dustPos[j + 2]);
			dustCol[j] = 0.06 + r + b * 0.15;
			dustCol[j + 1] = 0.065 + r * 0.2 + b * 0.35;
			dustCol[j + 2] = 0.08 + r * 0.14 + b;
		}
		dustGeo.attributes.position.needsUpdate = true;
		dustGeo.attributes.color.needsUpdate = true;
	}

	/* ---------- the name, role and cards appear as you scroll ---------- */
	const lastReveal = { role: -1, cards: [-1, -1, -1] };

	function updateReveal(pIntro) {
		const rName = smoothstep(0.3, 0.7, pIntro);
		nameMat.opacity = rName;
		nameMesh.visible = rName > 0.01;
		nameMesh.scale.setScalar(0.94 + 0.06 * rName);

		const rRole = Math.round(smoothstep(0.42, 0.8, pIntro) * 1000) / 1000;
		if (rRole !== lastReveal.role) {
			role.style.setProperty('--reveal-role', String(rRole));
			lastReveal.role = rRole;
		}
		cardItems.forEach(function (li, i) {
			const r = Math.round(smoothstep(0.5 + i * 0.08, 0.86 + i * 0.05, pIntro) * 1000) / 1000;
			if (r !== lastReveal.cards[i]) {
				li.style.setProperty('--reveal', String(r));
				lastReveal.cards[i] = r;
			}
		});
	}

	let hintShown = reduceMotion;
	let hintIn = 0;
	function updateHint(pIntro, dt) {
		hintIn = damp(hintIn, hintShown ? 1 : 0, 4, dt);
		scrollHint.style.opacity = (hintIn * (1 - smoothstep(0, 0.12, pIntro))).toFixed(3);
		scrollHint.style.translate = '-50% ' + ((1 - hintIn) * 0.75).toFixed(3) + 'rem';
	}

	/* ---------- loop ---------- */
	let last = performance.now();
	let inCorner = false;
	function frame(now) {
		const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
		last = now;
		const t = now / 1000;

		pointer.sx = damp(pointer.sx, pointer.x, 5, dt);
		pointer.sy = damp(pointer.sy, pointer.y, 5, dt);

		const y = window.scrollY;
		const pIntro = clamp(y / introEnd, 0, 1);
		const lenEnd = 1 - smoothstep(workTop + (maxScroll - workTop) * 0.4, maxScroll, y);

		if (!inCorner && pIntro >= 0.75) {
			inCorner = true;
			sabers.forEach((sb) => (sb.flickerAt = t + 0.15));
		} else if (inCorner && pIntro < 0.7) {
			inCorner = false;
		}

		sabers.forEach(function (sb) {
			saberGoal(sb, pIntro, lenEnd);
			for (const key in sb.goal) {
				if (!Number.isFinite(sb.goal[key])) continue;
				sb.pose[key] = Number.isFinite(sb.pose[key])
					? damp(sb.pose[key], sb.goal[key], 9, dt)
					: sb.goal[key];
			}
			applyPose(sb);
		});

		const glowBlue = updateBlade(sabers[0], t);
		const glowRed = updateBlade(sabers[1], t);

		const slot = nameSlot.getBoundingClientRect();
		nameMesh.position.set(
			((slot.left + slot.width / 2) / view.w - 0.5) * view.visW,
			(0.5 - (slot.top + slot.height / 2) / view.h) * view.visH,
			0
		);
		updateReveal(pIntro);
		updateHint(pIntro, dt);
		updateDust(glowBlue, glowRed, dt);

		if (!reduceMotion) {
			camera.position.x = pointer.sx * 0.25;
			camera.position.y = pointer.sy * 0.15;
		}
		camera.lookAt(0, 0, 0);
		renderer.render(scene, camera);
		raf = requestAnimationFrame(frame);
	}

	/* ---------- input ---------- */
	window.addEventListener(
		'pointermove',
		function (e) {
			pointer.x = (e.clientX / view.w) * 2 - 1;
			pointer.y = -((e.clientY / view.h) * 2 - 1);
		},
		{ passive: true, signal: listeners.signal }
	);

	/* ---------- relayout ---------- */
	function relayout() {
		if (stopped || !window.innerWidth || !window.innerHeight) return false;
		measureView();
		drawNameTexture();
		layoutName();
		measureSabers();
		measureScroll();
		return true;
	}
	let relayoutQueued = false;
	function queueRelayout() {
		if (relayoutQueued) return;
		relayoutQueued = true;
		requestAnimationFrame(function () {
			relayoutQueued = false;
			relayout();
		});
	}
	window.addEventListener('resize', queueRelayout, { signal: listeners.signal });
	const resizeObserver = new ResizeObserver(queueRelayout);
	resizeObserver.observe(root);

	/* ---------- start ---------- */
	if (relayout()) {
		const pIntro = clamp(window.scrollY / introEnd, 0, 1);
		sabers.forEach(function (sb) {
			saberGoal(sb, pIntro, 1);
			Object.assign(sb.pose, sb.goal);
		});
	}

	raf = requestAnimationFrame(function (now) {
		last = now;
		frame(now);
	});

	if (!reduceMotion) {
		timers.push(
			setTimeout(function () {
				sabers.forEach((sb) => (sb.igniteAt = performance.now() / 1000));
			}, START_DELAY)
		);
		timers.push(setTimeout(() => (hintShown = true), START_DELAY + 1500));
	}

	document.fonts
		.load('220px "Starjhol"')
		.then(() => document.fonts.ready)
		.then(relayout, relayout);

	return function destroy() {
		stopped = true;
		cancelAnimationFrame(raf);
		timers.forEach(clearTimeout);
		listeners.abort();
		resizeObserver.disconnect();
		renderer.dispose();
		renderer.forceContextLoss();
	};
}
