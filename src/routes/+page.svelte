<script>
	import { onMount } from 'svelte';
	import { createSaberScene } from '$lib/saberScene.js';

	const copy = {
		en: {
			role: 'Frontend Developer and Marketer',
			skills: 'What I do',
			work: 'Work',
			contact: 'Contact'
		},
		nl: {
			role: 'Frontend Developer en Marketeer',
			skills: 'Wat ik doe',
			work: 'Werk',
			contact: 'Contact'
		}
	};

	const skills = [
		{
			id: 'marketing',
			tint: 'blue',
			title: { en: 'Marketing', nl: 'Marketing' },
			text: {
				en: 'Content that knows who it’s for and why they’d care.',
				nl: 'Content die weet voor wie het is en waarom het hen iets kan schelen.'
			},
			more: { en: '[A few lines about your marketing work]', nl: '[Een paar regels over je marketingwerk]' },
			icon: [
				'M6 19v10h7l15 9V10l-15 9Z',
				'M13 29l3 11h5l-2.5-10',
				'M35 18.5c1.8 1.6 2.8 3.5 2.8 5.5s-1 3.9-2.8 5.5',
				'M39.5 13c3.2 2.9 4.8 6.6 4.8 11s-1.6 8.1-4.8 11'
			]
		},
		{
			id: 'design',
			tint: 'green',
			title: { en: 'Design', nl: 'Design' },
			text: {
				en: 'Designs that make sense for the people using them.',
				nl: 'Ontwerpen die logisch zijn voor de mensen die ze gebruiken.'
			},
			more: { en: '[A few lines about your design work]', nl: '[Een paar regels over je ontwerpwerk]' },
			icon: [
				'M24 5 36 21l-5.5 17h-13L12 21Z',
				'M24 5v15.5',
				'M20.5 24a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0',
				'M17 44h14'
			]
		},
		{
			id: 'development',
			tint: 'red',
			title: { en: 'Development', nl: 'Development' },
			text: {
				en: 'Fast and accessible websites that work for everyone.',
				nl: 'Snelle, toegankelijke websites die voor iedereen werken.'
			},
			more: {
				en: '[A few lines about your development work]',
				nl: '[Een paar regels over je development-werk]'
			},
			icon: ['M16 14 6 24l10 10', 'M32 14l10 10-10 10', 'M27.5 9 20.5 39']
		}
	];

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {HTMLElement} */
	let intro;
	/** @type {HTMLElement} */
	let nameSlot;
	/** @type {HTMLElement} */
	let role;
	/** @type {HTMLElement} */
	let skillsList;
	/** @type {HTMLElement} */
	let scrollHint;
	/** @type {HTMLElement} */
	let workSection;
	/** @type {HTMLElement[]} */
	const skillSections = [];

	const LANG_KEY = 'language';
	/** @type {'en' | 'nl'} */
	let lang = $state('en');
	let showLanguage = $state(false);

	/** @param {'en' | 'nl'} choice */
	function chooseLanguage(choice) {
		lang = choice;
		document.documentElement.lang = choice;
		showLanguage = false;
		try {
			localStorage.setItem(LANG_KEY, choice);
		} catch {
			// Private mode can block storage; the choice still applies for this visit.
		}
	}

	onMount(() => {
		let saved = null;
		try {
			saved = localStorage.getItem(LANG_KEY);
		} catch {
			saved = null;
		}
		if (saved === 'en' || saved === 'nl') chooseLanguage(saved);
		// Ask for a language once the sabers are fully up, unless it was chosen on an earlier visit.
		const onIgnited = () => {
			if (!saved) showLanguage = true;
		};

		// On phones, start the swipeable row on the middle (green) card.
		if (skillsList.scrollWidth > skillsList.clientWidth + 2) {
			const middle = /** @type {HTMLElement} */ (skillsList.children[1]);
			skillsList.scrollLeft = middle.offsetLeft - (skillsList.clientWidth - middle.offsetWidth) / 2;
		}
		return createSaberScene({
			canvas,
			intro,
			nameSlot,
			role,
			skillsList,
			skillSections,
			scrollHint,
			workSection,
			onIgnited
		});
	});
</script>

<svelte:head>
	<title>Ilona van Oosbree – Frontend Developer and Marketer</title>
	<meta name="description" content="Portfolio of Ilona van Oosbree, frontend developer and marketer." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap"
	/>
</svelte:head>

<canvas class="scene" aria-hidden="true" bind:this={canvas}></canvas>

{#if showLanguage}
	<!-- First in the page so keyboard users reach it straight away; it doesn't steal focus while someone reads. -->
	<div class="language glass-card__panel" role="dialog" aria-labelledby="language-title">
		<h2 class="language__title" id="language-title">
			<span lang="nl">Kies een taal</span> / <span lang="en">Choose a language</span>
		</h2>
		<div class="language__options">
			<button class="language__option" type="button" lang="en" onclick={() => chooseLanguage('en')}>
				English
			</button>
			<button class="language__option" type="button" lang="nl" onclick={() => chooseLanguage('nl')}>
				Nederlands
			</button>
		</div>
	</div>
{/if}

<main class="page">
	<div class="intro" bind:this={intro}>
		<div class="intro__snap intro__snap--revealed" aria-hidden="true"></div>
		<div class="intro__snap" aria-hidden="true"></div>
		<div class="intro__stage">
			<section class="hero" aria-labelledby="hero-name">
				<h1 class="visually-hidden" id="hero-name">Ilona van Oosbree</h1>
				<div class="hero__name-slot" aria-hidden="true" bind:this={nameSlot}></div>
				<p class="hero__role" bind:this={role}>{copy[lang].role}</p>
			</section>

			<section class="skills" id="skills" aria-labelledby="skills-title">
				<h2 class="visually-hidden" id="skills-title">{copy[lang].skills}</h2>
				<ul class="skills__list" bind:this={skillsList}>
					{#each skills as skill (skill.id)}
						<li class="skills__item skills__item--{skill.tint}">
							<article class="glass-card" aria-labelledby="skill-{skill.id}">
								<span class="glass-card__tab" aria-hidden="true"></span>
								<div class="glass-card__panel">
									<svg
										class="glass-card__icon"
										viewBox="0 0 48 48"
										aria-hidden="true"
										fill="none"
										stroke="currentColor"
										stroke-width="3.6"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										{#each skill.icon as d (d)}
											<path {d} />
										{/each}
									</svg>
									<h3 class="glass-card__title" id="skill-{skill.id}">{skill.title[lang]}</h3>
									<p class="glass-card__text">{skill.text[lang]}</p>
								</div>
							</article>
						</li>
					{/each}
				</ul>
			</section>

			<div class="scroll-hint" aria-hidden="true" bind:this={scrollHint}>
				<span>Scroll</span>
				<span class="scroll-hint__line"></span>
			</div>
		</div>
	</div>

	{#each skills as skill, i (skill.id)}
		<section
			class="section skill-section"
			id={skill.id}
			aria-labelledby="{skill.id}-title"
			bind:this={skillSections[i]}
		>
			<h2 class="section__title" id="{skill.id}-title">{skill.title[lang]}</h2>
			<p class="section__text">{skill.more[lang]}</p>
		</section>
	{/each}

	<section class="section work" id="work" aria-labelledby="work-title" bind:this={workSection}>
		<h2 class="section__title" id="work-title">{copy[lang].work}</h2>
		<ul class="work-list">
			{#each [1, 2, 3] as n (n)}
				<li>
					<h3 class="work-list__title">[Project name]</h3>
					<p class="section__text">[One line about the project]</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="section contact" id="contact" aria-labelledby="contact-title">
		<h2 class="section__title" id="contact-title">{copy[lang].contact}</h2>
		<p class="section__text">[Your email or socials]</p>
	</section>
</main>

<style>
	:global(:root) {
		color-scheme: dark;
		--color-void: #060810;
		--color-bone: #ece5d6;
		--color-steel: #b3bbc5;
		--color-focus: #8ab8ff;
		--font-display: var(--font-starjhol);
		--font-text: 'Rajdhani', 'Arial Narrow', Arial, sans-serif;
		--grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		padding-top: env(safe-area-inset-top, 0px);
		padding-bottom: env(safe-area-inset-bottom, 0px);
	}

	/* Scrolling snaps to: the crossed sabers, the fully revealed first screen, Work and Contact */
	:global(html) {
		background: var(--color-void);
		scroll-padding-top: env(safe-area-inset-top, 0px);
		scroll-snap-type: y proximity;
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(html) {
			scroll-behavior: smooth;
		}
	}

	:global(body) {
		background: var(--color-void);
		color: var(--color-steel);
		font-family: var(--font-text);
		font-weight: 500;
		-webkit-font-smoothing: antialiased;
	}

	:global(:focus-visible) {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/* Scene */
	.scene {
		position: fixed;
		inset: 0;
		z-index: 0;
		display: block;
		width: 100%;
		height: 100%;
		touch-action: pan-y;
	}

	.page {
		position: relative;
		z-index: 1;
		pointer-events: none;
	}

	/* First screen. The track is two screens tall and the stage sticks while you scroll through it,
	   so the sabers can move away and the name and cards can appear in place.
	   --u is one fluid unit that grows with the screen width, capped by the height so everything
	   always fits in one screen. Every size below is a multiple of it, so nothing jumps. */
	.intro {
		--u: clamp(0.875rem, min(0.375rem + 1vw, 2.7svh), 2.1rem);
		position: relative;
		height: 300svh;
		scroll-snap-align: start;
	}

	/* Snap point where the reveal is complete: the bottom of the track lines up with the bottom of the screen */
	.intro__snap {
		position: absolute;
		bottom: 0;
		width: 1px;
		height: 1px;
		scroll-snap-align: end;
	}

	.intro__snap--revealed {
		top: 100svh;
		bottom: auto;
		scroll-snap-align: start;
	}

	.intro__stage {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: calc(var(--u) * 1.75);
		height: 100svh;
		padding-block: calc(var(--u) * 2);
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Reserves the space for the 3D name, which is drawn on the canvas behind it */
	.hero__name-slot {
		width: min(90vw, calc(var(--u) * 64), calc(19svh * var(--name-aspect, 8)));
		aspect-ratio: var(--name-aspect, 8);
		margin-top: calc(var(--name-trim-top, 0px) * -1);
		margin-bottom: calc(var(--name-trim-bottom, 0px) * -1);
	}

	.hero__role {
		margin: calc(var(--u) * 1.3) 0 0;
		padding-inline: 1rem;
		color: var(--color-steel);
		font-size: max(1.1rem, calc(var(--u) * 1.45));
		font-weight: 500;
		letter-spacing: 0.12em;
		text-align: center;
		text-shadow: 0 0 1.25rem rgba(0, 0, 0, 0.85);
		opacity: var(--reveal-role, 1);
		translate: 0 calc((1 - var(--reveal-role, 1)) * 1.5rem);
	}

	/* Small hint at the bottom of the first screen */
	.scroll-hint {
		position: absolute;
		bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
		left: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding-left: 0.3em;
		color: var(--color-steel);
		font-size: 0.95rem;
		letter-spacing: 0.3em;
		opacity: 0;
		translate: -50% 0.75rem;
		pointer-events: none;
	}

	.scroll-hint__line {
		position: relative;
		width: 1px;
		height: 2.75rem;
		overflow: hidden;
		background: rgb(179 187 197 / 0.25);
	}

	.scroll-hint__line::after {
		position: absolute;
		top: -40%;
		left: 0;
		width: 100%;
		height: 40%;
		content: '';
		background: linear-gradient(rgb(255 255 255 / 0), #fff);
		animation: hint-drop 1.8s ease-in-out infinite;
	}

	@keyframes hint-drop {
		to {
			top: 100%;
		}
	}

	/* Sections after the hero */
	.section {
		scroll-snap-align: start;
		min-height: 100lvh;
		padding: clamp(5rem, 14vh, 9rem) clamp(1.25rem, 5vw, 4rem);
		pointer-events: auto;
	}

	.section__title {
		margin: 0 0 1rem;
		color: var(--color-bone);
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 1rem + 3vw, 3.2rem);
		font-weight: 400;
		text-shadow: 0 0 1.5rem rgba(0, 0, 0, 0.9);
	}

	.section__text {
		max-width: 38rem;
		margin: 0;
		color: var(--color-steel);
		font-size: 1.2rem;
		line-height: 1.5;
		text-shadow: 0 0 1rem rgba(0, 0, 0, 0.9);
	}

	/* Glass cards */
	.skills {
		display: grid;
		place-items: center;
		pointer-events: auto;
	}

	.skills__list {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, calc(var(--u) * 18)));
		gap: calc(var(--u) * 3);
		justify-content: center;
		width: 100%;
		margin: 0;
		padding: var(--u) clamp(1.25rem, 5vw, 4rem) calc(var(--u) * 2.5);
		list-style: none;
	}

	/* Cards slide up and fade in as you scroll (the opacity sits on the glass itself so the blur keeps working) */
	.skills__item {
		translate: 0 calc((1 - var(--reveal, 1)) * 3rem);
	}
	.glass-card__tab,
	.glass-card__panel {
		opacity: var(--reveal, 1);
	}

	.skills__item--blue {
		--tint: 56 140 255;
		--tint-soft: 200 224 255;
	}
	.skills__item--green {
		--tint: 46 214 110;
		--tint-soft: 204 255 222;
		transform: translateY(calc(var(--u) * 2.5));
	}
	.skills__item--red {
		--tint: 255 48 40;
		--tint-soft: 255 214 220;
	}

	/* Inside a card everything is in em, and the card's font-size is the fluid unit */
	.glass-card {
		position: relative;
		height: 100%;
		padding-top: 1.1em;
		font-size: var(--u);
		animation: glass-float 8s ease-in-out infinite;
	}

	.skills__item--green .glass-card {
		animation-delay: -2.7s;
	}
	.skills__item--red .glass-card {
		animation-delay: -5.3s;
	}

	@keyframes glass-float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.8em);
		}
	}

	/* The small glass square: sits behind the big one and pokes out of the top */
	.glass-card__tab {
		position: absolute;
		top: 0;
		left: 50%;
		width: 46%;
		aspect-ratio: 1;
		overflow: hidden;
		background:
			linear-gradient(150deg, rgb(255 255 255 / 0.24), rgb(255 255 255 / 0) 45%),
			linear-gradient(180deg, rgb(var(--tint) / 0.6), rgb(var(--tint) / 0.24));
		border: 1px solid rgb(var(--tint-soft) / 0.5);
		box-shadow:
			0 0 1.4em rgb(var(--tint) / 0.35),
			inset 0 1px 0 rgb(255 255 255 / 0.4),
			inset 0 0 1.25em rgb(255 255 255 / 0.07);
		transform: translateX(-50%);
		-webkit-backdrop-filter: blur(6px) saturate(1.3);
		backdrop-filter: blur(6px) saturate(1.3);
	}

	.glass-card__panel {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		min-height: 17em;
		padding: 2.6em 1.75em 2.4em;
		overflow: hidden;
		text-align: center;
		background:
			radial-gradient(ellipse 70% 60% at 50% 0%, rgb(var(--tint) / 0.26), transparent 72%),
			linear-gradient(180deg, rgb(var(--tint) / 0.1), rgb(8 10 18 / 0.55) 45%, rgb(8 10 18 / 0.62));
		border: 1px solid rgb(var(--tint) / 0.32);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.16),
			inset 0 0 2.5em rgb(255 255 255 / 0.03),
			0 1.5em 3em rgb(0 0 0 / 0.45);
		-webkit-backdrop-filter: blur(12px) saturate(1.3);
		backdrop-filter: blur(12px) saturate(1.3);
	}

	/* Frosted grain, the "cloudy" part of the glass */
	.glass-card__tab::before,
	.glass-card__panel::before {
		position: absolute;
		inset: 0;
		content: '';
		background-image: var(--grain);
		opacity: 0.14;
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	.glass-card__icon {
		position: relative;
		width: 3.5em;
		height: 3.5em;
		margin-bottom: 1.6em;
		color: rgb(var(--tint-soft));
		filter: drop-shadow(0 0 0.9em rgb(var(--tint) / 0.9));
	}

	.glass-card__title {
		position: relative;
		margin: 0 0 0.5em;
		color: #fff;
		font-size: 1.75em;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.glass-card__text {
		position: relative;
		margin: 0;
		max-width: 17em;
		color: rgb(232 234 240 / 0.88);
		font-size: 1.1em;
		line-height: 1.45;
		text-wrap: balance;
	}

	.work,
	.skill-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.work-list {
		display: grid;
		gap: 1.75rem;
		max-width: 34rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.work-list__title {
		margin: 0 0 0.25rem;
		color: var(--color-bone);
		font-size: 1.4rem;
		font-weight: 700;
	}

	.contact {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	/* Language popover: the same glass panel as the cards, without the little square */
	.language {
		--tint: 200 214 235;
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 3;
		gap: 1.25rem;
		width: min(24rem, calc(100vw - 2rem));
		height: auto;
		min-height: 0;
		padding: 2rem 1.75rem;
		translate: -50% -50%;
		animation: language-in 0.6s ease-out both;
	}

	@keyframes language-in {
		from {
			opacity: 0;
			translate: -50% calc(-50% + 1rem);
		}
	}

	.language__title {
		position: relative;
		margin: 0;
		color: var(--color-bone);
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.language__options {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	.language__option {
		min-height: 44px;
		padding: 0.6rem 1.3rem;
		color: var(--color-bone);
		font: inherit;
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		background: rgb(255 255 255 / 0.08);
		border: 1px solid rgb(255 255 255 / 0.25);
		cursor: pointer;
	}

	.language__option:hover {
		background: rgb(255 255 255 / 0.16);
	}

	/* Phones and small tablets: the cards become a swipeable row so they still fit the first screen */
	@media (max-width: 60rem) {
		.skills__list {
			grid-template-columns: none;
			grid-auto-columns: min(80vw, calc(var(--u) * 21));
			grid-auto-flow: column;
			gap: calc(var(--u) * 1.25);
			justify-content: start;
			padding: calc(var(--u) * 1.25) calc((100% - min(80vw, calc(var(--u) * 21))) / 2)
				calc(var(--u) * 2.5);
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}
		.skills__list::-webkit-scrollbar {
			display: none;
		}
		.skills__item {
			scroll-snap-align: center;
		}
		.skills__item--green {
			transform: translateY(calc(var(--u) * 1.5));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glass-card,
		.language,
		.scroll-hint__line::after {
			animation: none;
		}
	}
</style>
