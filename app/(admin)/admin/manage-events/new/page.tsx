import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { EventForm } from "../_components/EventForm";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-screen ">
      <div className="p-8">
        <div className="mx-auto max-w-screen-md rounded-lg bg-white p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">새 이벤트 작성</h1>
            <p className="text-sm text-muted-foreground">
              새로운 이벤트를 작성합니다
            </p>
          </div>
          <EventForm />
        </div>
      </div>
    </main>
  );
}
