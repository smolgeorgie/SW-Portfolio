<section class="crawl" aria-hidden="true">
	<div class="crawl__viewport">
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
</section>

<style>
	.crawl {
		position: fixed;
		inset: 0;
		z-index: 999;
		overflow: hidden;
		background: var(--color-bg);
		animation:
			crawl-fade-out 1s ease-out 15s forwards,
			crawl-disable 1ms linear 16s forwards;
	}

	.crawl__viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		perspective: 350px;
	}

	.crawl__text {
		position: absolute;
		top: 100%;
		left: 50%;
		width: min(92vw, 60rem);
		transform-origin: 50% 100%;
		transform: translateX(-50%) rotateX(25deg) translateY(0);
		animation: crawl 16s linear forwards;
		color: var(--color-star-wars-yellow);
		font-family: var(--font-crawl);
		font-weight: 700;
		font-size: clamp(1.25rem, 4vw, 2rem);
		line-height: 1.5;
		text-align: justify;
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

	@media (prefers-reduced-motion: reduce) {
		.crawl {
			animation: crawl-disable 1ms linear 4s forwards;
		}

		.crawl__text {
			position: static;
			transform: none;
			animation: none;
			width: min(90vw, 40rem);
			margin-inline: auto;
		}
	}

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
