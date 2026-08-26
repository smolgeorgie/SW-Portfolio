<script>
	import { Canvas } from '@threlte/core';
	import LightsaberScene from '$lib/components/LightsaberScene.svelte';
	import Starfield from '$lib/components/Starfield.svelte';

	const factions = [
		{
			name: 'Sith',
			description: 'Guardians of peace and security in the galaxy',
			modifier: 'sith'
		},
		{
			name: 'Republic',
			description: 'Guardians of peace and security in the galaxy',
			modifier: 'republic'
		},
		{
			name: 'Separatists',
			description: 'Guardians of peace and security in the galaxy',
			modifier: 'separatists'
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
					<svg class="faction-card__icon" viewBox="0 0 40 40" aria-hidden="true">
						<circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1.5" />
						<circle cx="20" cy="20" r="6" fill="currentColor" />
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
		text-transform: uppercase;
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
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-md);
		max-width: 55rem;
		margin-inline: auto;
		padding: 0;
		list-style: none;
	}

	.faction-card {
		--stagger: 0px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1 1 13rem;
		max-width: 16rem;
		min-height: 14rem;
		padding: var(--space-md);
		text-align: center;
		color: #fff;
		background: rgb(var(--faction-rgb) / 30%);
		border-radius: 16px;
		box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
		backdrop-filter: blur(3.7px);
		border: 1px solid rgb(var(--faction-rgb) / 40%);
		transform: translateY(var(--stagger));
		animation: float 5s ease-in-out infinite;
	}

	.faction-card--sith {
		--faction-color: #d9425a;
		--faction-rgb: 111 24 26;
	}

	.faction-card--republic {
		--faction-color: #3ecf8e;
		--faction-rgb: 24 111 60;
		--stagger: 0.75rem;
	}

	.faction-card--separatists {
		--faction-color: #3a8bc2;
		--faction-rgb: 24 63 111;
	}

	.faction-card__icon {
		width: 2rem;
		height: 2rem;
		color: var(--faction-color);
	}

	.faction-card__name {
		margin: var(--space-2xs) 0 0;
		font-family: var(--font-atures);
		font-weight: 900;
		text-transform: uppercase;
		font-size: 1.1rem;
	}

	.faction-card__description {
		margin: var(--space-2xs) 0 0;
		color: rgb(255 255 255 / 70%);
		font-size: 0.85rem;
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
