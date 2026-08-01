import { AuthGate } from "@/components/auth-gate";
import { DiscussionView } from "@/components/discussion-view";

/**
 * The one public space on the platform. Signed-in only -- there is no reading
 * it from outside, which keeps a room full of teenagers off the open web.
 */
export default function DiscussionPage() {
  return (
    <AuthGate>
      <DiscussionView />
    </AuthGate>
  );
}
