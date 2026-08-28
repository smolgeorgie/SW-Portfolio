<script>
	import { Canvas } from '@threlte/core';
	import LightsaberScene from '$lib/components/LightsaberScene.svelte';
	import Starfield from '$lib/components/Starfield.svelte';

	const factions = [
		{
			name: 'Designer',
			description: 'Of Social Media posts, In-Game posters and Websites',
			modifier: 'designer'
		},
		{
			name: 'Photographer',
			description: 'Hobby-ist and Semi-Professional of Businesses and Portraits',
			modifier: 'photographer'
		},
		{
			name: 'Developer',
			description: 'Websites focused on Accessibility, Performance and Readability',
			modifier: 'developer'
		}
	];
</script>

<main class="page">
	<Starfield />

	<div class="scene" aria-hidden="true">
		<Canvas>
			<LightsaberScene />
		</Canvas>
	</div>

	<div class="hero-stage">
		<header class="hero">
			<h1 class="hero__title">Front-End<br />Developer</h1>
			<p class="hero__byline">iLoNA VAN ooSBREE</p>
		</header>
	</div>

	<section class="factions" aria-label="Focus areas">
		<ul class="faction-row">
			{#each factions as faction, index}
				<li
					class="faction-card faction-card--{faction.modifier}"
					style:animation-delay="{index * 0.35}s"
				>
					<svg
						class="faction-card__symbol"
						viewBox="0 0 38 38"
						aria-hidden="true"
						focusable="false"
					>
						<polygon
							class="faction-card__burst"
							points="19,0 23.18,10.64 31.16,3.04 28.12,12.92 38,12.16 28.88,19 38,25.84 28.12,25.08 31.16,34.96 23.18,27.36 19,38 14.82,27.36 6.84,34.96 9.88,25.08 0,25.84 9.12,19 0,12.16 9.88,12.92 6.84,3.04 14.82,10.64"
						/>
						<circle class="faction-card__core" cx="19" cy="19" r="10" />
						<circle class="faction-card__cut" cx="19" cy="19" r="9" />
					</svg>
					<h2 class="faction-card__name">{faction.name}</h2>
					<p class="faction-card__description">{faction.description}</p>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.page {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		height: 100svh;
		padding: var(--space-md);
		overflow: hidden;
	}

	.scene {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		filter:
			drop-shadow(0 0 1.5rem #ff2a2a)
			drop-shadow(0 0 4rem #ff2a2a)
			drop-shadow(0 0 8rem rgb(255 42 42 / 70%));
	}

	.hero-stage {
		position: relative;
		z-index: 1;
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero {
		text-align: center;
	}

	.hero__title {
		margin: 0;
		font-family: var(--font-atures);
		font-weight: 900;
		text-transform: uppercase;
		color: #fff;
		font-size: clamp(2rem, 8vw, 6rem);
		line-height: 0.95;
	}

	.hero__byline {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-starjhol);
		color: transparent;
		-webkit-text-stroke: 1px var(--color-star-wars-yellow);
		font-size: clamp(1.1rem, 2.5vw, 2rem);
		letter-spacing: 0.05em;
	}

	.factions {
		position: relative;
		z-index: 3;
		flex: 0 0 auto;
		width: 100%;
	}

	.faction-row {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 10%;
		max-width: 55rem;
		margin-inline: auto;
		padding: 0;
		list-style: none;
	}

	.faction-card {
		--stagger: 0px;

		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		width: 13rem;
		/* min-height: 14rem; */
		padding: var(--space-xs);
		text-align: center;
		color: #fff;
		background: linear-gradient(145deg, var(--faction-grad-from), var(--faction-grad-to));
		border: 1px solid var(--faction-edge);
		box-shadow:
			0 0 30px var(--faction-glow),
			inset 0 0 30px rgb(0 0 0 / 25%);
		transform: translateY(var(--stagger));
		animation: float 5s ease-in-out infinite;
	}

	.faction-card::before {
		content: '';
		position: absolute;
		top: -6px;
		left: 30%;
		width: 5rem;
		height: 6px;
		background: var(--faction-tab);
		border: 1px solid var(--faction-tab-edge);
		border-bottom: none;
	}

	.faction-card--designer {
		--faction-grad-from: rgb(90 10 35 / 75%);
		--faction-grad-to: rgb(35 8 17 / 85%);
		--faction-edge: rgb(180 120 140 / 25%);
		--faction-glow: rgb(100 0 35 / 15%);
		--faction-tab: #4c1028;
		--faction-tab-edge: rgb(180 120 140 / 20%);
		--faction-symbol-cut: #5a102d;
		height: 16rem;
	}

	.faction-card--photographer {
		--stagger: 0.75rem;
		--faction-grad-from: rgb(12 70 42 / 75%);
		--faction-grad-to: rgb(8 30 20 / 85%);
		--faction-edge: rgb(120 180 150 / 25%);
		--faction-glow: rgb(0 100 55 / 15%);
		--faction-tab: #103a28;
		--faction-tab-edge: rgb(120 180 150 / 20%);
		--faction-symbol-cut: #0d3a24;
		height: 14rem;
		margin-bottom: 1rem;
	}

	.faction-card--developer {
		--faction-grad-from: rgb(20 45 90 / 75%);
		--faction-grad-to: rgb(8 18 35 / 85%);
		--faction-edge: rgb(120 145 190 / 25%);
		--faction-glow: rgb(0 45 110 / 15%);
		--faction-tab: #10284c;
		--faction-tab-edge: rgb(120 145 190 / 20%);
		--faction-symbol-cut: #102d5a;
		height: 16rem;
	}

	.faction-card__symbol {
		width: 2.6rem;
		height: 2.6rem;
		margin-bottom: var(--space-2xs);
		filter: drop-shadow(0 0 6px rgb(255 255 255 / 45%));
	}

	.faction-card__burst,
	.faction-card__core {
		fill: #fff;
	}

	.faction-card__cut {
		fill: var(--faction-symbol-cut);
	}

	.faction-card__name {
		margin: 0;
		font-family: var(--font-crawl);
		font-weight: 500;
		font-size: 1.25rem;
		letter-spacing: -0.02em;
	}

	.faction-card__description {
		max-width: 8rem;
		margin: 0.7rem 0 0;
		color: rgb(255 255 255 / 85%);
		font-family: var(--font-crawl);
		font-size: 0.5625rem;
		line-height: 1.45;
		text-wrap: balance;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(var(--stagger));
		}
		50% {
			transform: translateY(calc(var(--stagger) - 0.6rem));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.faction-card {
			animation: none;
		}
	}
</style>
