import type { 
    ActionFunctionArgs,
    LoaderFunctionArgs 
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate} from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "../db.server";

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  if (updates.birthday) {
    updates.birthday = new Date(updates.birthday).toISOString();
  } else {
    delete updates.birthday; 
  }
  await prisma.contact.update({
    where: { id: parseInt(params.contactId) },
    data: updates,
  });
  return redirect(`/contacts/${params.contactId}`);
};

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(params.contactId)
    },
  });

  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ contact });
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span className = "text-gray-700">Name</span>
        <input
          defaultValue= {contact.first} 
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Phone Number</span>
        <input
          aria-label="Phone"
          defaultValue = {(() => {
            if (contact.phone) {
              const formatted = contact.phone.replace(/\D/g, '').match(/^(\d{3})(\d{3})(\d{4})$/);
              if (formatted) {
                return `(${formatted[1]}) ${formatted[2]}-${formatted[3]}`;
              }
              return contact.phone;
            }
          })()}
          name="phone"
          placeholder="000-000-0000"
          type="text"
        />
      </label>
      <label>
        <span>Birthday</span>
        <input
          aria-label="Birthday"
          defaultValue={contact.birthday ? new Date(contact.birthday).toISOString().slice(0, 10) : ''}
          name="birthday"
          type="date"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)}type="button">Cancel</button>
      </p>

      
    </Form>
  );
}
