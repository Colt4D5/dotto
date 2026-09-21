import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { LOGIN_PATH } from '#lib';

export const load: LayoutServerLoad = (event) => {
	if (!event.locals.user) {
		return redirect(302, LOGIN_PATH);
	}
	return {};
};
