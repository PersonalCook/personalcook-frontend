import { useState } from "react";
import RecipeDetailModal from "./RecipeDetailModal";
import CartModal from "./CartModal";

export default function ShoppingCartDetail({ cart, onClose }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  if (!cart) return null;

  function toggleSave(recipeId) {
    setSavedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }
  
  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-xl relative max-h-[90vh] overflow-y-auto flex gap-10">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black transition"
          >
            ×
          </button>

          {/* LEFT SIDE – RECIPES */}
          <div className="w-1/2 flex flex-col">

            <h2 className="text-2xl font-bold mb-6">{cart.name}</h2>

            <h3 className="text-lg font-semibold mb-3">Recipes</h3>

            <div className="flex flex-col divide-y">
              {(cart.recipes || []).map((r) => (
                <div
                  key={r.recipe_id}
                  onClick={() => setSelectedRecipe(r)}   
                  className="flex items-center gap-4 py-3 cursor-pointer 
                             hover:bg-gray-100 transition rounded-lg px-2"
                >
                  <img
                    src={r.img}
                    className="w-14 h-14 object-cover rounded-md"
                    alt={r.recipe_name}
                  />

                  <div className="flex flex-col">
                    <span className="font-medium">{r.recipe_name}</span>
                    <span className="text-sm text-gray-500">
                      View details
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE – SHOPPING LIST */}
          <div className="w-1/2 flex flex-col">

            <h3 className="text-lg font-semibold mb-3">Shopping List</h3>

            <ul className="space-y-2 text-gray-700">
              {(cart.shopping_list || []).map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b pb-1 text-sm"
                >
                  <span>
                    {item.name}
                  </span>
                  <span className="text-gray-500">
                    {(item.amount ?? item.quantity ?? "")} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isLiked={likedRecipes.includes(selectedRecipe.recipe_id)}
          isSaved={savedRecipes.includes(selectedRecipe.recipe_id)}

          onToggleLike={() => toggleLike(selectedRecipe.recipe_id)}
          onToggleSave={() => toggleSave(selectedRecipe.recipe_id)}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}
      {showCartModal && (
          <CartModal
            recipe={activeCartRecipe}
            onClose={closeCartModal}
          />
        )}
    </>
  );
}

  
