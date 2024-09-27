import { RelativePoint, RelativeRect, Size } from "../types";

export function getIdealFrameSize(
  frameContainerSize: Size | null | undefined,
  aspectRatio: number | null | undefined
): Size | undefined {
  if (!frameContainerSize || !aspectRatio) return undefined;
  const { w: W, h: H } = frameContainerSize;
  const expectedArea = Math.min(
    W * H * 0.64,
    W * (W / aspectRatio) * 0.81,
    H * (H * aspectRatio) * 0.81
  );

  return {
    w: Math.sqrt(expectedArea * aspectRatio),
    h: Math.sqrt(expectedArea / aspectRatio),
  };
}

function clamp(min: number, val: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function getNewCrop(
  crop: RelativeRect,
  draggingFrom: RelativePoint,
  draggingTo: RelativePoint
): RelativeRect {
  return {
    x: clamp(0, crop.x + (draggingFrom.x - draggingTo.x) * crop.w, 1 - crop.w),
    y: clamp(0, crop.y + (draggingFrom.y - draggingTo.y) * crop.h, 1 - crop.h),
    w: crop.w,
    h: crop.h,
  };
}
