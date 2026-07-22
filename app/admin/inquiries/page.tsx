import { adminListInquiries } from "@/app/actions/admin";
import { InquiriesTable } from "@/components/admin/inquiries-table";

export default async function AdminInquiries() {
  const data = await adminListInquiries();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tighter text-ink">Inquiries</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Everything sent from the catalog&apos;s Send Inquiry button, newest first.
      </p>
      <div className="mt-6">
        <InquiriesTable initialData={data} />
      </div>
    </div>
  );
}
