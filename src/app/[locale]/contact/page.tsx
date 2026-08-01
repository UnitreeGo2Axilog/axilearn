import { AuthGate } from "@/components/auth-gate";
import { ContactView } from "@/components/contact-view";

/**
 * Ask your teacher. Was a mailto; is now a real thread, because a reply to an
 * email lands somewhere neither party reliably checks, and a reply here lands
 * in the bell the learner already looks at.
 */
export default function ContactPage() {
  return (
    <AuthGate>
      <ContactView />
    </AuthGate>
  );
}
