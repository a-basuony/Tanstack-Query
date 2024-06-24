# React Query

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, notes of React Query

Certainly! Here's a detailed and organized set of notes on using TanStack Query (formerly known as React Query) for your study and interview preparation.

---

# How to Use TanStack Query

## 1. Install TanStack Query

```sh
npm install @tanstack/react-query
```

## 2. Set Up QueryClient and QueryClientProvider

Wrap your application with the `QueryClientProvider` at the root level to make the `QueryClient` available throughout your application.

**Example:**

```javascript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom";
import App from "./App";

// Create a client
const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById("root")
);
```

## 3. Fetch Data with useQuery

**Example:**

```javascript
import { useQuery } from "@tanstack/react-query";

const fetchTodos = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const Todos = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    // staleTime: 5000, // Keeps data fresh for 5 seconds
    // gcTime: 30000, // Cached data is garbage collected after 30 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <h1>Todos</h1>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Todos;
```

## 4. Make Query Function Global for Fetching Data

1. Create a `utils` folder and an `http.js` file for the fetch function.

```javascript
// utils/http.js
export async function fetchEvents({ signal, searchTerm }) {
  let url = "http://localhost:3000/events";
  if (searchTerm) {
    url += "?search=" + searchTerm;
  }
  const response = await fetch(url, { signal: signal });
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const { events } = await response.json();
  return events;
}
```

2. Use the function in your components to fetch data.

```javascript
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "./utils/http";
import { useRef, useState } from "react";

const Events = () => {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term to find events.</p>;

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  if (isError) {
    content = (
      <p>
        An error occurred: {error.info?.message || "Failed to fetch events."}
      </p>
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} id="search-form">
        <input type="search" placeholder="Search events" ref={searchElement} />
        <button>Search</button>
      </form>
      {content}
    </div>
  );
};

export default Events;
```

## 5. useMutation for Data Modifications (POST, PUT, PATCH, DELETE)

**Example for Creating a New Event (POST):**

```javascript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Mutation function to create a new event
async function createNewEvent(eventData) {
  const response = await fetch("http://localhost:3000/events", {
    method: "POST",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = new Error("An error occurred while creating the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return response.json();
}

// Component to handle event creation
const CreateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      navigate("/events");
    },
  });

  const handleSubmit = (formData) => {
    mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {isLoading && <p>Submitting...</p>}
      {isError && <p>Error: {error.message}</p>}
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
```

## 6. useQuery for Reading a Specific Event (GET)

**Example:**

```javascript
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Fetch function for a single event
async function fetchEvent({ signal, id }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    signal,
  });
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return response.json();
}

// Component to display a specific event
const EventDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
};

export default EventDetails;
```

## 7. Optimistic Updating with useMutation (PUT)

**Example for Updating an Event with Optimistic Updates:**

```javascript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

// Mutation function to update an event
async function updateEvent(eventData) {
  const response = await fetch(`http://localhost:3000/events/${eventData.id}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = new Error("An error occurred while updating the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return response.json();
}

// Component to handle event updates
const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ["events", id] });

      const previousEvent = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], newEvent);

      return { previousEvent };
    },
    onError: (err, newEvent, context) => {
      queryClient.setQueryData(["events", newEvent.id], context.previousEvent);
    },
    onSettled: (newEvent) => {
      queryClient.invalidateQueries(["events", newEvent.id]);
    },
  });

  const handleSubmit = (formData) => {
    mutate({ id, event: formData });
    navigate("../");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" />
      <input name="description" placeholder="Description" />
      <button type="submit">Update Event</button>
    </form>
  );
};

export default EditEvent;
```

## Summary

1. **Install @tanstack/react-query.**
2. **Create a Query Client and wrap your app with QueryClientProvider.**
3. **Create a fetch function.**
4. **Use useQuery to fetch and display data.**
