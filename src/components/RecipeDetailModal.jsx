import {
  BookmarkIcon as BookmarkOutline,
  ChatBubbleOvalLeftEllipsisIcon,
  ShoppingCartIcon,
  HeartIcon as HeartOutline
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
//TREBA DODAT API ZA ŠTETJE LAJKOV

export default function RecipeDetailModal({
  recipe,
  onClose,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenCart,
}) {
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex"
        onClick={(e) => {
          e.stopPropagation();
        }}
        
      >
        {/* LEFT PANEL */}
        <div className="flex-1 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="w-full h-80 bg-gray-200 overflow-hidden flex-shrink-0">
            <img
              src={recipe.img}
              alt={recipe.recipe_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 overflow-y-auto">
            <h2 className="text-3xl font-bold mb-3">{recipe.recipe_name}</h2>

            {recipe.description && (
              <p className="text-gray-700 mb-4">{recipe.description}</p>
            )}

            <div className="flex gap-6 mt-2 text-gray-700 text-sm mb-6">
              {recipe.total_time && (
                <p><strong>Total time:</strong> {recipe.total_time}</p>
              )}
              {recipe.servings && (
                <p><strong>Servings:</strong> {recipe.servings}</p>
              )}
            </div>

            {recipe.ingredients?.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc ml-6 text-gray-700">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>
                  ))}
                </ul>
              </>
            )}

            {recipe.instructions && (
              <>
                <h3 className="text-xl font-semibold mt-6 mb-2">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {recipe.instructions}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="w-96 flex flex-col bg-white">

          {/* === TOP — AUTHOR INFO === */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
              {recipe.author_name?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold">{recipe.author_name}</p>
          </div>



          {/* === MIDDLE — COMMENTS (scrollable) === */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {recipe.comments?.length > 0 ? (
              recipe.comments.map((c, i) => (
                <div key={i} className="border-b pb-3">
                  <p className="font-semibold">{c.author}</p>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>

          {/* === BOTTOM — ACTIONS + ADD COMMENT === */}
          <div className="border-t border-gray-200 p-4">
            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-4 mb-2">

              {/* LIKE */}
              {isLiked ? (
                <HeartSolid
                  onClick={onToggleLike}
                  className="h-5 w-5 text-red-500 cursor-pointer transition"
                />
              ) : (
                <HeartOutline
                  onClick={onToggleLike}
                  className="h-5 w-5 text-gray-400 cursor-pointer transition hover:text-red-400"
                />
              )}

              {/* SAVE */}
              {isSaved ? (
                <BookmarkSolid
                  onClick={onToggleSave}
                  className="h-5 w-5 text-blue-500 cursor-pointer transition"
                />
              ) : (
                <BookmarkOutline
                  onClick={onToggleSave}
                  className="h-5 w-5 text-gray-400 cursor-pointer transition hover:text-blue-400"
                />
              )}

              {/* CART */}
              <ShoppingCartIcon
                onClick={onOpenCart}
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              />
            </div>

            {/* LIKES COUNT */}
            <p className="text-sm font-semibold mb-3">
              {recipe.likes || 0} likes
            </p>

            {/* ADD COMMENT INPUT */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button className="text-blue-600 font-semibold">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
