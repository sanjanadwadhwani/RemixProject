

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
  useSubmit,
  useNavigate
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
} from "@/components/ui/dialog";
import "../styles/tailwind.css";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from "./app.css?url";
import { json, redirect } from "@remix-run/node";
import { prisma } from "./db.server";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../@/components/ui/popover";
import { cn } from '../@/libs/util';
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
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const navigate = useNavigate();
  const selectedContact = contacts.find(contact => `${contact.first} ${contact.last}` === value);
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
      <body className = "bg">
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className = "font-sansserif text-lg" id="searchButton">Search</Button>
                </DialogTrigger>

                <DialogContent className="absolute left-0 inset-0">
                <div id = "sidebar" className="h-full">
                  <DialogHeader >
                    <DialogTitle className = "text-center">Search</DialogTitle>
                    <DialogDescription>

                    
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-4">
                  <Popover open={open} onOpenChange={setOpen} >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="flex justify-between items-center bg font-sansserif text-lg w-full px-4 py-2 rounded shadow"
                    >
                      {selectedContact ? `${selectedContact.first} ${selectedContact.last}` : "Select contact..."}
                      <ChevronsUpDown />
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent className = "bg">
                      <div className="flex flex-col">
                      <Command>
                        <CommandInput placeholder="Search contacts..."/>
                        <CommandEmpty>No contat found.</CommandEmpty>
                        <CommandList>
                        <CommandGroup className = "text-gray-700 ">
                          {contacts.map((contact) => (
                            <CommandItem className="py-2 whitespace-nowrap font-medium border-b"
                              key={contact.id}
                              value= {`${contact.first} ${contact.last}`}
                              onSelect={(currentValue) => {
                                setValue(currentValue === value ? "" : currentValue);
                                const selectedContact = contacts.find(contact => `${contact.first} ${contact.last}` === currentValue);
                                if (selectedContact) {
                                  navigate(`/contacts/${selectedContact.id}`);
                                }
                              }}
                            >
                              {contact.first} {contact.last}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        </CommandList>
                      </Command>
                      </div>
                    </PopoverContent>
                  </Popover>
                  </div>
                  <DialogClose className="absolute left-0">
                    <p>X</p>
                    </DialogClose>
                  </div>
                </DialogContent>
  
              </Dialog>
              <Form method="post">
                <button className = "font-sansserif text-lg" type="submit">New</button>
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