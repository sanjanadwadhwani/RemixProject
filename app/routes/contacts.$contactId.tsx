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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import Payment from '@prisma/client';

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
] 

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
      const status = formData.get("Status") === "on";
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
        <div>
        <Table className="border-4">
          <TableHeader className="border-2">
            <TableRow>
              <TableHead className = "w-1/4">Date</TableHead>
              <TableHead className = "w-1/4">Payment</TableHead>
              <TableHead className = "w-1/4">Account</TableHead>
              <TableHead className = "w-1/4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((record: { id: React.Key | null | undefined; date: string | number | Date; payment: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; account: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; status: any; }) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{`$${record.payment}`}</TableCell>
                <TableCell>{record.account}</TableCell>
                <TableCell className="text-right">
                  <div className="rounded-full text-white bg-green-600 p-2">
                  {record.status ? 'Pending' : 'Reported'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Payment</Button>
                </DialogTrigger>
                
                <DialogContent id = "sidebar">
                  <DialogHeader >
                    <DialogTitle>Add Payment</DialogTitle>
                  </DialogHeader>
                  
                  <Form method = "post">
                  <p>
                    <input 
                      type="hidden" 
                      name="intent" 
                      value="addPayment" 
                    />
                    <span className = "text-gray-700">Date</span>
                    <input
                      aria-label="Date"
                      defaultValue = ""
                      name="Date"
                      type="date"
                    />
                  </p>
                  <p>
                    <span className = "text-gray-700">Payment</span>
                    <input
                      aria-label="Payment"
                      defaultValue=""
                      name="Payment"
                      placeholder="Payment"
                      type="text"
                    />
                  </p>
                  <p>
                    <span className = "text-gray-700">Account</span>
                    <input
                      aria-label="Account"
                      defaultValue=""
                      name="Account"
                      placeholder="Account"
                      type="text"
                    />
                  </p>
                  <p>
                    <span className = "text-gray-700 p-2">Reported?</span>
                    <input
                      aria-label="Reported?"
                      defaultValue=""
                      name="Account"
                      placeholder="Account"
                      type="checkbox"
                    />
                  </p>
      
                  <button type="submit">Add</button>
          
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
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
      </fetcher.Form>
    </Form>
  );
};
