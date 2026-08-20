<script>
	import { T } from '@threlte/core';
	import { OrbitControls, useGltf } from '@threlte/extras';

	const gltf = useGltf('/models/lightsaber.glb');

	/** @param {unknown} error */
	function onLoadError(error) {
		console.error('Failed to load lightsaber.glb', error);
		return '';
	}
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 3]} fov={35}>
	<OrbitControls enableZoom={true} enablePan={false} target={[0, 0, 0]} />
</T.PerspectiveCamera>

<T.DirectionalLight position={[3, 5, 3]} intensity={1.2} />
<T.AmbientLight intensity={0.4} />

{#await gltf then { scene }}
	<T is={scene} />
{:catch error}
	{onLoadError(error)}
{/await}
