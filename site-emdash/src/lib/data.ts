import { getEmDashCollection } from "emdash";
import { toPost, toSvc } from "./classic";

export async function loadServices() {
	const { entries } = await getEmDashCollection("services");
	return entries.sort((a, b) => (a.data.sort ?? 0) - (b.data.sort ?? 0)).map(toSvc);
}

export async function loadPostEntries() {
	const { entries } = await getEmDashCollection("posts");
	// Newest first, by the "October 2026" style label.
	return entries.sort((a, b) => Date.parse(`1 ${b.data.posted}`) - Date.parse(`1 ${a.data.posted}`));
}

export async function loadPosts() {
	return (await loadPostEntries()).map(toPost);
}
