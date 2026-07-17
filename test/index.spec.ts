import {
	createExecutionContext,
	env,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../src/index";

describe("Internal Sites Platform", () => {
	// ── Deploy page ──────────────────────────────────────────────────────

	it("serves the deploy page at /deploy with Access identity", async () => {
		const request = new Request("http://localhost/deploy", {
			headers: {
				"Cf-Access-Authenticated-User-Email": "test@company.com",
			},
		});
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const body = await response.text();
		expect(body).toContain("Upload and deploy");
		expect(body).toContain("Deploy site");
		expect(body).toContain("Drop a folder or ZIP");
	});

	it("redirects / to /deploy with Access identity", async () => {
		const request = new Request("http://localhost/", {
			headers: {
				"Cf-Access-Authenticated-User-Email": "test@company.com",
			},
		});
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/deploy");
	});

	// ── Access enforcement ───────────────────────────────────────────────

	it("returns 401 when no Access identity is present", async () => {
		const request = new Request("http://localhost/deploy");
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
		const body = await response.text();
		expect(body).toContain("Company sign-in is required");
	});

	it("returns 401 on API routes without Access identity", async () => {
		const request = new Request("http://localhost/api/sites/test-site");
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
	});

	it("returns 401 on admin without Access identity", async () => {
		const request = new Request("http://localhost/admin");
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
	});

	// ── API validation ───────────────────────────────────────────────────

	it("returns 400 when deploying with no files", async () => {
		const formData = new FormData();
		formData.set("name", "Test Site");
		formData.set("slug", "test-site");
		formData.set("paths", "[]");

		const request = new Request("http://localhost/api/sites/deploy", {
			method: "POST",
			body: formData,
			headers: {
				"Cf-Access-Authenticated-User-Email": "test@company.com",
			},
		});
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
		const data = (await response.json()) as { error: string };
		expect(data.error).toContain("folder or ZIP");
	});

	it("returns 404 for non-existent site via API", async () => {
		const request = new Request(
			"http://localhost/api/sites/nonexistent-slug",
			{
				headers: {
					"Cf-Access-Authenticated-User-Email": "test@company.com",
				},
			},
		);
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(404);
		const data = (await response.json()) as { error: string };
		expect(data.error).toBe("Site not found");
	});

	// ── Favicon ──────────────────────────────────────────────────────────

	it("returns 204 for favicon.ico", async () => {
		const request = new Request("http://localhost/favicon.ico");
		const ctx = createExecutionContext();
		const response = await app.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
	});
});
