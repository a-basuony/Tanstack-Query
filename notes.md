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
