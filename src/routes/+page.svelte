<script>
	import { Canvas } from '@threlte/core';
	import LightsaberScene from '$lib/components/LightsaberScene.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div class="scene">
	<Canvas>
		<LightsaberScene />
	</Canvas>
</div>

<style>
	.scene {
		width: 100%;
		height: 60vh;
	}
</style>
