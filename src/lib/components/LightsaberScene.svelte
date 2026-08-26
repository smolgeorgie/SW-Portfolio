<script>
	import { T, useThrelte, useTask } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { Box3, Color, Mesh, Vector3 } from 'three';

	const gltf = useGltf('/models/lightsaber.glb');
	const { size } = useThrelte();

	const CAMERA_FOV = 35;
	const FRAME_PADDING = 1.05;
	const MAX_PEEK = 0.5;
	const POINTER_EASE = 0.08;
	const GLOW_COLOR = new Color('#ff2a2a');

	let roll = $state(0);
	let peekX = $state(0);
	let peekY = $state(0);
	let targetRoll = 0;
	let targetPeekX = 0;
	let targetPeekY = 0;

	/** @param {PointerEvent} event */
	function handlePointerMove(event) {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const dx = event.clientX - centerX;
		const dy = event.clientY - centerY;
		const radius = Math.min(centerX, centerY);

		targetRoll = Math.atan2(-dx, -dy);
		targetPeekX = (dy / radius) * MAX_PEEK;
		targetPeekY = (dx / radius) * MAX_PEEK;
	}

	/**
	 * @param {number} from
	 * @param {number} to
	 */
	function shortestAngleDelta(from, to) {
		return Math.atan2(Math.sin(to - from), Math.cos(to - from));
	}

	useTask(() => {
		roll += shortestAngleDelta(roll, targetRoll) * POINTER_EASE;
		peekX += (targetPeekX - peekX) * POINTER_EASE;
		peekY += (targetPeekY - peekY) * POINTER_EASE;
	});

	/** @param {unknown} error */
	function onLoadError(error) {
		console.error('Failed to load lightsaber.glb', error);
		return '';
	}

	/** @param {import('three').Object3D} object */
	function getEmitterCenter(object) {
		const box = new Box3();
		let found = false;
		object.traverse((child) => {
			if (!(child instanceof Mesh)) return;
			if (child.material?.name !== 'LightSaberEmitterMat') return;
			box.expandByObject(child);
			found = true;
		});
		return found ? box.getCenter(new Vector3()) : null;
	}

	/** Rotates the model so it stands upright with the blade pointing up. */
	/** @param {import('three').Object3D} object */
	function orientUpright(object) {
		if (object.userData.oriented) return;

		const overallCenter = new Box3().setFromObject(object).getCenter(new Vector3());
		const emitterCenter = getEmitterCenter(object) ?? overallCenter;

		const rollTowardBlade = emitterCenter.x >= overallCenter.x ? -Math.PI / 2 : Math.PI / 2;
		object.rotation.z = rollTowardBlade + Math.PI;
		object.userData.oriented = true;
	}

	/** @param {import('three').Object3D} object */
	function frameObject(object) {
		const box = new Box3().setFromObject(object);
		const boxSize = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());

		const aspect = size.current.width / size.current.height;
		const verticalFov = (CAMERA_FOV * Math.PI) / 180;
		const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

		const distanceForHeight = boxSize.y / (2 * Math.tan(verticalFov / 2));
		const distanceForWidth = boxSize.x / (2 * Math.tan(horizontalFov / 2));
		const distance = Math.max(distanceForHeight, distanceForWidth) * FRAME_PADDING;

		return { center, distance };
	}

	/** @param {import('three').Object3D} object */
	function ignite(object) {
		const bladePosition = getEmitterCenter(object) ?? new Vector3();

		object.traverse((child) => {
			if (!(child instanceof Mesh)) return;
			if (child.material?.name !== 'LightSaberEmitterMat') return;
			child.material.emissive = GLOW_COLOR;
			child.material.emissiveIntensity = 5;
			child.material.toneMapped = false;
		});

		return bladePosition;
	}
</script>

<svelte:window onpointermove={handlePointerMove} />

<T.AmbientLight intensity={0.4} />

{#await gltf then { scene }}
	{@const _orient = orientUpright(scene)}
	{@const { center, distance } = frameObject(scene)}
	{@const bladePosition = ignite(scene)}
	<T.PerspectiveCamera
		makeDefault
		position={[center.x, center.y, center.z + distance]}
		fov={CAMERA_FOV}
	>
		<T.DirectionalLight position={[3, 5, 3]} intensity={1.2} />
	</T.PerspectiveCamera>
	<T.Group rotation.z={roll} rotation.x={peekX} rotation.y={peekY}>
		<T is={scene} />
		<T.PointLight
			color={GLOW_COLOR}
			intensity={16}
			distance={3}
			position={bladePosition.toArray()}
		/>
		<T.PointLight
			color={GLOW_COLOR}
			intensity={6}
			distance={6}
			position={bladePosition.toArray()}
		/>
	</T.Group>
{:catch error}
	{onLoadError(error)}
{/await}
