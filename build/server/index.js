import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, redirect, json } from "@remix-run/node";
import { RemixServer, useLoaderData, useNavigation, useSubmit, Meta, Links, Form, NavLink, Outlet, ScrollRestoration, Scripts, useNavigate, useFetcher } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as React from "react";
import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import invariant from "tiny-invariant";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const appStylesHref = "/assets/app-B1MetJ5L.css";
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
global.__prisma.$connect();
const prisma = global.__prisma;
const action$3 = async () => {
  const contact = await prisma.contact.create({
    data: {}
  });
  return redirect(`/contacts/${contact.id}/edit`);
};
const links = () => [
  { rel: "stylesheet", href: appStylesHref }
];
const loader$2 = async ({
  request
}) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const contacts = await prisma.contact.findMany({
    where: {
      first: {
        contains: q
      }
    }
  });
  return json({ contacts, q });
};
function App() {
  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has(
    "q"
  );
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsxs("div", { id: "sidebar", children: [
        /* @__PURE__ */ jsx("h1", { children: "Remix Contacts" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Dialog, { children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { id: "searchButton", children: "Search" }) }),
            /* @__PURE__ */ jsx(DialogContent, { className: "fixed", children: /* @__PURE__ */ jsx("div", { id: "sidebar", children: /* @__PURE__ */ jsxs(DialogHeader, { children: [
              /* @__PURE__ */ jsx(DialogTitle, { children: "Search" }),
              /* @__PURE__ */ jsx(DialogDescription, { children: /* @__PURE__ */ jsx(
                Form,
                {
                  id: "search-form",
                  onChange: (event) => {
                    const isFirstSearch = q === null;
                    submit(event.currentTarget, {
                      replace: !isFirstSearch
                    });
                  },
                  role: "search",
                  children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "q",
                      "aria-label": "Search contacts",
                      className: searching ? "loading" : "",
                      defaultValue: q || "",
                      placeholder: "Search",
                      type: "search",
                      name: "q"
                    }
                  )
                }
              ) })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsx("button", { type: "submit", children: "New" }) })
        ] }),
        /* @__PURE__ */ jsx("nav", { children: contacts.length ? /* @__PURE__ */ jsx("ul", { children: contacts.map((contact) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          NavLink,
          {
            className: ({ isActive, isPending }) => isActive ? "active" : isPending ? "pending" : "",
            to: `contacts/${contact.id}`,
            children: [
              contact.first || contact.last ? /* @__PURE__ */ jsxs(Fragment, { children: [
                contact.first,
                " ",
                contact.last
              ] }) : /* @__PURE__ */ jsx("i", { children: "No Name" }),
              " ",
              contact.favorite ? /* @__PURE__ */ jsx("span", { children: "★" }) : null
            ]
          }
        ) }, contact.id)) }) : /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: "No contacts" }) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: navigation.state === "loading" ? "loading" : "", id: "detail", children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: App,
  links,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({
  params
}) => {
  invariant(params.contactId, "Missing contactId param");
  await prisma.contact.delete({
    where: { id: parseInt(params.contactId) }
  });
  return redirect("/");
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
const action$1 = async ({
  params,
  request
}) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await prisma.contact.update({
    where: { id: parseInt(params.contactId) },
    data: updates
  });
  return redirect(`/contacts/${params.contactId}`);
};
const loader$1 = async ({
  params
}) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(params.contactId)
    }
  });
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};
function EditContact() {
  const { contact } = useLoaderData();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(Form, { id: "contact-form", method: "post", children: [
    /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx("span", { children: "Name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          defaultValue: contact.first,
          "aria-label": "First name",
          name: "first",
          type: "text",
          placeholder: "First"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          "aria-label": "Last name",
          defaultValue: contact.last,
          name: "last",
          placeholder: "Last",
          type: "text"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { children: [
      /* @__PURE__ */ jsx("span", { children: "Twitter" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          defaultValue: contact.twitter,
          name: "twitter",
          placeholder: "@jack",
          type: "text"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { children: [
      /* @__PURE__ */ jsx("span", { children: "Avatar URL" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          "aria-label": "Avatar URL",
          defaultValue: contact.avatar,
          name: "avatar",
          placeholder: "https://example.com/avatar.jpg",
          type: "text"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { children: [
      /* @__PURE__ */ jsx("span", { children: "Notes" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          defaultValue: contact.notes,
          name: "notes",
          rows: 6
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx("button", { type: "submit", children: "Save" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate(-1), type: "button", children: "Cancel" })
    ] })
  ] }, contact.id);
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: EditContact,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({
  params
}) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(params.contactId)
    }
  });
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};
const action = async ({
  params,
  request
}) => {
  invariant(params.contactId, "Missing contactId param");
  await request.formData();
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(params.contactId)
    }
  });
  return prisma.contact.update({
    where: { id: parseInt(params.contactId) },
    data: {
      favorite: !contact.favorite
    }
  });
};
function Contact() {
  const { contact } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { id: "contact", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      "img",
      {
        alt: `${contact.first} ${contact.last} avatar`,
        src: contact.avatar
      },
      contact.avatar
    ) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { children: [
        contact.first || contact.last ? /* @__PURE__ */ jsxs(Fragment, { children: [
          contact.first,
          " ",
          contact.last
        ] }) : /* @__PURE__ */ jsx("i", { children: "No Name" }),
        " ",
        /* @__PURE__ */ jsx(Favorite, { contact })
      ] }),
      contact.twitter ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx(
        "a",
        {
          href: `https://twitter.com/${contact.twitter}`,
          children: contact.twitter
        }
      ) }) : null,
      contact.notes ? /* @__PURE__ */ jsx("p", { children: contact.notes }) : null,
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Form, { action: "edit", children: /* @__PURE__ */ jsx("button", { type: "submit", children: "Edit" }) }),
        /* @__PURE__ */ jsx(
          Form,
          {
            action: "destroy",
            method: "post",
            onSubmit: (event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            },
            children: /* @__PURE__ */ jsx("button", { type: "submit", children: "Delete" })
          }
        )
      ] })
    ] })
  ] });
}
const Favorite = ({ contact }) => {
  const fetcher = useFetcher();
  const favorite = fetcher.formData ? fetcher.formData.get("favorite") === "true" : contact.favorite;
  return /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsx(fetcher.Form, { method: "post", children: /* @__PURE__ */ jsx(
    "button",
    {
      "aria-label": favorite ? "Remove from favorites" : "Add to favorites",
      name: "favorite",
      value: favorite ? "false" : "true",
      children: favorite ? "★" : "☆"
    }
  ) }) });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Contact,
  loader
}, Symbol.toStringTag, { value: "Module" }));
function Index() {
  useState(false);
  return /* @__PURE__ */ jsxs("p", { id: "index-page", children: [
    "This is a demo for Remix.",
    /* @__PURE__ */ jsx("br", {}),
    "Check out",
    " ",
    /* @__PURE__ */ jsx("a", { href: "https://remix.run", children: "the docs at remix.run" }),
    "."
  ] });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BY16OFKY.js", "imports": ["/assets/jsx-runtime-DwnNtzXp.js", "/assets/components-DLOhh7ie.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Q-pW6l5f.js", "imports": ["/assets/jsx-runtime-DwnNtzXp.js", "/assets/components-DLOhh7ie.js"], "css": ["/assets/root-D05UHLAm.css"] }, "routes/contacts.$contactId.destroy": { "id": "routes/contacts.$contactId.destroy", "parentId": "routes/contacts.$contactId", "path": "destroy", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/contacts._contactId.destroy-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/contacts.$contactId_.edit": { "id": "routes/contacts.$contactId_.edit", "parentId": "root", "path": "contacts/:contactId/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/contacts._contactId_.edit-DnYz5yS4.js", "imports": ["/assets/jsx-runtime-DwnNtzXp.js", "/assets/components-DLOhh7ie.js"], "css": [] }, "routes/contacts.$contactId": { "id": "routes/contacts.$contactId", "parentId": "root", "path": "contacts/:contactId", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/contacts._contactId-OdMeJ1Tw.js", "imports": ["/assets/jsx-runtime-DwnNtzXp.js", "/assets/components-DLOhh7ie.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-DfrAMn1d.js", "imports": ["/assets/jsx-runtime-DwnNtzXp.js"], "css": [] } }, "url": "/assets/manifest-c7d58bd5.js", "version": "c7d58bd5" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/contacts.$contactId.destroy": {
    id: "routes/contacts.$contactId.destroy",
    parentId: "routes/contacts.$contactId",
    path: "destroy",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/contacts.$contactId_.edit": {
    id: "routes/contacts.$contactId_.edit",
    parentId: "root",
    path: "contacts/:contactId/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/contacts.$contactId": {
    id: "routes/contacts.$contactId",
    parentId: "root",
    path: "contacts/:contactId",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route4
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
