import * as React from "react";

export interface PromptInputAttachment {
  id: string;
  filename: string;
  mediaType: string;
  size: number;
  /**
   * Object URL for previewing the file. The PromptInput owns this URL and
   * revokes it when the attachment is removed or when a submit resolves —
   * consumers must not retain `url` past the resolution of their own
   * `onSubmit` callback.
   */
  url: string;
  file: File;
}

export type PromptInputStatus =
  | "ready"
  | "submitted"
  | "streaming"
  | "error";

export interface PromptInputMessage {
  text: string;
  files: PromptInputAttachment[];
}

export interface PromptInputErrorEvent {
  code: "max_files" | "max_file_size" | "accept";
  message: string;
}

export interface PromptInputContextValue {
  text: string;
  setText: (v: string) => void;
  attachments: PromptInputAttachment[];
  addFiles: (files: File[] | FileList) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  openFileDialog: () => void;
  status: PromptInputStatus;
  label: string;
}

export const PromptInputContext =
  React.createContext<PromptInputContextValue | null>(null);

export function usePromptInput(): PromptInputContextValue {
  const ctx = React.useContext(PromptInputContext);
  if (!ctx) {
    throw new Error(
      "PromptInput parts must be used inside <PromptInput.Root>",
    );
  }
  return ctx;
}

export function isGenerating(status: PromptInputStatus): boolean {
  return status === "submitted" || status === "streaming";
}
