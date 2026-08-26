	<script>
		let skipped = $state(false);

		function skip() {
			skipped = true;
		}
	</script>

<section class="crawl" class:crawl--skip={skipped} aria-label="Intro animation">
	<div class="crawl__viewport" aria-hidden="true">
		<div class="crawl__text">
			<header class="crawl__title">
				<p>Episode I</p>
				<h1>A New Markup</h1>
			</header>

			<p>
				Long ago, in a browser far, far away, someone wrapped a paragraph in three divs.
				The consequences are still with us.
			</p>
			<p>
				But in 2023, <strong>Ilona van Oosbree</strong> decided there had to be an end to this
				misery. Armed with nothing but semantic HTML, readable code, real accessibility and
				a load time measured in milliseconds, not parsecs, she began the long work of
				undoing it.
			</p>
			<p>The divs remain. But in style. So does she.</p>
		</div>
	</div>

	<button class="crawl__skip" type="button" onclick={skip}>
		Skip intro
	</button>
</section>


<style>
	.crawl {
		position: fixed;
		inset: 0;
		z-index: 999;
		overflow: hidden;
		background: var(--color-bg);
		animation:
			crawl-fade-out 1s ease-out 9s forwards,
			crawl-disable 1ms linear 10s forwards;
	}

	/* Skip button fades to the same end-state as the automatic timeout */
	.crawl.crawl--skip {
		animation: none;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.3s ease-out,
			visibility 0s linear 0.3s;
	}

	.crawl__viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		perspective: 900px;
	}

	.crawl__text {
		position: absolute;
		top: 100%;
		left: 50%;
		width: 98vw;
		transform-origin: 50% 100%;
		transform: translateX(-50%) rotateX(25deg) translateY(0);
		animation: crawl 10s linear forwards;
		color: var(--color-star-wars-yellow);
		font-family: var(--font-crawl);
		font-weight: 700;
		font-size: clamp(3rem, 12vw, 8rem);
		line-height: 1.5;
		text-align: justify;
	}

	.crawl--skip .crawl__text {
		animation-play-state: paused;
	}

	.crawl__title {
		text-align: center;
	}

	.crawl__title p {
		font-size: 75%;
	}

	.crawl__title h1 {
		margin: 0 0 var(--space-lg);
		font-size: 100%;
		text-transform: uppercase;
	}

	.crawl__text p {
		margin: 0 0 var(--space-lg);
	}

	.crawl__skip {
		position: absolute;
		bottom: var(--space-lg);
		right: var(--space-lg);
		z-index: 1000;
		background: transparent;
		border: 1px solid var(--color-star-wars-yellow);
		color: var(--color-star-wars-yellow);
		font-family: inherit;
		font-size: 0.85rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	/* @media (prefers-reduced-motion: reduce) {
		.crawl {
			animation: crawl-disable 1ms linear 4s forwards;
		}

		.crawl.crawl--skip {
			transition: none;
		}

		.crawl__text {
			position: static;
			transform: none;
			animation: none;
			width: min(90vw, 40rem);
			margin-inline: auto;
		}
	} */

	@keyframes crawl {
		0% {
			transform: translateX(-50%) rotateX(25deg) translateY(0);
		}
		100% {
			transform: translateX(-50%) rotateX(25deg) translateY(-320vh);
		}
	}

	@keyframes crawl-fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes crawl-disable {
		to {
			visibility: hidden;
			pointer-events: none;
		}
	}
</style>