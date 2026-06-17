import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import {
  RootComponent,
  NotFoundComponent,
  ErrorComponent,
} from "../pages/RootPage";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => {
    const { queryClient } = Route.useRouteContext();
    return <RootComponent queryClient={queryClient} />;
  },
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
