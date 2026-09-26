import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index';
import { documents, documentVersions, projects } from '#lib/server/db/schema';

export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;
export const SUPPORTED_DOCUMENT_TYPES = new Set(['application/pdf', 'text/plain']);

type CreateUploadVersionInput = {
	userId: string;
	projectId: string;
	documentId?: number;
	filename: string;
	mimeType: string;
	fileSize: number;
	storageKey: string;
};

export async function createUploadVersion({
	userId,
	projectId,
	documentId,
	filename,
	mimeType,
	fileSize,
	storageKey
}: CreateUploadVersionInput) {
	return db.transaction(async (tx) => {
		const [project] = await tx
			.select({ id: projects.id })
			.from(projects)
			.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
			.limit(1);

		if (!project) {
			return null;
		}

		let targetDocumentId = documentId;
		let versionNumber = 1;

		if (targetDocumentId !== undefined) {
			const [existingDocument] = await tx
				.select({ id: documents.id })
				.from(documents)
				.where(and(eq(documents.id, targetDocumentId), eq(documents.projectId, projectId)))
				.for('update')
				.limit(1);

			if (!existingDocument) {
				return null;
			}

			const [latestVersion] = await tx
				.select({ versionNumber: sql<number>`coalesce(max(${documentVersions.versionNumber}), 0)` })
				.from(documentVersions)
				.where(eq(documentVersions.documentId, existingDocument.id));

			versionNumber = latestVersion.versionNumber + 1;
		} else {
			const [document] = await tx
				.insert(documents)
				.values({
					projectId,
					name: filename,
					documentType: mimeType,
					status: 'UPLOADING'
				})
				.returning({ id: documents.id });

			targetDocumentId = document.id;
		}

		const [version] = await tx
			.insert(documentVersions)
			.values({
				documentId: targetDocumentId,
				versionNumber,
				storageKey,
				mimeType,
				fileSize,
				status: 'UPLOADING'
			})
			.returning({ id: documentVersions.id });

		return {
			documentId: targetDocumentId,
			documentVersionId: version.id
		};
	});
}

export async function getUploadVersionForUser(userId: string, documentVersionId: number) {
	const [version] = await db
		.select({
			id: documentVersions.id,
			documentId: documents.id,
			versionNumber: documentVersions.versionNumber,
			storageKey: documentVersions.storageKey,
			mimeType: documentVersions.mimeType,
			fileSize: documentVersions.fileSize,
			status: documentVersions.status
		})
		.from(documentVersions)
		.innerJoin(documents, eq(documentVersions.documentId, documents.id))
		.innerJoin(projects, eq(documents.projectId, projects.id))
		.where(and(eq(documentVersions.id, documentVersionId), eq(projects.userId, userId)))
		.limit(1);

	return version;
}

export async function finalizeUploadVersion(documentVersionId: number) {
	return db.transaction(async (tx) => {
		const [version] = await tx
			.select({
				id: documentVersions.id,
				documentId: documentVersions.documentId,
				status: documentVersions.status
			})
			.from(documentVersions)
			.where(eq(documentVersions.id, documentVersionId))
			.for('update')
			.limit(1);

		if (!version) {
			return null;
		}

		if (version.status === 'FAILED') {
			return { ...version, finalized: false };
		}

		const [document] = await tx
			.select({ id: documents.id })
			.from(documents)
			.where(eq(documents.id, version.documentId))
			.for('update')
			.limit(1);

		if (!document) {
			return null;
		}

		if (version.status === 'UPLOADING') {
			await tx
				.update(documentVersions)
				.set({ status: 'UPLOADED', failureReason: null })
				.where(eq(documentVersions.id, version.id));
		}

		const [currentVersion] = await tx
			.select({ id: documentVersions.id })
			.from(documentVersions)
			.where(
				and(eq(documentVersions.documentId, document.id), eq(documentVersions.status, 'UPLOADED'))
			)
			.orderBy(desc(documentVersions.versionNumber))
			.limit(1);

		await tx
			.update(documents)
			.set({ currentVersionId: currentVersion.id, status: 'UPLOADED' })
			.where(eq(documents.id, document.id));

		return { ...version, finalized: true };
	});
}

export async function failUploadVersion(documentVersionId: number, failureReason: string) {
	await db
		.update(documentVersions)
		.set({ status: 'FAILED', failureReason })
		.where(
			and(eq(documentVersions.id, documentVersionId), eq(documentVersions.status, 'UPLOADING'))
		);
}

export async function getDocumentsForProject(userId: string, projectId: string) {
	const [project] = await db
		.select({ id: projects.id })
		.from(projects)
		.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
		.limit(1);

	if (!project) {
		return null;
	}

	return db
		.select({
			id: documents.id,
			name: documents.name,
			documentType: documents.documentType,
			status: documents.status,
			createdAt: documents.createdAt,
			updatedAt: documents.updatedAt,
			currentVersion: {
				id: documentVersions.id,
				versionNumber: documentVersions.versionNumber,
				mimeType: documentVersions.mimeType,
				fileSize: documentVersions.fileSize,
				status: documentVersions.status,
				failureReason: documentVersions.failureReason
			}
		})
		.from(documents)
		.leftJoin(documentVersions, eq(documents.currentVersionId, documentVersions.id))
		.where(eq(documents.projectId, projectId))
		.orderBy(desc(documents.updatedAt), desc(documents.id));
}
