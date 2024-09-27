import cx from "classnames";
import Image from "next/image";
import * as React from "react";

import { AbsoluteRect, RelativePoint, RelativeRect, Size } from "../../types";
import {
  getCenter,
  growToFit,
  inverseRelativeRect,
  toAbsoluteRect,
} from "../../utils/geometry";

import styles from "./index.module.scss";

import { useElementSize } from "@/modules/common-hooks/hooks/useElementSize";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  src: string;
  crop: RelativeRect;
  fill: boolean | undefined;
  onImageLoaded?: (event: { imageNaturalSize: Size }) => void;
};

export default function ImageViewer({
  className,
  style,
  src,
  crop,
  fill,
  onImageLoaded,
}: Props) {
  const [rootElement, setRootElement] = React.useState<HTMLDivElement | null>(
    null
  );
  const rootElementSize: Size | null = useElementSize(rootElement);

  const [imageNaturalSize, setImageNaturalSize] = React.useState<Size>();

  const handleLoadingComplete = (img: HTMLImageElement) => {
    if (img.complete) {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (isNaN(w) || isNaN(h) || !w || !h) return;
      setImageNaturalSize({ w, h });
      onImageLoaded && onImageLoaded({ imageNaturalSize: { w, h } });
    } else {
      img.addEventListener(
        "load",
        () => handleLoadingComplete(img), //
        { once: true }
      );
    }
  };

  const imageContainerRect: AbsoluteRect | undefined = !rootElementSize
    ? undefined
    : !imageNaturalSize
    ? toAbsoluteRect(inverseRelativeRect(crop), rootElementSize)
    : growToFit(
        toAbsoluteRect(inverseRelativeRect(crop), rootElementSize),
        imageNaturalSize.w / imageNaturalSize.h,
        getCenter(crop)
      );

  const anchorPoint: RelativePoint = getCenter(crop);

  return (
    <div
      ref={setRootElement}
      className={cx(styles.container, className, fill ? styles.fill : null)}
      style={style}
    >
      <div
        className={styles.imageContainer}
        style={
          imageContainerRect
            ? {
                position: "absolute",
                left: `${imageContainerRect.x}px`,
                top: `${imageContainerRect.y}px`,
                width: `${imageContainerRect.w}px`,
                height: `${imageContainerRect.h}px`,
              }
            : {
                position: "absolute",
                inset: 0,
              }
        }
      >
        <Image
          style={{
            objectFit: "cover",
            objectPosition: `${anchorPoint.x * 100}% ${anchorPoint.y * 100}%`,
            userSelect: "none",
          }}
          src={src}
          alt=""
          fill={true}
          draggable={false}
          onLoadingComplete={handleLoadingComplete}
        />
      </div>
    </div>
  );
}
