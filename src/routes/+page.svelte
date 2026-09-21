<script lang="ts">
	import type { PageData } from './$types';
	
	let { data } : { data: PageData } = $props();
	const { user } = $derived(data);
</script>

{#if user}
	<h1>Hi, {user.name}!</h1>
	<p>Your user ID is {user.id}.</p>
{:else}
	<h1>Welcome!</h1>
	<p>Please sign in to continue.</p>
{/if}
