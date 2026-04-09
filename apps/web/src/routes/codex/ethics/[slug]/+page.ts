import type { CodexDetail } from "../../../../../../packages/contracts/src";
import { fetchEthic } from "../../../../lib/api/codex";

export async function load({ params }: { params: { slug: string } }) {
  const ethic: CodexDetail = await fetchEthic(params.slug);
  return { ethic };
}
