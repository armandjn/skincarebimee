/** One non-empty trimmed entry per line. */
export const lines = (text: unknown): string[] =>
	String(text ?? "")
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

export const money = (p: number | null | undefined): string =>
	p === 0 ? "Free" : typeof p === "number" ? `$${p}` : "";

interface Img {
	id?: string;
	src?: string;
	alt?: string;
	meta?: { storageKey?: string };
}

/** URL for an image field: a public path (src) or media stored in KV. */
export const imgSrc = (image: Img | null | undefined): string =>
	image?.src || (image?.id ? `/_emdash/api/media/file/${image.meta?.storageKey ?? image.id}` : "");

export const CATEGORIES: [string, string][] = [
	["all", "All"],
	["face", "Face"],
	["advanced", "Advanced"],
	["body", "Body"],
	["virtual", "Virtual"],
	["soon", "Coming soon"],
];
