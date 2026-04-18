import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "./EventForm";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/events/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Add an event
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Published listings are visible straight away. Keep details accurate and include
        how people can join or register.
      </p>
      <div className="mt-8">
        <EventForm />
      </div>
    </div>
  );
}
