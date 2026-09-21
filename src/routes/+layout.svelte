<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime';
	import favicon from '#lib/assets/favicon.svg';
	import { enhance } from '$app/forms';
	import { LOGIN_PATH, LOGOUT_PATH } from '#lib';

	let { data, children } = $props();
	let { user } = $derived(data);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	{#if page.url.pathname !== LOGIN_PATH}
		{#if user}
			<form method="post" action={LOGOUT_PATH} use:enhance>
				<button>Sign out</button>
			</form>
		{:else}
			<p><a href={resolve(LOGIN_PATH)}>Sign in</a></p>
		{/if}
	{/if}
</header>

{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
	{/each}
</div>
