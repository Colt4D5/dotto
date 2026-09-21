<script lang="ts">
	import type { PageData } from './$types';

	let { data } : { data: PageData } = $props();
</script>

<h1>Dashboard</h1>

{#if data.user}
	<h1>Hi, {data.user.name}!</h1>
	<p>Your user ID is {data.user.id}.</p>
{/if}
