import type { ActionFunctionArgs,  LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useFetcher} from "@remix-run/react";
import type { FunctionComponent } from "react";
import { prisma } from "../db.server";
import invariant from "tiny-invariant";

import type { ContactRecord } from "../data";
import {Calendar} from '../../@/components/ui/calendar';
import React from "react";

export const loader = async ({
    params,
  }: LoaderFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
      where: {
        id: parseInt(params.contactId),
      },
    });
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};
  
export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(params.contactId),
    },
  });
  return prisma.contact.update({
    where: { id: parseInt(params.contactId) },
    data: {
      favorite: !contact.favorite,
    },
  });
};

export default function Contact() {
  
const { contact } = useLoaderData<typeof loader>();

const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const fetcher = useFetcher();
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <Form method="post">
      <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
      </fetcher.Form>
    </Form>
  );
};
