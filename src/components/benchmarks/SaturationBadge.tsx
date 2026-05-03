import { Badge } from "@/components/ui/Badge";
import { saturationColor, saturationLabel } from "@/lib/utils";
import type { SaturationStatus } from "@/lib/types";

export function SaturationBadge({ status }: { status: SaturationStatus }) {
  return (
    <Badge color={saturationColor(status)}>
      {saturationLabel(status)}
    </Badge>
  );
}
