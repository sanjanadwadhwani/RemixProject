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
  DialogClose,
} from "@/components/ui/dialog"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../@/components/ui/popover"
 
import { cn } from '../@/libs/util';
import "../styles/tailwind.css";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from "./app.css?url";
import { json, redirect } from "@remix-run/node";
import { prisma } from "./db.server";
import React from "react";

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

    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [searchResults, setSearchResults] = React.useState(contacts);
  

  
    React.useEffect(() => {
      setSearchResults(contacts);
    }, [contacts]);


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
                <DialogContent className="relative">
                  <div id = "sidebar">
                  <DialogHeader >
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

                    
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                          >
                            {value
                              ? contacts.find((contact) => contact.first === value)?.first
                              : "Select contact..."}
                            <ChevronsUpDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Command>
                            <CommandInput placeholder="Search contact..." />
                            <CommandEmpty>No contact found.</CommandEmpty>
                            <CommandGroup>
                  
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
