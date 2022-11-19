import { CardContent, Grid } from "@mui/material";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

const codeBlock = (el: ReactNode) => <code style={{ display: "block", whiteSpace: "pre" }}>{el}</code>;
const jsonBlock = (j: any) => (
  <Card variant="outlined" sx={{ p: 2 }}>
    {codeBlock(JSON.stringify(j, undefined, 2))}
  </Card>
);

export const Api = () => (
  <>
    <Typography variant="h3">API</Typography>
    <Grid direction={"column"} container spacing={2}>
      <Grid item>
        <Card>
          <CardHeader title="Reset API Key" />
          <CardContent>
            <div>
              All requests (besides this one) must include an API Token header,{" "}
              <code style={{ color: "red" }}>X-AUTH-TOKEN</code>.
            </div>
            <div>Use this call to create / reset the token for the given user.</div>
          </CardContent>
          <CardContent>
            {codeBlock(<>POST: /&lt;base&gt;/api/key/reset</>)}
            {codeBlock(<>Body:</>)}
            {jsonBlock({
              username: "myusername",
              password: "mypassword",
            })}
            {codeBlock(<>Response:</>)}
            {jsonBlock({ apiKey: "<a new api key for the user>" })}
          </CardContent>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <CardHeader title="Generate Images" />
          <CardContent>
            <div>Use this request to actually run the Stable Diffusion image creation.</div>
            <div>
              <b>
                Important: under normal circumstances, do <i>not</i> specify a custom seed.
              </b>
            </div>
            <div>
              Use the <code>async</code> request parameter to return the imageId before the image is done generating.
            </div>
          </CardContent>
          <CardContent>
            {codeBlock(<>POST: /&lt;base&gt;/api/generate[?async=true]</>)}
            {codeBlock(<>Body:</>)}
            {jsonBlock({
              prompt: "a unicorn getting mauled by a hyena",
              seed: 42,
            })}
            {codeBlock(<>Response:</>)}
            {jsonBlock({
              imageId: "00000000-0000-0000-0000-000000000000",
            })}
          </CardContent>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <CardHeader title="Fetch Images" />
          <CardContent>
            <div>Retrieve a generated image</div>
            <div>The first URL returns the grid of 6 images</div>
            <div>The second URL returns an individual image, numbered 0-5</div>
          </CardContent>
          <CardContent>
            {codeBlock(<>GET: /&lt;base&gt;/image/:imageId</>)}
            {codeBlock(<>GET: /&lt;base&gt;/image/:imageId/:imageNumber</>)}
          </CardContent>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <CardHeader title="Fetch Request" />
          <CardContent>
            <div>Get a request by imageId</div>
          </CardContent>
          <CardContent>
            {codeBlock(<>GET: /&lt;base&gt;/api/prompt/:imageId</>)}
            {codeBlock(<>Response:</>)}
            {jsonBlock({
              prompt: "cartoon darth vader",
              seed: 42,
            })}
          </CardContent>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <CardHeader title="Change Password" />
          <CardContent>
            <div>Change the current user's password</div>
          </CardContent>
          <CardContent>
            {codeBlock(<>POST: /&lt;base&gt;/api/user/password</>)}
            {codeBlock(<>Body:</>)}
            {jsonBlock({ currentPassword: "String", newPassword: "String" })}
            {codeBlock(<>Response:</>)}
            {jsonBlock({ error: "optional error message field" })}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </>
);
