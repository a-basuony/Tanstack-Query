import { Link, Outlet, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent } from "../../utils/fetch.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event"],
    id,
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  console.log(data);

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isLoading && <LoadingIndicator />}
        {!isLoading && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.image}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  {/* <time dateTime={`Todo-DateT$Todo-Time`}>DATE @ TIME</time> */}
                  <time dateTime={`${data.date}T${data.time}`}>
                    {data.date} @ {data.time}
                  </time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </>
        )}
        {isError && (
          <ErrorBlock
            title="An error occurred"
            message={error.info?.message || "Failed to fetch event"}
          />
        )}
      </article>
    </>
  );
}
