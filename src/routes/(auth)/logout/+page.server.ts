import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth } from '#lib/server/auth';
import { LOGOUT_RETURN_PATH } from '#lib';

export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.session) {
            return fail(401, { message: 'Not authenticated' });
        }
        await auth.api.signOut({ headers: event.request.headers });
        return redirect(302, LOGOUT_RETURN_PATH);
    }
};

export const load = () => redirect(302, LOGOUT_RETURN_PATH);