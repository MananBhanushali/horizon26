import { PanelSkeleton, SkeletonBlock } from "@/components/ui/SystemStates";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock height={10} width={140} />
        <SkeletonBlock height={28} width="40%" />
        <SkeletonBlock height={14} width="60%" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <PanelSkeleton rows={6} />
        <PanelSkeleton rows={6} />
      </div>
    </div>
  );
}
