import type { ActionFunctionArgs,  LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useFetcher} from "@remix-run/react";
import type { FunctionComponent } from "react";
import { prisma } from "../db.server";
import invariant from "tiny-invariant";
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ContactRecord } from "../data";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../@/components/ui/table';
import React from "react";

export const loader = async ({
    params,
  }: LoaderFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
      where: {
        id: parseInt(params.contactId),
      },
      include: { payments: true },
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
  const intent = formData.get("intent");
  if (intent == "addPayment") {
    
      const date = new Date(formData.get("Date") as string);
      const payment = parseFloat(formData.get("Payment") as string);
      const account = parseInt(formData.get("Account") as string);
      const status = formData.get("Status") === "Reported";
      console.log(status);
      return prisma.payment.create({
        data: {
          date,
          payment,
          account,
          status,
          contact: { connect: { id: parseInt(params.contactId) } },
        },
    });
  } else if (intent == "favorite") {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(params.contactId) }
    });
  
    return prisma.contact.update({
      where: { id: parseInt(params.contactId) },
      data: {
        favorite: !contact.favorite,
      },
    });
  }

  
};

export default function Contact() {
  
const { contact } =  useLoaderData<{}>();
const payments = contact.payments || [];
const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div id="contact">
      <div className="flex-none">
        <img 
          className="object-cover w-full h-full"
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

        <p>
          <strong>Phone Number: </strong>
          {contact.phone ? (() => {
            const digits = contact.phone.replace(/\D/g, '');
            const match = digits.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
              return `(${match[1]}) ${match[2]}-${match[3]}`;
            }
            return contact.phone;
          })() : "N/A"}
        </p>

        <p>
          <strong>Birthday: </strong>
          {contact.birthday ? 
            new Date(contact.birthday).toLocaleDateString('en-US', { timeZone: 'UTC' }) :
            "N/A"
          }
        </p>


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
        <div  className="rounded-lg border bg-white border-gray-300 font-sansserif p-1">
        <Table className="text-left min-w-full">
            <div className="px-2">
          <TableHeader >
            <TableRow >
              <TableHead className="brandblue py-3 text-center text-sm font-bold" >Date</TableHead>
              <TableHead className="brandblue py-3 text-center text-sm font-bold" >Payment</TableHead>
              <TableHead className="brandblue py-3 text-center text-sm font-bold">Account</TableHead>
              <TableHead className="brandblue py-3 text-center text-sm font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className = "text-sm text-gray-700">
            {payments.map((record: { id: React.Key | null | undefined; date: string | number | Date; payment: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; account: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; status: any; }) => (
              <TableRow className = "border-b" key={record.id}>
                <TableCell className="py-2 whitespace-nowrap font-medium">{new Date(record.date).toLocaleDateString('en-US', {year:'2-digit', month:'numeric', day:'numeric'})}</TableCell>
                <TableCell className="py-2 whitespace-nowrap font-medium">{`$${record.payment}`}</TableCell>
                <TableCell className="py-1 whitespace-nowrap font-medium">{record.account}</TableCell>
                <TableCell  className="py-2 whitespace-nowrap font-medium">
                  <div className ={`rounded-md text-center px-2 py-1 ${record.status === true ? 'statuscolors' : 'uiyellow'}`}>
                    {record.status ? 'Reported' : 'Pending'}
                  </div>
                </TableCell>  
              </TableRow>
            ))}
          </TableBody>
          </div>
        </Table>
        </div>
        <Dialog >
                <DialogTrigger asChild>
                  <Button>Add Payment</Button>
                </DialogTrigger>
                
                <DialogContent id = "sidebar">
                  <DialogHeader >
                    <DialogTitle>Add Payment</DialogTitle>
                  </DialogHeader>
                  
                  <Form method = "post">
                  <p className = "py-2">
                    <input 
                      type="hidden" 
                      name="intent" 
                      value="addPayment" 
                    />
                    <span className = "text-gray-700 brandblue px-3 text-sm font-bold">Date</span>
                    <input
                      aria-label="Date"
                      defaultValue = ""
                      name="Date"
                      type="date"
                    />
                  </p>
                  <p className = "py-2">                
                    <span className = "text-gray-700 brandblue px-3 text-sm font-bold">Payment</span>
                    <input
                      aria-label="Payment"
                      defaultValue=""
                      name="Payment"
                      placeholder="Payment"
                      type="text"
                    />
                  </p>
                  <p className = "py-2">
                    <span className = "text-gray-700 brandblue px-3 text-sm font-bold">Account</span>
                    <input
                      aria-label="Account"
                      defaultValue=""
                      name="Account"
                      placeholder="Account"
                      type="text"
                    />
                  </p>
                  <p className = "py-2">
                    <span className = "text-gray-700 brandblue px-3 text-sm font-bold">Reported?</span>
                    <input
                      aria-label="Reported?"
                      name="Status"
                      value="Reported"  
                      type="checkbox"
                    />
                  </p>
                  <div className = "p-4 absolute right-0">
                  <button className = "text-lg" type="submit">Add</button>
                  </div>
                  </Form>
                  
                </DialogContent>
  
              </Dialog>
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
        <input 
          type="hidden" 
          name="intent" 
          value="favorite" 
        />
        <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        className = "bg"
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
      </fetcher.Form>
    </Form>
  );
};
