import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { Alert, Fab } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import TextField from "@mui/material/TextField";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Key } from "ts-key-enum";
import ReelToReel from "../components/spinner/ReelToReel";
import { gridImageUrl, imageSearch } from "../rpc/backend";
import { Generate } from "../rpc/models";
import { foreach, isDefined, UndefOr } from "../util/undefOr";

const ImageViewer = lazy(() => import("../components/ImageViewer"));

const imageList = (imageId: string) =>
  [
    {
      original: `${gridImageUrl(imageId)}`,
      thumbnail: `${gridImageUrl(imageId)}`,
    },
  ].concat(
    Array.from(Array(6).keys()).map(i => ({
      original: `${gridImageUrl(imageId)}/${i}`,
      thumbnail: `${gridImageUrl(imageId)}/${i}`,
    })),
  );

export const Search = () => {
  const searchItem = useLoaderData() as UndefOr<Generate>;
  const params = useParams();
  const imageId = params.imageId;
  const notFound = isDefined(imageId) && !isDefined(searchItem);
  const [generating, setGenerating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [t] = useTranslation();

  useEffect(() => foreach(searchItem?.prompt, setSearchText), [searchItem?.prompt]);

  const doSearch = useCallback(
    (searchText: string) => {
      setGenerating(true);
      imageSearch(searchText, gr => navigate(`/sd/search/${gr.imageId}`)).finally(() => setGenerating(false));
    },
    [navigate],
  );

  return (
    <>
      <Backdrop sx={{ color: "text.primary", zIndex: theme => theme.zIndex.drawer + 1 }} open={generating}>
        <ReelToReel />
      </Backdrop>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", margin: "5px" }}
      >
        <TextField
          label={t("common.searchtext")}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyUp={e => {
            if (e.key === Key.Enter && searchText) doSearch(searchText);
          }}
          onKeyDown={e => {
            if (e.key === Key.ArrowLeft || e.key === Key.ArrowRight) e.stopPropagation();
          }}
          autoFocus
          style={{ flexGrow: 1, maxWidth: "500px" }}
        />
        <Fab disabled={!searchText.length} onClick={() => doSearch(searchText)} color={"primary"} style={{ margin: 5 }}>
          <PrecisionManufacturingIcon />
        </Fab>
      </div>
      {notFound ? (
        <div>
          <Alert severity="warning">{t("common.notfound")}</Alert>
        </div>
      ) : (
        <></>
      )}
      {!!imageId && !notFound && !generating && isDefined(searchItem) ? (
        <Suspense>
          <ImageViewer images={imageList(imageId)} prompt={searchItem.prompt} />
        </Suspense>
      ) : (
        <></>
      )}
    </>
  );
};
