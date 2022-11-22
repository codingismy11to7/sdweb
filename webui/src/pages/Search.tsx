import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { Alert, Fab } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Key } from "ts-key-enum";
import { fetchRequest, gridImageUrl, imageSearch } from "../rpc/backend";
import { Generate } from "../rpc/models";
import { usePrevious } from "../util/hooks";
import { isDefined } from "../util/undefOr";

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
  const params = useParams();
  const imageId = params.imageId;
  const [generating, setGenerating] = useState(false);
  const [fetchedRequest, setFetchedRequest] = useState<Generate>();
  const [searchText, setSearchText] = useState("");
  const [notFound, setNotFound] = useState<boolean>();
  const navigate = useNavigate();
  const [t] = useTranslation();

  const oldImageId = usePrevious(imageId);
  useEffect(() => {
    if (oldImageId !== imageId) setNotFound(undefined);
  }, [imageId, oldImageId]);

  const doSearch = useCallback(
    (searchText: string) => {
      setGenerating(true);
      imageSearch(searchText, gr => navigate(`/sd/search/${gr.imageId}`)).finally(() => setGenerating(false));
    },
    [navigate],
  );

  useEffect(() => {
    if (imageId) {
      setFetchedRequest(undefined);
      setNotFound(undefined);
      fetchRequest(
        imageId,
        frr => {
          console.log("found request");
          setFetchedRequest(frr);
          setSearchText(frr.prompt);
          setNotFound(false);
        },
        resp => {
          if (resp.status === 404) {
            console.log("couldn't find this request");
            setNotFound(true);
          }
        },
      );
    }
  }, [imageId]);

  return (
    <>
      <Backdrop sx={{ color: "text.primary", zIndex: theme => theme.zIndex.drawer + 1 }} open={generating}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
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
      {!!imageId && isDefined(notFound) && !notFound && !generating && isDefined(fetchedRequest) ? (
        <Suspense>
          <ImageViewer images={imageList(imageId)} prompt={fetchedRequest.prompt} />
        </Suspense>
      ) : (
        <></>
      )}
    </>
  );
};
