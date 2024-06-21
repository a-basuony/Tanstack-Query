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

# 4-

# Summary

# => Install @tanstack/react-query.

# => Create a Query Client and wrap your app with QueryClientProvider.

# => Create a fetch function.

# => Use useQuery to fetch and display data.

# => Use useMutation for data modifications.

# => Integrate components into your main app.
