# How to use Tanstak Query

# 1- install :

        npm install @tanstack/react-query

# 2- Set Up QueryClient and QueryClientProvider {For get Data from backend}

        Wrap your application with the QueryClientProvider at the root level. This makes the QueryClient available throughout your application.
        # Example
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
            import App from './App';

            // Create a client
            const queryClient = new QueryClient();

            ReactDOM.render(
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            )

# 3- Fetch Data with useQuery

        import { useQuery } from '@tanstack/react-query';

        const fetchTodos = async () => {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        };

        const Todos = () => {

             const { data, isLoading, isError, error } = useQuery({
                        queryKey: ["todos"], // is used to uniquely identify
                        queryFn: fetchTodos, // is the function that performs the data fetching.
                        // staleTime: 5000, //remains يبقي  data fresh for 5 sec
                        // gcTime: 30000, //Cached data is garbage collected after 5 seconds
                    });

            if (isLoading) return <div>Loading...</div>;
            if (error) return <div>An error occurred: {error.message}</div>;

            return (
                <div>
                <h1>Todos</h1>
                <ul>
                    {data.map(todo => (
                    <li key={todo.id}>{todo.title}</li>
                    ))}
                </ul>
                </div>
            );
            };

            export default Todos;

# ------------------------------

# make query function global for every get data

    1- make utils folder => http.js file for fetch function

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


    2- use the function in every call to get data

        const searchElement = useRef();
        const [searchTerm, setSearchTerm] = useState('');



          const { data, isLoading, isError, error } = useQuery({
                            queryKey: ["events", { search: searchTerm }], // uniquely id the query.
                            queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }), // (signal => )
                            enabled: searchTerm !== undefined, // enabled by default is true should be executed. | if false it will be no request work and it will not executed
                        });

          function handleSubmit(event) {
                event.preventDefault();
                setSearchTerm(searchElement.current.value);
            }


        let content = <p>Please enter a search term and to find events.</p>;

        if (isLoading) {
            content = <LoadingIndicator />;
        }

        if (isError) {
            content = (
            <ErrorBlock
                title="An error occurred"
                message={error.info?.message || "Failed to fetch events."}
            />
            );
        }

        if (data) {
            content = (
            <ul className="events-list">
                {data.map((event) => (
                <li key={event.id}>
                    <EventItem event={event} />
                </li>
                ))}
            </ul>
            );
        }

        return (
              <form onSubmit={handleSubmit} id="search-form">
                    <input
                        type="search"
                        placeholder="Search events"
                        ref={searchElement}
                    />
                    <button>Search</button>
                </form>
                {content}
        )

# 4- useMutation create, update, edit, delete (POST , UPDATE, PUT, PATCH, DELETE)

    Mutation Function:
        This is the function that performs the data-modifying operation, such as an HTTP POST, PUT, PATCH, or DELETE request.


        (POST)

            1=> import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
                import { QueryClient } from "@tanstack/react-query";

                const queryClient = new QueryClient();
                const navigate = useNavigate();

            2=> const { mutate, isPending, isError, error } = useMutation({
                        mutationFn: createNewEvent,
                        onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ["events"] }); // ensure the data (read) is up to date
                            navigate("/events"); // to navigate after create
                        },
                    });

                    -queryClient.invalidateQueries({ queryKey: ["events"] });
                            to ensure that your application displays the up-to-date information after a mutation ( creating, updating, or deleting data).
                            ensure that your application's data remains consistent and up-to-date with the server
                            providing a better user experience.
            3=>
                 function handleSubmit(formData) {
                        mutate(formData);
                    }

                - mutate(formData)
                    mutate(formData) is used to send a request to create a new event with the data collected from a form.
                    to execute a mutation with the provided data.
                    triggers the mutation function (createNewEvent) with the provided formData.


            4=> Submit the form
                <From onSubmit={handleSubmit}>
                    {isPending && "Submitting..."}
                    {isError && "Error: " + error.message}
                    <button type="submit">Create Event</button>
                </Form>


            5=> export async function createNewEvent(eventData) {
                        const response = await fetch(`http://localhost:3000/events`, {
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

                        const { event } = await response.json();

                        return event;
                    }

# 5- useQuery ( read (get) a specific event or single product)

    1=> const { id } = useParams();

    2=> const { data, isLoading, isError, error } = useQuery({
                queryKey: ["event", id], // Include id in the queryKey to make it a complex to not cache and use the same id for the same data
                queryFn: ({ signal }) => fetchEvent({ signal, id }),
            });

    3=> {isLoading && <p>Loading...</p>}
        {isError && <ErrorComp title={error.message}>}
        {data && <h1>{data.title}</h1>}

    4=> export async function fetchEvent({ signal, id }) {
                const response = await fetch(`http://localhost:3000/events/${id}`, {
                    signal,
                });
                if (!response.ok) {
                    const error = new Error("An error occurred while fetching the event");
                    error.code = response.status;
                    error.info = await response.json();
                    throw error;
                }
                const { event } = await response.json();
                return event;
        }

# 6-useMutation for Delete (DELETE)

    1=>
        const { id } = useParams();
        const queryClient = new QueryClient();
        const navigate = useNavigate();

        <!-- const {mutate, isPending, isError, error} = useMutation({ --> // another way
        <!-- const {mutate, isPending: loadingDelete, isError: isErrorDelete, error: errorDelete} = useMutation({ --> // another way
        const mutation = useMutation({
                mutationFn: deleteEvent,
                onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["events"] });
                navigate("/events");
                },
            });

    2=>  function handleDelete() {
            mutation.mutate({ id }); // Ensure id is passed as an object
        }

    3=> <button onClick={handleDelete} className="button">
                Delete
              </button>

    4=>
          {mutation.isPending && <p>Deleting, please wait...</p>}
          {!mutation.isPending && (
            <div className="form-action">
              <button onClick={handleEndDelete} className="button-text">
                Cancel
              </button>
              <button onClick={handleDelete} className="button">
                Delete
              </button>
            </div>
          )}
          {mutation.isError && (<ErrorBlock title={error.info?.message || "an error occurred"}/>) }


    3=> export async function deleteEvent({ id }) {
            const response = await fetch(`http://localhost:3000/events/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = new Error("An error occurred while deleting the event");
                error.code = response.status;
                error.info = await response.json();
                throw error;
            }
            const { event } = await response.json();
            return event;
        }

# 7- useMutation with update (PUT)

Certainly! Let's dive deeper into the Update mutation setup in this component:

```javascript
const { mutate } = useMutation({
  mutationFn: updateEvent,
  onMutate: async (data) => {
    const newEvent = data.event;
    await queryClient.cancelQueries({ queryKey: ["events", id] });
    const previousEvent = queryClient.getQueryData([["events", id]]);
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
```

This setup uses React Query's `useMutation` hook to manage the event update process. Let's break it down:

1. `mutationFn: updateEvent`:
   This specifies the function that will be called to perform the actual API request. `updateEvent` is likely an async function that sends a PUT or PATCH request to your backend.

2. `onMutate`: This function runs before the mutation function is fired. It's used to perform optimistic updates and setup for potential rollbacks:

   - `const newEvent = data.event;`: Extracts the new event data from the mutation parameters.

   - `await queryClient.cancelQueries({ queryKey: ["events", id] });`: Cancels any in-flight queries for this event to prevent them from overwriting our optimistic update.

   - `const previousEvent = queryClient.getQueryData([["events", id]]);`: Retrieves the current data for this event from the cache.

   - `queryClient.setQueryData(["events", id], newEvent);`: Updates the cache with the new event data immediately, before the server responds.

   - `return { previousEvent };`: Returns the previous event data, which will be passed to `onError` if the mutation fails.

3. `onError`: This function runs if the mutation encounters an error:

   - It rolls back the optimistic update by setting the query data back to the previous event.

4. `onSettled`: This function runs after the mutation is either successful or encounters an error:

   - It invalidates the query for this event, which will cause React Query to refetch the latest data from the server, ensuring that the client has the most up-to-date information.

The `mutate` function extracted from `useMutation` is then used in the `handleSubmit` function:

```javascript
function handleSubmit(formData) {
  mutate({ id, event: formData });
  navigate("../");
}
```

When `mutate` is called:

1. The `onMutate` function runs, performing the optimistic update.
2. The `updateEvent` function is called to send the update to the server.
3. If successful, the cache remains updated with the new data.
4. If an error occurs, `onError` runs to roll back the update.
5. Finally, `onSettled` runs to ensure the cache is up-to-date.

This approach provides a smooth user experience by immediately reflecting changes in the UI, while still ensuring data consistency with the backend. If an error occurs, it gracefully rolls back the changes, maintaining data integrity.

---

Explanation:

    onMutate:
            Cancels any ongoing queries for the same event to prevent conflicts.
            Stores the current data as previousEvent.
            Updates the cached data optimistically.
            Returns the previousEvent in the context for potential rollback.


    onError:
            Called if the mutation fails.
            Rolls back to the previous data using the context from onMutate.


    onSettled:
            Called after the mutation, regardless of success or failure.
            Invalidates the query to ensure the frontend has the most up-to-date data from the backend.


            Certainly! I'll explain this EditEvent component step by step:

1. Import statements:
   The component imports necessary hooks from react-router-dom, UI components, and React Query hooks.

2. Component definition:

   ```javascript
   export default function EditEvent() {
   ```

   This defines the EditEvent component.

3. Hooks setup:

   ```javascript
   const navigate = useNavigate();
   const { id } = useParams();
   ```

   - `useNavigate` is used for programmatic navigation.
   - `useParams` extracts the 'id' parameter from the URL.

4. Fetching event data:

   ```javascript
   const { data, isLoading, isError, error } = useQuery({
     queryKey: ["events", id],
     queryFn: ({ signal }) => fetchEvent({ signal, id }),
   });
   ```

   This uses React Query's `useQuery` to fetch event data based on the id.

5. Update mutation setup:

   ```javascript
   const { mutate } = useMutation({
     mutationFn: updateEvent,
     // ... (onMutate, onError, onSettled)
   });
   ```

   This sets up the mutation for updating the event, including optimistic updates.

6. Optimistic update logic:

   - `onMutate`: Cancels ongoing queries, stores the previous event data, and updates the cache optimistically.
   - `onError`: Rolls back to the previous event data if the mutation fails.
   - `onSettled`: Invalidates the query to refetch the latest data after the mutation.

7. Form submission handler:

   ```javascript
   function handleSubmit(formData) {
     mutate({ id, event: formData });
     navigate("../");
   }
   ```

   This triggers the update mutation and navigates back.

8. Close handler:

   ```javascript
   function handleClose() {
     navigate("../");
   }
   ```

   This navigates back when closing the modal.

9. Conditional rendering:
   The component renders different content based on the query state:

   - Loading state: Shows a loading indicator.
   - Error state: Displays an error message.
   - Data loaded: Renders the EventForm with the fetched data.

10. Return statement:
    ```javascript
    return <Modal onClose={handleClose}>{content}</Modal>;
    ```
    The component wraps the conditionally rendered content in a Modal component.

This component demonstrates a complete flow for editing an event:

1. It fetches the existing event data.
2. It provides a form to edit the event.
3. On submission, it updates the event using an optimistic update strategy.
4. It handles loading and error states appropriately.

The use of React Query here provides efficient data fetching, caching, and updating, while the optimistic update approach gives a responsive user experience.

# Summary

    we only use (useQuery ) to (get request) the data
    (useMutation) is a hook designed to handle operations that change data on the server, such as creating, updating, or deleting resources (POST, PUT, PATCH, or DELETE request).
    Unlike (useQuery), which is used for fetching and (get request) (read) the data

# => Install @tanstack/react-query.

# => Create a Query Client and wrap your app with QueryClientProvider.

# => Create a fetch function.

# => Use useQuery to fetch and display data.

# => Use useMutation for data modifications.

# => Integrate components into your main app.

            import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

            const queryClient = new QueryClient();

            ReactDOM.render(
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            )
