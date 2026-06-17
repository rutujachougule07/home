import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import appLocalCss from "../app/app.css?url";
import {
  RootShell,
  RootComponent,
  NotFoundComponent,
  ErrorComponent,
} from "../pages/RootPage";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: appLocalCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: () => {
    const { queryClient } = Route.useRouteContext();
    return <RootComponent queryClient={queryClient} />;
  },
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
