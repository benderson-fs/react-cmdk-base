import { SearchInputRoot } from "./root";
import { SearchInputInput } from "./input";

export const SearchInput = {
  Root: SearchInputRoot,
  Input: SearchInputInput,
};

export type { SearchInputRootProps } from "./root";
export type { SearchInputInputProps } from "./input";
export type {
  SearchInputContextValue,
  SearchInputMessage,
  SearchInputStatus,
} from "./context";
export { useSearchInput } from "./context";
