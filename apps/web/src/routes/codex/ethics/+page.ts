import type { CodexListItem } from "../../../../../packages/contracts/src";
import { fetchEthics } from "../../../lib/api/codex";

export async function load() {
  const items: CodexListItem[] = await fetchEthics();
  return { items };
}
