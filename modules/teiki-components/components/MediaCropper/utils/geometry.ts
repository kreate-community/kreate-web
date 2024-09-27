import {
  AbsolutePoint,
  AbsoluteRect,
  Area,
  AspectRatio,
  Point,
  Rect,
  RelativePoint,
  RelativeRect,
  Size,
} from "../types";

export function inverseRelativeRect(rect: RelativeRect) {
  return {
    w: 1 / rect.w,
    h: 1 / rect.h,
    x: -rect.x / rect.w,
    y: -rect.y / rect.h,
  };
}

export function getCenter(rect: Rect): Point {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function fit(
  rect: AbsoluteRect,
  aspectRatio: AspectRatio,
  centerRelative: RelativePoint,
  area: Area
): AbsoluteRect {
  const centerAbsolute = toAbsolutePoint(centerRelative, rect);
  const w = Math.sqrt(area * aspectRatio);
  const h = Math.sqrt(area / aspectRatio);
  const x = centerAbsolute.x - centerRelative.x * w;
  const y = centerAbsolute.y - centerRelative.y * h;
  return { x, y, w, h };
}

export function growToFit(
  rect: AbsoluteRect,
  aspectRatio: AspectRatio,
  centerRelative: RelativePoint
): AbsoluteRect {
  const area = Math.max(
    rect.w * (rect.w / aspectRatio),
    rect.h * aspectRatio * rect.h
  );
  return fit(rect, aspectRatio, centerRelative, area);
}

export function shrinkToFit(
  rect: AbsoluteRect,
  aspectRatio: AspectRatio,
  centerRelative: RelativePoint
): AbsoluteRect {
  const area = Math.min(
    rect.w * (rect.w / aspectRatio),
    rect.h * aspectRatio * rect.h
  );
  return fit(rect, aspectRatio, centerRelative, area);
}

export function toAbsolutePoint(
  point: RelativePoint,
  rect: AbsoluteRect
): AbsolutePoint {
  return {
    x: point.x * rect.w + rect.x,
    y: point.y * rect.h + rect.y,
  };
}

export function toRelativePoint(
  point: AbsolutePoint,
  rect: AbsoluteRect
): RelativePoint {
  return {
    x: (point.x - rect.x) / rect.w,
    y: (point.y - rect.y) / rect.h,
  };
}

export function toAbsoluteRect(rect: RelativeRect, size: Size): AbsoluteRect {
  return {
    x: rect.x * size.w,
    y: rect.y * size.h,
    w: rect.w * size.w,
    h: rect.h * size.h,
  };
}

export function toRelativeRect(rect: AbsoluteRect, size: Size): AbsoluteRect {
  return {
    x: rect.x / size.w,
    y: rect.y / size.h,
    w: rect.w / size.w,
    h: rect.h / size.h,
  };
}

export function fromDomRect(rect: DOMRect): AbsoluteRect {
  return {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
  };
}
