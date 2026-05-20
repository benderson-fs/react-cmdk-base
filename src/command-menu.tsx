import { CommandMenuRoot } from "./parts/root";
import { CommandMenuInput } from "./parts/input";
import { CommandMenuList } from "./parts/list";
import { CommandMenuPage } from "./parts/page";
import { CommandMenuGroup } from "./parts/group";
import { CommandMenuItem } from "./parts/item";
import { CommandMenuEmpty } from "./parts/empty";
import { CommandMenuFreeSearch } from "./parts/free-search";
import { CommandMenuFooter } from "./parts/footer";
import { CommandMenuKbd } from "./parts/kbd";

/**
 * A `cmd/ctrl+K`-style command palette with drill-down pages, grouped items,
 * and free-search fallback. Built on Base UI Dialog + Combobox.
 *
 * @example
 * ```tsx
 * import { CommandMenu, useCmdkShortcut } from "@benderson-fs/react-cmdk-base";
 *
 * function Palette() {
 *   const [open, setOpen] = React.useState(false);
 *   useCmdkShortcut(setOpen);
 *   return (
 *     <CommandMenu.Root open={open} onOpenChange={setOpen}>
 *       <CommandMenu.Input placeholder="Type…" />
 *       <CommandMenu.List>
 *         <CommandMenu.Page id="root">
 *           <CommandMenu.Item value="home" onSelect={() => {}}>Home</CommandMenu.Item>
 *         </CommandMenu.Page>
 *       </CommandMenu.List>
 *     </CommandMenu.Root>
 *   );
 * }
 * ```
 */
export const CommandMenu = {
  Root: CommandMenuRoot,
  Input: CommandMenuInput,
  List: CommandMenuList,
  Page: CommandMenuPage,
  Group: CommandMenuGroup,
  Item: CommandMenuItem,
  Empty: CommandMenuEmpty,
  FreeSearch: CommandMenuFreeSearch,
  Footer: CommandMenuFooter,
  Kbd: CommandMenuKbd,
};
