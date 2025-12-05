import { FunnelIcon } from "@heroicons/react/24/outline";

export default function FilterSidebar({
  maxTime,
  setMaxTime,
  categories,
  selectedCategories,
  toggleCategory
}) {
  return (
    <aside className="w-72 bg-white border border-gray-200 rounded-3xl shadow-md flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-200">
        <FunnelIcon className="h-5 w-5 text-gray-500" />
        <span className="font-semibold text-gray-700 tracking-tight">FILTER</span>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-5 text-sm text-gray-700 flex flex-col gap-8">
        
        {/* TOTAL TIME */}
        <div>
          <p className="font-semibold mb-2 text-gray-800">Total time</p>

          <input
            type="range"
            min="5"
            max="180"
            value={maxTime}
            onChange={(e) => setMaxTime(Number(e.target.value))}
            className="w-full accent-blue-500"
          />

          <p className="text-gray-500 mt-1">Up to {maxTime} minutes</p>
        </div>

        {/* CATEGORY */}
        <div>
          <p className="font-semibold mb-3 text-gray-800">Category</p>

          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
