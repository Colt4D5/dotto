<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

{#if data.user}
	<h1>Hi, {data.user.name}!</h1>
	<p>Your user ID is {data.user.id}.</p>
	<form method="post" action="?/signOut" use:enhance>
		<button>Sign out</button>
	</form>
{:else}
	<h1>Welcome!</h1>
	<p>Please <a href="/login">sign in</a> to continue.</p>
{/if}
