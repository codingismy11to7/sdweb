import Container from "@mui/material/Container";
import { useCallback, useEffect, useState } from "react";
import RequestCard from "../components/RequestCard";
import { fetchRequests } from "../rpc/backend";
import { RequestsResponse } from "../rpc/models";

const RequestsViewer = () => {
  const [notFetched, setNotFetched] = useState(true);
  const [requests, setRequests] = useState<RequestsResponse>();

  const doRequestsFetch = useCallback(() => {
    fetchRequests(
      res => setRequests(res),
      err => console.error(err),
    ).then(() => setNotFetched(false));
  }, []);

  useEffect(() => {
    if (notFetched) {
      doRequestsFetch();
    }
  }, [doRequestsFetch, notFetched]);

  return (
    <Container maxWidth={"sm"}>
      {requests?.map(request => (
        <RequestCard key={request.id} prompt={request.prompt} imageId={request.id} />
      ))}
    </Container>
  );
};

export default RequestsViewer;
