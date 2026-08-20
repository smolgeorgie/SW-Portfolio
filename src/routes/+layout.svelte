<script>
	import '$lib/styles/global.css';
	import favicon from '$lib/assets/favicon.svg';
	import StarWarsLoader from '$lib/components/StarWarsLoader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StarWarsLoader />

{@render children()}
