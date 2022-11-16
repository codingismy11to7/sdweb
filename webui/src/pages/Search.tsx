import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useCallback, useState } from "react";
import { BackendUrl } from "../consts";

type GenerateResult = Readonly<{ imageId: string }>;

export const Search = () => {
  const [generating, setGenerating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [imageId, setImageId] = useState<string>();

  const doSearch = useCallback((searchText: string) => {
    setGenerating(true);
    fetch(`${BackendUrl}/api/generate`, {
      method: "POST",
      body: JSON.stringify({ prompt: searchText }),
      credentials: "include",
    })
      .then(r => r.json())
      .then(b => b as GenerateResult)
      .then(gr => setImageId(gr.imageId))
      .finally(() => setGenerating(false));
  }, []);

  return (
    <>
      <Backdrop sx={{ color: "text.primary", zIndex: theme => theme.zIndex.drawer + 1 }} open={generating}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <TextField label="Description of image" value={searchText} onChange={e => setSearchText(e.target.value)} />
      <Button variant="contained" disabled={!searchText.length} onClick={() => doSearch(searchText)}>
        Generate
      </Button>
      {imageId !== undefined && imageId ? (
        <img
          src={`${BackendUrl}/image/${imageId}`}
          alt={`generated result for ${searchText}`}
          style={{ maxWidth: "100%" }}
        />
      ) : (
        <></>
      )}
    </>
  );
};
