import { SearchInputRoot } from "./root";
import { SearchInputInput } from "./input";
import { SearchInputSubmit } from "./submit";

export const SearchInput = {
  Root: SearchInputRoot,
  Input: SearchInputInput,
  Submit: SearchInputSubmit,
};

export type { SearchInputRootProps } from "./root";
export type { SearchInputInputProps } from "./input";
export type { SearchInputSubmitProps } from "./submit";
export type {
  SearchInputContextValue,
  SearchInputMessage,
  SearchInputStatus,
} from "./context";
export { useSearchInput } from "./context";
