import { SearchIcon } from "./icons/SvgIcons";

/**
 * SearchInput — reusable search field with left icon.
 *
 * Props:
 *   value       - controlled input value
 *   onChange    - (e) => void
 *   placeholder - string (default "Rechercher...")
 *   className   - extra classes on the wrapper
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
}) => (
  <div className={`flex flex-row gap-4 items-center ${className}`}>
    <SearchIcon
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      width={24}
      height={24}
      color="currentColor"
    />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full"
      style={{ outline: "none", transition: "border-color 0.15s" }}
      onFocus={(e) => (e.target.style.borderColor = "#dc5539")}
      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
    />
  </div>
);

export default SearchInput;
