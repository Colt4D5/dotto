import type { RequestHandler } from './$types';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3, bucket } from '#lib/server/s3';

export const POST: RequestHandler = async ({ request }) => {
    const { filename, contentType } = await request.json();

    const key = `uploads/${crypto.randomUUID()}-${filename}`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: 60
    });

    return Response.json({
        uploadUrl,
        key
    });
};