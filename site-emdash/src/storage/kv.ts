/**
 * Cloudflare KV storage adapter for EmDash media (free-plan alternative to R2).
 *
 * Limits to keep in mind: 25 MB per value, 1 GB total, ~1,000 writes/day on the
 * free plan. Upload optimized images (WebP, a few hundred KB each).
 * Metadata (content type, size, upload time) lives in the KV key metadata.
 */

import { env } from "cloudflare:workers";
import type {
	Storage,
	UploadResult,
	DownloadOptions,
	DownloadResult,
	ListResult,
	ListOptions,
	SignedUploadUrl,
	SignedUploadOptions,
} from "emdash";
import { EmDashStorageError } from "emdash";

const TRAILING_SLASH_REGEX = /\/$/;

interface MediaMeta {
	contentType: string;
	size: number;
	uploaded: number;
}

export class KVStorage implements Storage {
	constructor(
		private kv: KVNamespace,
		private publicUrl?: string,
	) {}

	async upload(options: {
		key: string;
		body: Buffer | Uint8Array | ReadableStream<Uint8Array>;
		contentType: string;
		cacheControl?: string;
	}): Promise<UploadResult> {
		try {
			// KV needs the full value; stream bodies are buffered first.
			const bytes =
				options.body instanceof ReadableStream
					? await new Response(options.body).arrayBuffer()
					: new Uint8Array(options.body).buffer;
			const meta: MediaMeta = {
				contentType: options.contentType,
				size: bytes.byteLength,
				uploaded: Date.now(),
			};
			await this.kv.put(options.key, bytes, { metadata: meta });
			return { key: options.key, url: this.getPublicUrl(options.key), size: meta.size };
		} catch (error) {
			throw new EmDashStorageError(`Failed to upload file: ${options.key}`, "UPLOAD_FAILED", error);
		}
	}

	async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
		try {
			const { value, metadata } = await this.kv.getWithMetadata<MediaMeta>(key, "arrayBuffer");
			if (!value) throw new EmDashStorageError(`File not found: ${key}`, "NOT_FOUND");

			const size = value.byteLength;
			let offset = 0;
			let length = size;
			const range = options.range;
			if (range) {
				if (range.suffix !== undefined) {
					length = Math.min(range.suffix, size);
					offset = size - length;
				} else {
					offset = Math.min(range.offset ?? 0, size);
					length = Math.min(range.length ?? size, size - offset);
				}
			}
			const slice = range ? value.slice(offset, offset + length) : value;

			return {
				body: new Response(slice).body as ReadableStream<Uint8Array>,
				contentType: metadata?.contentType || "application/octet-stream",
				size,
				lastModified: new Date(metadata?.uploaded ?? 0),
				...(range && { range: { offset, length } }),
			};
		} catch (error) {
			if (error instanceof EmDashStorageError) throw error;
			throw new EmDashStorageError(`Failed to download file: ${key}`, "DOWNLOAD_FAILED", error);
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.kv.delete(key);
		} catch (error) {
			throw new EmDashStorageError(`Failed to delete file: ${key}`, "DELETE_FAILED", error);
		}
	}

	async exists(key: string): Promise<boolean> {
		try {
			const { value } = await this.kv.getWithMetadata(key, "stream");
			// Release the stream; only existence matters.
			await value?.cancel();
			return value !== null;
		} catch (error) {
			throw new EmDashStorageError(`Failed to check file existence: ${key}`, "HEAD_FAILED", error);
		}
	}

	async list(options: ListOptions = {}): Promise<ListResult> {
		try {
			const res = await this.kv.list<MediaMeta>({
				prefix: options.prefix,
				limit: options.limit,
				cursor: options.cursor,
			});
			return {
				files: res.keys.map((k) => ({
					key: k.name,
					size: k.metadata?.size ?? 0,
					lastModified: new Date(k.metadata?.uploaded ?? 0),
					etag: String(k.metadata?.uploaded ?? ""),
				})),
				nextCursor: res.list_complete ? undefined : res.cursor,
			};
		} catch (error) {
			throw new EmDashStorageError("Failed to list files", "LIST_FAILED", error);
		}
	}

	async getSignedUploadUrl(_options: SignedUploadOptions): Promise<SignedUploadUrl> {
		throw new EmDashStorageError(
			"KV does not support pre-signed upload URLs; uploads go through the Worker.",
			"NOT_SUPPORTED",
		);
	}

	getPublicUrl(key: string): string {
		if (this.publicUrl) return `${this.publicUrl.replace(TRAILING_SLASH_REGEX, "")}/${key}`;
		return `/_emdash/api/media/file/${key}`;
	}
}

export function createStorage(config: Record<string, unknown>): Storage {
	const binding = typeof config.binding === "string" ? config.binding : "";
	const publicUrl = typeof config.publicUrl === "string" ? config.publicUrl : undefined;
	const kv = binding ? ((env as Record<string, unknown>)[binding] as KVNamespace | undefined) : undefined;
	if (!kv) {
		throw new EmDashStorageError(
			`KV binding "${binding}" not found. Add it under kv_namespaces in wrangler.jsonc.`,
			"BINDING_NOT_FOUND",
		);
	}
	return new KVStorage(kv, publicUrl);
}
