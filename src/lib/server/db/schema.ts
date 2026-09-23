import { pgTable, pgEnum, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const documentStatus = pgEnum('document_status', [
	'UPLOADING',
	'UPLOADED',
	'PROCESSING',
	'READY',
	'FAILED'
]);

export const messageRole = pgEnum('message_role', [
    'user',
    'assistant',
    'system'
]);

export const projects = pgTable('projects',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}, 
	(table) => [index('projects_user_id_idx').on(table.userId)]
);

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export * from './auth.schema';
