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
import { SearchInputResultsInline } from "./search-input/results-inline";
import { SearchInputResultsModal } from "./search-input/results-modal";
import { SearchInputResultsShell } from "./search-input/combobox-shell";
import { SearchInputPage } from "./search-input/page";
import { SearchInputItem } from "./search-input/item";
import { SearchInputGroup } from "./search-input/group";
import { SearchInputEmpty } from "./search-input/empty";
import { SearchInputLoading } from "./search-input/loading";
import { SearchInputSeparator } from "./search-input/separator";
import { SearchInputFreeSearch } from "./search-input/free-search";
import { CommandCoreItemLabel } from "./internal/command-core";

/**
 * Collapsible single-row search input that combines `PromptInput`'s
 * collapsible controls pattern with `CommandMenu`'s anchored results
 * experience. Single line by default; expands on hover/focus to reveal
 * Tools/Toolbar/Submit/Picker.
 *
 * **v0.12 (default `mode="live"`):** filters as you type. Enter on a
 * highlighted item writes the item's label into the input and sets
 * `selectedValue`. Submit (button / Enter when nothing highlighted)
 * fires `onSubmit({ query, scope, selectedValue })`. Choose
 * `<SearchInput.ResultsInline>` for an anchored panel without a backdrop
 * (page stays interactive) or `<SearchInput.ResultsModal>` for the same
 * panel position with a dimmed backdrop. The modal variant runs
 * Combobox in modal mode, which aria-hides + inerts everything outside
 * the popup (including the form's Submit) until the panel is dismissed.
 * The input retains real DOM focus in both variants
 * (aria-activedescendant on the listbox).
 *
 * **`mode="submit"`:** preserves the 0.11.x submit-only filter model —
 * popup mounts only after a successful submit.
 *
 * @example
 * ```tsx
 * import { SearchInput, type SearchInputMessage } from "react-cmdk-base";
 *
 * function Header() {
 *   const handleSubmit = async (msg: SearchInputMessage) => {
 *     // msg = { query, scope, selectedValue }
 *     await enrich(msg);
 *   };
 *   return (
 *     <SearchInput.Root onSubmit={handleSubmit}>
 *       <SearchInput.Input placeholder="Search…" />
 *       <SearchInput.Submit />
 *       <SearchInput.ResultsInline>
 *         <SearchInput.Page id="root">
 *           <SearchInput.Group heading="Docs">
 *             <SearchInput.Item value="useState">
 *               <SearchInput.ItemLabel>useState</SearchInput.ItemLabel>
 *             </SearchInput.Item>
 *           </SearchInput.Group>
 *           <SearchInput.Empty>No results.</SearchInput.Empty>
 *         </SearchInput.Page>
 *       </SearchInput.ResultsInline>
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
