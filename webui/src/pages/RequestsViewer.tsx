import Container from "@mui/material/Container";
import { useLoaderData } from "react-router-dom";
import RequestCard from "../components/RequestCard";
import { RequestsResponse } from "../rpc/models";

const RequestsViewer = () => {
  const requests = useLoaderData() as RequestsResponse;

  return (
    <Container maxWidth={"sm"}>
      {requests?.map(request => (
        <RequestCard key={request.id} prompt={request.prompt} imageId={request.id} />
      ))}
    </Container>
  );
};

export default RequestsViewer;
