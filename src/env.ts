import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_VERSION: {
		description: 'The API version to use for requests.',
		public: true
	},
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	GITHUB_CLIENT_ID: {
		description:
			'GitHub OAuth client ID. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).'
	},
	GITHUB_CLIENT_SECRET: {
		description:
			'GitHub OAuth client secret. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).'
	},
	AWS_REGION: {
		description: 'The AWS region for the S3 bucket.'
	},
	AWS_ACCESS_KEY_ID: {
		description: 'The AWS access key ID for the S3 bucket.'
	},
	AWS_SECRET_ACCESS_KEY: {
		description: 'The AWS secret access key for the S3 bucket.'
	},
	AWS_S3_BUCKET: {
		description: 'The name of the AWS S3 bucket.'
	}
});
