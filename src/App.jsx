import { QueryClientProvider } from "@tanstack/react-query";
// QueryClient,

import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Events from "./components/Events/Events.jsx";
import EventDetails from "./components/Events/EventDetails.jsx";
import NewEvent from "./components/Events/NewEvent.jsx";
import EditEvent from "./components/Events/EditEvent.jsx";
import { queryClient } from "./utils/fetch.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/events" />,
  },
  {
    path: "/events",
    element: <Events />,

    children: [
      {
        path: "/events/new",
        element: <NewEvent />,
      },
    ],
  },
  {
    path: "/events/:id",
    element: <EventDetails />,
    children: [
      {
        path: "/events/:id/edit",
        element: <EditEvent />,
      },
    ],
  },
]);

// const queryClient = new QueryClient(); instead we import it from fetch.js file that we make it global to use it in several files

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />;
    </QueryClientProvider>
  );
}

export default App;
