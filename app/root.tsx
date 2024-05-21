import {
  Form,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit
} from "@remix-run/react";
import {Button} from '../@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import "../styles/tailwind.css";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from "./app.css?url";
import { json, redirect } from "@remix-run/node";
import { prisma } from "./db.server";

export const action = async () => {
  const contact = await prisma.contact.create({
    data: {},
  });
  return redirect(`/contacts/${contact.id}/edit`);
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const contacts = await prisma.contact.findMany({
    where: {
      first: {
        contains: q,
      }
    }
  });
  return json({contacts, q})
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button id="searchButton">Search</Button>
              </DialogTrigger>
              <DialogContent className="fixed">
                <div id="sidebar">
                <DialogHeader>
                  <DialogTitle>Search</DialogTitle>
                  <DialogDescription>
                  <Form id="search-form"
                    onChange={(event) => {
                      const isFirstSearch = q === null;
                      submit(event.currentTarget, {
                        replace: !isFirstSearch,
                      });
                    }}
                    role="search"
                  >
                    <input
                      id="q"
                      aria-label="Search contacts"
                      className={searching ? "loading" : ""}
                      defaultValue={q || ""}
                      placeholder="Search"
                      type="search"
                      name="q"
                    />
                  </Form>
                  </DialogDescription>
                </DialogHeader>
                </div>
              </DialogContent>
            </Dialog>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                          ? "pending"
                          : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>

        <div className={
          navigation.state === "loading" ? "loading" : ""
        } id="detail">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
