<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime';
	import { enhance } from '$app/forms';
	import { LOGIN_PATH, LOGOUT_PATH } from '#lib';
	import appleTouchIcon from '#lib/assets/apple-touch-icon.png';
	import favicon32 from '#lib/assets/favicon-32x32.png';
	import favicon16 from '#lib/assets/favicon-16x16.png';

	let { data, children } = $props();
	let { user } = $derived(data);
</script>

<svelte:head>
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon}>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32}>
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16}>
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
