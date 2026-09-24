import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { LOGIN_PATH } from '#lib';
import { API_VERSION } from '$app/env/public';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	if (!locals.user) {
		return redirect(302, LOGIN_PATH);
	}

	const res = await fetch(`/api/${API_VERSION}/projects`);
	const data = await res.json();
	
	return { projects: data };
};
