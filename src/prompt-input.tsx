import { PromptInputRoot } from "./prompt-input/root";
import { PromptInputBody } from "./prompt-input/body";
import { PromptInputTextarea } from "./prompt-input/textarea";
import {
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
} from "./prompt-input/footer";
import { PromptInputButton } from "./prompt-input/button";
import { PromptInputSubmit } from "./prompt-input/submit";
import {
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
} from "./prompt-input/action-menu";
import { PromptInputAddAttachments } from "./prompt-input/add-attachments";
import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from "./prompt-input/model-select";
import { PromptInputAttachments } from "./prompt-input/attachments";

/**
 * AI-Elements-style prompt composer with auto-grow textarea, attachments
 * (file picker + drag/drop + paste), toolbar buttons, action menus, model
 * selector, and status-aware submit/stop.
 *
 * @example
 * ```tsx
 * import { PromptInput, type PromptInputMessage } from "@benderson-fs/react-cmdk-base";
 *
 * function Composer() {
 *   const handleSubmit = async (msg: PromptInputMessage) => {
 *     await fetch("/api/chat", { method: "POST", body: JSON.stringify(msg) });
 *   };
 *   return (
 *     <PromptInput.Root onSubmit={handleSubmit} multiple>
 *       <PromptInput.Attachments />
 *       <PromptInput.Body>
 *         <PromptInput.Textarea placeholder="Ask anything…" />
 *       </PromptInput.Body>
 *       <PromptInput.Footer>
 *         <PromptInput.Tools />
 *         <PromptInput.Submit />
 *       </PromptInput.Footer>
 *     </PromptInput.Root>
 *   );
 * }
 * ```
 */
export const PromptInput = {
  Root: PromptInputRoot,
  Body: PromptInputBody,
  Textarea: PromptInputTextarea,
  Header: PromptInputHeader,
  Footer: PromptInputFooter,
  Tools: PromptInputTools,
  Button: PromptInputButton,
  Submit: PromptInputSubmit,
  ActionMenu: PromptInputActionMenu,
  ActionMenuTrigger: PromptInputActionMenuTrigger,
  ActionMenuContent: PromptInputActionMenuContent,
  ActionMenuItem: PromptInputActionMenuItem,
  AddAttachments: PromptInputAddAttachments,
  ModelSelect: PromptInputModelSelect,
  ModelSelectTrigger: PromptInputModelSelectTrigger,
  ModelSelectContent: PromptInputModelSelectContent,
  ModelSelectItem: PromptInputModelSelectItem,
  Attachments: PromptInputAttachments,
};
