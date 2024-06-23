import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/fetch.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event", id], // Include id in the queryKey to make it a complex to not cache and use the same id for the same data
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const mutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  function handleDelete() {
    if (id) {
      mutation.mutate({ id }); // Ensure id is passed as an object
    } else {
      console.error("Event ID is not defined");
    }
  }
  let formattedDate;
  if (data) {
    formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isLoading && (
          <div id="event-details-content" className="center">
            <LoadingIndicator />
          </div>
        )}
        {!isLoading && data && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={handleDelete} disabled={mutation.isLoading}>
                  {mutation.isLoading ? "Deleting..." : "Delete"}
                </button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  <time dateTime={`${data.date}T${data.time}`}>
                    {formattedDate} @ {data.time}
                  </time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </>
        )}
        {isError && (
          <div id="event-details-content" className="center">
            <ErrorBlock
              title="An error occurred"
              message={error.info?.message || "Failed to fetch event"}
            />
          </div>
        )}
        {mutation.isError && (
          <ErrorBlock
            title="An error occurred"
            message={mutation.error.message || "Failed to delete event"}
          />
        )}
      </article>
    </>
  );
}
