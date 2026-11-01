import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";


// Free Workers plan caps the bundle at 3 MB gzipped. The admin ships 36 UI
// languages (~2.5 MB gzipped); keep English and Persian, stub the rest.
const KEEP_ADMIN_LOCALES = ["D1vghJc4", "Sj6Maupf", "YnBnL8aZ"]; // en, en-GB, fa
const trimAdminLocales = {
	name: "trim-admin-locales",
	enforce: "pre",
	load(id) {
		const m = id.replaceAll("\\", "/").match(/@emdash-cms\/admin\/dist\/messages-([^./]+)\.js$/);
		if (m && !KEEP_ADMIN_LOCALES.includes(m[1])) return "export const messages = {};";
	},
};

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		plugins: [trimAdminLocales],
		ssr: {
			optimizeDeps: {
				// Pre-bundle so it isn't discovered mid-render, which would trigger
				// a Vite dep re-optimization and break in-flight worker imports
				// under the Cloudflare dev runner (workerd).
				include: ["astro-iconset/components"],
			},
		},
	},
	integrations: [
		react(),
		icon({
			// Only ship the Phosphor icons actually referenced in templates,
			// not the full @iconify-json/ph set (which adds megabytes to the
			// deployed worker bundle).
			include: {
				ph: [
					"arrow-right",
					"bell-simple",
					"buildings",
					"chart-bar",
					"chat-circle",
					"check",
					"check-circle",
					"clock",
					"cloud",
					"code",
					"currency-dollar",
					"envelope",
					"file-text",
					"gauge",
					"globe",
					"heart",
					"leaf",
					"lifebuoy",
					"lightning",
					"list",
					"lock",
					"map-pin",
					"pause",
					"phone",
					"play",
					"plug",
					"plus",
					"shield-check",
					"sparkle",
					"star",
					"sun",
					"thermometer-simple",
					"trend-up",
					"users-three",
					"x",
				],
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			// Free-plan media storage: KV instead of R2 (see src/storage/kv.ts)
			storage: { entrypoint: "/src/storage/kv.ts", config: { binding: "MEDIA_KV" } },
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Jost",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "Cormorant Garamond",
			cssVariable: "--font-display",
			weights: [400, 500, 600],
			styles: ["normal", "italic"],
			fallbacks: ["serif"],
		},
	],
	devToolbar: { enabled: false },
});
