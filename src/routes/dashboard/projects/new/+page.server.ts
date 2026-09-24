import { error, fail } from '@sveltejs/kit';
import { db } from '#lib/server/db/index';
import { projects } from '#lib/server/db/schema';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');

    if (typeof name !== 'string' || !name.trim()) {
        return fail(400, { error: 'A project name is required' });
    }

    await db.insert(projects).values({
        userId: locals.user.id,
        name: name.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : null
    });

    return { success: true };
  }
};