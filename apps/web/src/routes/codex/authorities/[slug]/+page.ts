import type { CodexDetail } from "../../../../../../packages/contracts/src";
import { fetchAuthority } from "../../../../lib/api/codex";

export async function load({ params }: { params: { slug: string } }) {
  const authority: CodexDetail = await fetchAuthority(params.slug);
  return { authority };
}
