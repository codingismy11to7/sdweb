import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { gridImageUrl } from "../rpc/backend";

type Props = Readonly<{
  prompt: string;
  imageId: string;
}>;

const RequestCard = ({ prompt, imageId }: Props) => (
  <Card sx={{ minWidth: 275, marginTop: "15px" }}>
    <CardHeader title={prompt} titleTypographyProps={{ variant: "h6" }} style={{ background: "#e0e0e0" }} />
    <CardMedia component="img" height="194" image={gridImageUrl(imageId)} />
  </Card>
);

export default RequestCard;
