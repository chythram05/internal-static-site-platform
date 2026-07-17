/**
 * Cloudflare Access identity helpers.
 *
 * When Cloudflare Access is configured in front of this Worker, every
 * authenticated request includes headers with the user's identity.
 * This module extracts that identity and enforces authentication.
 */

import type { Env } from "./env";

export interface AccessIdentity {
	email: string;
	userId?: string;
}

const EMAIL_HEADER = "Cf-Access-Authenticated-User-Email";
const USER_ID_HEADER = "Cf-Access-Authenticated-User-Id";

/**
 * Extract the Cloudflare Access identity from request headers.
 *
 * Returns `null` if the request has no Access identity and the dev
 * bypass is not enabled.
 */
export function getAccessIdentity(
	request: Request,
	env: Env,
): AccessIdentity | null {
	const email = request.headers.get(EMAIL_HEADER);
	const userId = request.headers.get(USER_ID_HEADER) || undefined;

	if (email) {
		return { email, userId };
	}

	// In local development, skip the identity check entirely.
	if (env.DISABLE_ACCESS_IDENTITY_CHECK === "true") {
		return { email: "local-dev@example.com" };
	}

	return null;
}

/**
 * Require a valid Cloudflare Access identity.
 *
 * Returns the identity if present, or a 401 Response if not.
 * Use this at the top of every route handler:
 *
 * ```ts
 * const identity = requireAccessIdentity(c.req.raw, c.env);
 * if (identity instanceof Response) return identity;
 * ```
 */
export function requireAccessIdentity(
	request: Request,
	env: Env,
): AccessIdentity | Response {
	const identity = getAccessIdentity(request, env);

	if (identity) {
		return identity;
	}

	return new Response(
		"Company sign-in is required to use this site.\n\n" +
			"If you have not configured Cloudflare Access yet, see the README\n" +
			"for instructions on creating an Access application for this Worker.",
		{
			status: 401,
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		},
	);
}
