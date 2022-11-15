import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useCallback, useState } from "react";
import { BackendUrl } from "../consts";

type GenerateResult = Readonly<{ imageId: string }>;

export const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [imageId, setImageId] = useState<string>();

  const doSearch = useCallback((searchText: string) => {
    fetch(`${BackendUrl}/generate`, {
      method: "POST",
      body: JSON.stringify({ prompt: searchText }),
      credentials: "include",
    })
      .then(r => r.json())
      .then(b => b as GenerateResult)
      .then(gr => setImageId(gr.imageId));
  }, []);

  return (
    <>
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
