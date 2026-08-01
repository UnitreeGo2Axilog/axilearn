import { AuthGate } from "@/components/auth-gate";
import { HomeworkView } from "@/components/homework-view";

export default function HomeworkPage() {
  return (
    <AuthGate>
      <HomeworkView />
    </AuthGate>
  );
}
