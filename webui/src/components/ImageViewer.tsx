import { ChevronLeft, ChevronRight, Share } from "@mui/icons-material";
import { Alert, Container, Snackbar, Typography } from "@mui/material";
import { useRef, useState } from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";

interface Props {
  searchText: string;
  images: ReactImageGalleryItem[];
}

const ImageViewer = ({ searchText, images }: Props) => {
  const galleryRef = useRef<ImageGallery>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleLeftClick = () => {
    if (galleryRef.current) galleryRef.current.slideToIndex(galleryRef.current.getCurrentIndex() - 1);
  };

  const handleRightClick = () => {
    if (galleryRef.current) galleryRef.current.slideToIndex(galleryRef.current.getCurrentIndex() + 1);
  };

  const handleShareClick = () => {
    if (galleryRef.current)
      navigator.clipboard
        .writeText(images[galleryRef.current.getCurrentIndex()].original)
        .then(() => setAlertOpen(true));
  };

  return (
    <Container maxWidth={"md"}>
      <Typography align={"center"}>{searchText}</Typography>
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
        <Alert severity="success">Link copied to clipboard!</Alert>
      </Snackbar>
    </Container>
  );
};

export default ImageViewer;
