import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { HeadObjectCommand } from '@aws-sdk/client-s3';

import {
	failUploadVersion,
	finalizeUploadVersion,
	getUploadVersionForUser
} from '#lib/server/documents';
import { bucket, s3 } from '#lib/server/s3';

export const POST: RequestHandler = async ({ locals, params: { documentVersionId } }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	if (!/^\d+$/.test(documentVersionId)) {
		throw error(400, 'Invalid document version ID');
	}

	const versionId = Number(documentVersionId);

	if (!Number.isSafeInteger(versionId) || versionId < 1) {
		throw error(400, 'Invalid document version ID');
	}

	const version = await getUploadVersionForUser(userId, versionId);

	if (!version) {
		throw error(404, 'Document version not found');
	}

	if (version.status === 'FAILED') {
		throw error(409, 'This upload has failed');
	}

	if (version.status === 'UPLOADED') {
		return Response.json({ documentId: version.documentId, documentVersionId: version.id });
	}

	let object;

	try {
		object = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: version.storageKey }));
	} catch {
		await failUploadVersion(version.id, 'Uploaded object could not be verified');
		throw error(409, 'Uploaded file could not be verified');
	}

	if (object.ContentLength !== version.fileSize || object.ContentType !== version.mimeType) {
		await failUploadVersion(
			version.id,
			'Uploaded object metadata did not match the upload request'
		);
		throw error(409, 'Uploaded file did not match the upload request');
	}

	const finalized = await finalizeUploadVersion(version.id);

	if (!finalized || !finalized.finalized) {
		throw error(409, 'Unable to finalize this upload');
	}

	return Response.json({ documentId: finalized.documentId, documentVersionId: finalized.id });
};
