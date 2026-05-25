import { SearchInputRoot } from "./root";
import { SearchInputInput } from "./input";
import { SearchInputSubmit } from "./submit";
import { SearchInputTooltip } from "./tooltip";
import { SearchInputButton } from "./button";
import { SearchInputTools, SearchInputToolbar } from "./toolbar";
import {
  SearchInputPicker,
  SearchInputPickerTrigger,
  SearchInputPickerContent,
  SearchInputPickerItem,
  SearchInputPickerGroup,
  SearchInputPickerGroupLabel,
  SearchInputPickerSeparator,
} from "./picker";
import { SearchInputResultsInline } from "./results-inline";
import { SearchInputResultsModal } from "./results-modal";
import { SearchInputResultsShell } from "./combobox-shell";
import { SearchInputPage } from "./page";
import { SearchInputItem } from "./item";
import { SearchInputGroup } from "./group";
import { SearchInputEmpty } from "./empty";
import { SearchInputLoading } from "./loading";
import { SearchInputSeparator } from "./separator";
import { SearchInputFreeSearch } from "./free-search";
import { CommandCoreItemLabel } from "../internal/command-core";

export const SearchInput = {
  Root: SearchInputRoot,
  Input: SearchInputInput,
  Submit: SearchInputSubmit,
  Tooltip: SearchInputTooltip,
  Button: SearchInputButton,
  Tools: SearchInputTools,
  Toolbar: SearchInputToolbar,
  Picker: SearchInputPicker,
  PickerTrigger: SearchInputPickerTrigger,
  PickerContent: SearchInputPickerContent,
  PickerItem: SearchInputPickerItem,
  PickerGroup: SearchInputPickerGroup,
  PickerGroupLabel: SearchInputPickerGroupLabel,
  PickerSeparator: SearchInputPickerSeparator,
  ResultsInline: SearchInputResultsInline,
  ResultsModal: SearchInputResultsModal,
  ResultsShell: SearchInputResultsShell,
  Page: SearchInputPage,
  Item: SearchInputItem,
  ItemLabel: CommandCoreItemLabel,
  Group: SearchInputGroup,
  Empty: SearchInputEmpty,
  Loading: SearchInputLoading,
  Separator: SearchInputSeparator,
  FreeSearch: SearchInputFreeSearch,
};

export type { SearchInputRootProps } from "./root";
export type { SearchInputInputProps } from "./input";
export type { SearchInputSubmitProps } from "./submit";
export type { SearchInputTooltipProps } from "./tooltip";
export type {
  SearchInputButtonProps,
  SearchInputButtonVariant,
} from "./button";
export type {
  SearchInputToolsProps,
  SearchInputToolbarProps,
} from "./toolbar";
export type {
  SearchInputPickerProps,
  SearchInputPickerTriggerProps,
  SearchInputPickerContentProps,
  SearchInputPickerItemProps,
  SearchInputPickerGroupProps,
  SearchInputPickerGroupLabelProps,
  SearchInputPickerSeparatorProps,
} from "./picker";
export type { SearchInputResultsInlineProps } from "./results-inline";
export type { SearchInputResultsModalProps } from "./results-modal";
export type { SearchInputResultsShellProps } from "./combobox-shell";
export type { SearchInputPageProps } from "./page";
export type { SearchInputItemProps } from "./item";
export type { SearchInputGroupProps } from "./group";
export type { SearchInputEmptyProps } from "./empty";
export type { SearchInputLoadingProps } from "./loading";
export type { SearchInputSeparatorProps } from "./separator";
export type { SearchInputFreeSearchProps } from "./free-search";
export type {
  SearchInputContextValue,
  SearchInputMessage,
  SearchInputMode,
  SearchInputStatus,
} from "./context";
export { useSearchInput } from "./context";

export {
  CommandCoreItemLabel as SearchInputItemLabel,
  type CommandCoreItemLabelProps as SearchInputItemLabelProps,
} from "../internal/command-core";
