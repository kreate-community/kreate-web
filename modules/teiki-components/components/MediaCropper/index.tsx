import cx from "classnames";
import * as React from "react";

import ImageViewer from "./components/ImageViewer";
import styles from "./index.module.scss";
import { AspectRatio, RelativePoint, RelativeRect, Size } from "./types";
import { shrinkToFit, toAbsoluteRect, toRelativeRect } from "./utils/geometry";
import { getIdealFrameSize, getNewCrop } from "./utils/others";

import { useElementSize } from "@/modules/common-hooks/hooks/useElementSize";

type Media = { type: "image"; src: string };

type Props = {
  className?: string;
  style?: React.CSSProperties;
  aspectRatio: AspectRatio;
  media: Media;
  crop: RelativeRect;
  onCropChange?: (crop: RelativeRect) => void;
};

type IMouseEvent = Pick<MouseEvent, "clientX" | "clientY">;

export default function MediaCropper({
  className,
  style,
  aspectRatio,
  media,
  crop,
  onCropChange,
}: Props) {
  const [frameContainerElement, setFrameContainerElement] =
    React.useState<HTMLDivElement | null>(null);
  const frameContainerSize = useElementSize(frameContainerElement);

  const frameSize = getIdealFrameSize(frameContainerSize, aspectRatio);

  const [draggingFrom, setDraggingFrom] = React.useState<RelativePoint>();
  const [draggingTo, setDraggingTo] = React.useState<RelativePoint>();

  const cropWhileDragging: RelativeRect | undefined =
    draggingFrom && draggingTo
      ? getNewCrop(crop, draggingFrom, draggingTo)
      : undefined;

  const [imageNaturalSize, setImageNaturalSize] = React.useState<Size>();

  React.useEffect(() => {
    if (!imageNaturalSize) return;
    const oldCropAbsolute = toAbsoluteRect(crop, imageNaturalSize);
    const newCropAbsolute = shrinkToFit(
      oldCropAbsolute,
      aspectRatio, //
      { x: 0.5, y: 0.5 }
    );
    const newCropRelative = toRelativeRect(newCropAbsolute, imageNaturalSize);
    onCropChange && onCropChange(newCropRelative);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageNaturalSize, aspectRatio]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const frameElement = event.currentTarget;

    const toRelativeToFrame = (event: IMouseEvent) => {
      const rect = frameElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      return { x, y };
    };

    const draggingFrom = toRelativeToFrame(event);
    setDraggingFrom(draggingFrom);

    const handleMouseMove = (event: IMouseEvent) => {
      const draggingTo = toRelativeToFrame(event);
      setDraggingTo(draggingTo);
    };

    const handleMouseUp = (event: IMouseEvent) => {
      const draggingTo = toRelativeToFrame(event);
      setDraggingFrom(undefined);
      setDraggingTo(undefined);
      document.body.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseup", handleMouseUp);
      const newCrop = getNewCrop(crop, draggingFrom, draggingTo);
      onCropChange && onCropChange(newCrop);
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={cx(styles.container, className)} style={style}>
      <div className={styles.content}>
        <div ref={setFrameContainerElement} className={styles.frameContainer}>
          {frameSize ? (
            <div
              className={styles.frame}
              style={{ width: frameSize?.w, height: frameSize?.h }}
              onMouseDown={handleMouseDown}
            >
              <ImageViewer
                src={media.src}
                crop={cropWhileDragging || crop}
                fill
                onImageLoaded={(event) => {
                  setImageNaturalSize(event.imageNaturalSize);
                }}
              />
              <div className={styles.frameOverlay}></div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
