import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";  

export default function SearchBar({ search, setSearch }) {
    return (<div className="flex gap-4 items-center">
          <div className="flex-1">
            <div
              className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm hover:shadow-md transition cursor-text"
              onClick={() =>
                document.getElementById("exploreSearchInput")?.focus()
              }
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                id="exploreSearchInput"
                type="text"
                placeholder="Search recipes…"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>)
}