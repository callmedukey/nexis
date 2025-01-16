import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { EventForm } from "../_components/EventForm";

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  // Await the route parameter
  const awaitedParams = await params;
  const { id } = awaitedParams;

  // Handle the "new" route
  if (id === "new") {
    return (
      <main className="min-h-screen bg-lightgray">
        <div className="p-8">
          <div className="rounded-lg bg-white p-4 md:p-8">
            <EventForm />
          </div>
        </div>
      </main>
    );
  }

  const event = await prisma.events.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      thumbnail: true,
    },
  });

  if (!event) {
    redirect("/admin/manage-events");
  }

  return (
    <main className="min-h-screen bg-lightgray">
      <div className="p-8">
        <div className="mx-auto max-w-screen-md rounded-lg bg-white p-4 md:p-8">
          <EventForm initialData={event} />
        </div>
      </div>
    </main>
  );
}
