import { Container, Skeleton } from "@mui/material";

export const Loading = () => (
  <Container maxWidth="sm">
    <Skeleton variant="rounded" animation="wave" height={"400px"} />
  </Container>
);
