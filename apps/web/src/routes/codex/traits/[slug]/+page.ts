import type { CodexDetail } from "../../../../../../packages/contracts/src";
import { fetchTrait } from "../../../../lib/api/codex";

export async function load({ params }: { params: { slug: string } }) {
  const trait: CodexDetail = await fetchTrait(params.slug);
  return { trait };
}
