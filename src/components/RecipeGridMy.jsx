
export default function RecipeGridMy({ 
  recipes, 
  onAdd, 
  onOpenRecipe, 
  showAdd = true 
}) {

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">

      {/* Če ni receptov → samo + tile (SAMO ČE showAdd === true) */}
      {recipes.length === 0 && showAdd && (
        <button
          onClick={onAdd}
          className="aspect-square w-full rounded-lg bg-gray-200 flex items-center justify-center 
                     text-5xl text-gray-600 hover:bg-gray-300 transition"
        >
          +
        </button>
      )}

      {/* Prikaz receptov*/}
      {recipes.map((r) => (
        <div
          key={r.recipe_id}
          onClick={() => onOpenRecipe(r)}
          className="relative group cursor-pointer"
        >
          <div className="aspect-square w-full rounded-md overflow-hidden shadow-sm">
            <img
              src={r.img || r.image_url} 
              alt={r.recipe_name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>

          {/* DARK OVERLAY ON HOVER */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition 
                          flex items-center justify-center text-white text-lg font-semibold">
            View
          </div>
        </div>
      ))}

      {/* + tile na koncu (SPET SAMO ČE showAdd === true) */}
      {recipes.length > 0 && showAdd && (
        <button
          onClick={onAdd}
          className="aspect-square w-full rounded-lg bg-gray-200 flex items-center justify-center 
                     text-5xl text-gray-600 hover:bg-gray-300 transition"
        >
          +
        </button>
      )}
    </div>
  );
}
