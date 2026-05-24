import { SearchInputRoot } from "./search-input/root";
import { SearchInputInput } from "./search-input/input";
import { SearchInputSubmit } from "./search-input/submit";
import { SearchInputTooltip } from "./search-input/tooltip";
import { SearchInputButton } from "./search-input/button";
import {
  SearchInputTools,
  SearchInputToolbar,
} from "./search-input/toolbar";
import {
  SearchInputPicker,
  SearchInputPickerTrigger,
  SearchInputPickerContent,
  SearchInputPickerItem,
  SearchInputPickerGroup,
  SearchInputPickerGroupLabel,
  SearchInputPickerSeparator,
} from "./search-input/picker";
import { SearchInputResults } from "./search-input/results";
import { SearchInputPage } from "./search-input/page";
import { SearchInputItem } from "./search-input/item";
import { SearchInputGroup } from "./search-input/group";
import { SearchInputEmpty } from "./search-input/empty";
import { SearchInputLoading } from "./search-input/loading";
import { SearchInputSeparator } from "./search-input/separator";
import { SearchInputFreeSearch } from "./search-input/free-search";

/**
 * Collapsible single-row search input that combines `PromptInput`'s
 * collapsible controls pattern with `CommandMenu`'s popover results
 * experience. Single line by default; expands on hover/focus to reveal
 * Tools/Toolbar/Submit/Picker. Results appear after the form is
 * submitted (Enter or Submit click), anchored to the input via a
 * Base UI Popover.
 *
 * @example
 * ```tsx
 * import { SearchInput, type SearchInputMessage } from "react-cmdk-base";
 *
 * function Header() {
 *   const handleSubmit = async (msg: SearchInputMessage) => {
 *     const res = await fetch(`/api/search?q=${encodeURIComponent(msg.query)}`);
 *     // consumer surfaces results into Page/Group/Item
 *   };
 *   return (
 *     <SearchInput.Root onSubmit={handleSubmit}>
 *       <SearchInput.Input placeholder="Search…" />
 *       <SearchInput.Submit />
 *       <SearchInput.Results>
 *         <SearchInput.Page id="root">
 *           <SearchInput.Group heading="Docs">
 *             <SearchInput.Item value="useState">useState</SearchInput.Item>
 *           </SearchInput.Group>
 *           <SearchInput.Empty>No results.</SearchInput.Empty>
 *         </SearchInput.Page>
 *       </SearchInput.Results>
 *     </SearchInput.Root>
 *   );
 * }
 * ```
 */
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
  Results: SearchInputResults,
  Page: SearchInputPage,
  Item: SearchInputItem,
  Group: SearchInputGroup,
  Empty: SearchInputEmpty,
  Loading: SearchInputLoading,
  Separator: SearchInputSeparator,
  FreeSearch: SearchInputFreeSearch,
};
