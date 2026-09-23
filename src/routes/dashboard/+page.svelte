<script lang="ts">
	import type { PageData } from './$types';

	let { data } : { data: PageData } = $props();
	const userName = $derived(data.user?.name ?? 'Guest');
	const userId = $derived(data.user?.id ?? 'Unknown');
</script>

<h1>Dashboard</h1>

{#if data.user}
	<h1>Hi, {userName}!</h1>
	<p>Your user ID is {userId}.</p>
{/if}
