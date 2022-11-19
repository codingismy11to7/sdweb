import { Alert } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRequest, gridImageUrl, imageSearch } from "../backend";
import { usePrevious } from "../util/hooks";

export const Search2 = () => {
  const params = useParams();
  const imageId = params.imageId;
  const [generating, setGenerating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [notFound, setNotFound] = useState<boolean>();
  const navigate = useNavigate();

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
      fetchRequest(
        imageId,
        frr => {
          console.log("found request");
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
      <TextField label="Description of image" value={searchText} onChange={e => setSearchText(e.target.value)} />
      <Button variant="contained" disabled={!searchText.length} onClick={() => doSearch(searchText)}>
        Generate
      </Button>
      {notFound ? (
        <div>
          <Alert severity="warning">Request not found</Alert>
        </div>
      ) : (
        <></>
      )}
      {imageId !== undefined && imageId && notFound !== undefined && !notFound && !generating ? (
        <img src={gridImageUrl(imageId)} alt={`generated result for ${searchText}`} style={{ maxWidth: "100%" }} />
      ) : (
        <></>
      )}
    </>
  );
};
