// "NEW" pill rendered on cards (benchmarks, agents) for entries added by the
// most recent successful crawl run. Clears automatically when the next
// successful crawl completes — the render layer derives `isNew` from
// `_crawl.run_id === latestSuccessfulRunId`.

import { Badge } from "@/components/ui/Badge";

export function NewBadge({ title = "Added by the most recent crawl" }: { title?: string }) {
  return (
    <span title={title}>
      <Badge color="#22d3ee" size="sm">
        NEW
      </Badge>
    </span>
  );
}
