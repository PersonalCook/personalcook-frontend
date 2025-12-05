export default function RecipeGridSaved({ recipes, onOpenRecipe }) {
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
  
        {recipes.length === 0 && (
          <div className="col-span-3 text-center text-gray-500">
            You haven't saved any recipes yet.
          </div>
        )}
  
        {recipes.map((r) => (
          <div
            key={r.recipe_id}
            onClick={() => onOpenRecipe(r)}
            className="aspect-square rounded-md overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition"
          >
            <img
              src={r.img}
              alt={r.recipe_name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }
  