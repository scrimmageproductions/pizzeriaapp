import { useDynamicWaitTime } from "../../utils/useDynamicWaitTime";

/** Mounted once at the app root (alongside AgentEventHost) so estimatedWaitTime keeps recomputing
 * for the storefront no matter which admin page — or no admin page at all — is currently open. */
export default function WaitTimeSync() {
  useDynamicWaitTime();
  return null;
}
