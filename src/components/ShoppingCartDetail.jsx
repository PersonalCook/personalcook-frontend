import { useEffect, useState } from "react";
import RecipeDetailModal from "./RecipeDetailModal";
import CartModal from "./CartModal";
import shoppingApi from "../api/shopping";

export default function ShoppingCartDetail({ cart, onClose, onUpdateCart }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);
  const [cartRecipes, setCartRecipes] = useState([]);
  const [cartRecipeIds, setCartRecipeIds] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  if (!cart) return null;

  const normalizeShoppingList = (items = []) =>
    items.map((i) => ({
      name: i.name,
      amount: i.amount ?? i.quantity ?? i.qty ?? null,
      unit: i.unit || "",
    }));

  const getId = (r) => r?.recipe_id ?? r?.id ?? r;

  useEffect(() => {
    const recipes = cart?.recipes || [];
    const ids =
      cart?.recipe_ids ||
      recipes.map((r) => r?.recipe_id ?? r?.id).filter(Boolean);
    setCartRecipes(recipes);
    setCartRecipeIds(ids || []);
    setShoppingList(
      normalizeShoppingList(cart?.ingredients || cart?.shopping_list || [])
    );
    setRemoveTarget(null);
    setRemoveBusy(false);
  }, [cart]);

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

  function requestRemoveFromCart(recipe, event) {
    event?.stopPropagation();
    if (!recipe || removeBusy) return;
    setRemoveTarget(recipe);
  }

  async function confirmRemoveFromCart() {
    if (!removeTarget || removeBusy) return;
    const recipeId = getId(removeTarget);
    if (!cart?.cart_id || !recipeId) return;
    const updatedIds = (cartRecipeIds || []).filter((id) => id !== recipeId);
    setRemoveBusy(true);
    try {
      const res = await shoppingApi.put(`/cart/${cart.cart_id}`, {
        name: cart.name,
        recipe_ids: updatedIds,
      });
      const nextCart = res?.data || {};
      const nextRecipes = (cartRecipes || []).filter(
        (r) => getId(r) !== recipeId
      );
      const nextList = normalizeShoppingList(
        nextCart.ingredients || nextCart.shopping_list || shoppingList
      );
      setCartRecipeIds(updatedIds);
      setCartRecipes(nextRecipes);
      setShoppingList(nextList);
      setSelectedRecipe((prev) =>
        prev && getId(prev) === recipeId ? null : prev
      );
      onUpdateCart?.({
        ...cart,
        recipe_ids: updatedIds,
        recipes: nextRecipes,
        shopping_list: nextList,
      });
      setRemoveTarget(null);
    } catch (err) {
      console.error("Failed to remove recipe from cart", err);
    } finally {
      setRemoveBusy(false);
    }
  }

  function cancelRemoveFromCart() {
    if (removeBusy) return;
    setRemoveTarget(null);
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
              {cartRecipes.map((r) => (
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

                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div className="flex flex-col">
                    <span className="font-medium">{r.recipe_name}</span>
                    <span className="text-sm text-gray-500">
                      View details
                  </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => requestRemoveFromCart(r, e)}
                      disabled={removeBusy}
                      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                      aria-label="Remove from cart"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE – SHOPPING LIST */}
          <div className="w-1/2 flex flex-col">

            <h3 className="text-lg font-semibold mb-3">Shopping List</h3>

            <ul className="space-y-2 text-gray-700">
              {shoppingList.map((item, idx) => (
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

      {removeTarget && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove recipe?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will remove it from the cart.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelRemoveFromCart}
                disabled={removeBusy}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveFromCart}
                disabled={removeBusy}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {removeBusy ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

  
