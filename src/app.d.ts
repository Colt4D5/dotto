import type { User, Session } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			projects?: Project[];
		}

		interface Project {
			id: string;
			name: string;
			description: string;
		}

		// interface Error {}
		interface PageData {
			user?: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
