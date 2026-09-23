import { asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index';
import { projects } from '#lib/server/db/schema';

export function getProjectsForUser(userId: string) {
    return db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(asc(projects.name));
}