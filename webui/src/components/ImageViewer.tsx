import { ChevronLeft, ChevronRight, Share } from "@mui/icons-material";
import { Alert, Container, Snackbar, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { useIsDesktop } from "../util/hooks";

type Props = Readonly<{
  prompt: string;
  label?: string;
  images: readonly ReactImageGalleryItem[];
}>;

const ImageViewer = ({ prompt, label, images }: Props) => {
  const isDesktop = useIsDesktop();
  const galleryRef = useRef<ImageGallery>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [t] = useTranslation();

  const handleLeftClick = () => {
    if (galleryRef.current) galleryRef.current.slideToIndex(galleryRef.current.getCurrentIndex() - 1);
  };

  const handleRightClick = () => {
    if (galleryRef.current) galleryRef.current.slideToIndex(galleryRef.current.getCurrentIndex() + 1);
  };

  const handleShareClick = () => {
    if (galleryRef.current)
      navigator.clipboard
        .writeText(`${prompt}\n${images[galleryRef.current.getCurrentIndex()].original}`)
        .then(() => setAlertOpen(true));
  };

  return (
    <Container maxWidth={"md"} sx={{ p: isDesktop ? 1 : 0 }}>
      {!!label ? <Typography align={"center"}>{label}</Typography> : <></>}
      <ImageGallery
        ref={galleryRef}
        items={images}
        showThumbnails={true}
        showBullets={false}
        renderLeftNav={() => (
          <button className={"image-gallery-icon image-gallery-left-nav"} onClick={handleLeftClick}>
            <ChevronLeft fontSize={"large"} />
          </button>
        )}
        renderRightNav={() => (
          <button className={"image-gallery-icon image-gallery-right-nav"} onClick={handleRightClick}>
            <ChevronRight fontSize={"large"} />
          </button>
        )}
        renderPlayPauseButton={() => (
          <button onClick={handleShareClick} className={"image-gallery-icon image-gallery-play-button"}>
            <Share />
          </button>
        )}
      />
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert severity="success">{t("common.linkcopied")}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ImageViewer;
