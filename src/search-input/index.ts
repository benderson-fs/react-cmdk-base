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
export type {
  SearchInputContextValue,
  SearchInputMessage,
  SearchInputStatus,
} from "./context";
export { useSearchInput } from "./context";
