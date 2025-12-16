import { useState } from "react";
import shoppingApi from "../api/shopping";

export default function ShoppingCartGrid({ carts, onOpenCart, onCreateCart, onDeleteCart }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleCreateNewCart() {
    const name =
      newCartName.trim() !== ""
        ? newCartName
        : `New cart #${carts.length + 1}`;

    try {
      setSubmitting(true);

      const res = await shoppingApi.post("/cart", {
        name,
        recipe_ids: [],
      });

      const createdCart = res?.data ?? { name, recipe_ids: [] };
      onCreateCart?.(createdCart);
      setIsCreating(false);
      setNewCartName("");
      setError(null);
    } catch (err) {
      console.error("Error creating cart:", err);
      setError("Failed to create cart.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCart(cart) {
    if (!cart?.cart_id) return;
    try {
      setDeletingId(cart.cart_id);

      await shoppingApi.delete(`/cart/${cart.cart_id}`);

      onDeleteCart?.(cart);
      setError(null);
    } catch (err) {
      console.error("Error deleting cart:", err);
      setError("Failed to delete cart.");
    } finally {
      setDeletingId(null);
    }
  }
  return (
    <div className="mt-6 space-y-2">

      {/* CREATE NEW CART TILE */}
      {!isCreating ? (
        <div
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center px-5 py-3 
                     border-2 border-dashed border-gray-300 
                     rounded-full cursor-pointer hover:bg-gray-100 transition text-gray-500"
        >
          + Create new cart
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 
                        bg-gray-100 rounded-full">
          <input
            type="text"
            placeholder="Cart name"
            value={newCartName}
            onChange={(e) => setNewCartName(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            autoFocus
          />

          <button
            onClick={handleCreateNewCart}
            disabled={submitting}
            className="text-sm text-blue-600 font-semibold"
          >
            Create
          </button>

          <button
            onClick={() => {
              setIsCreating(false);
              setNewCartName("");
            }}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 px-1">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {carts.length === 0 && !isCreating && (
        <div className="text-gray-400 text-center py-10">
          You don't have any shopping carts yet.
        </div>
      )}

      {/* CART LIST */}
      {carts.map((cart) => {
        const recipeCount =
          (cart.recipes && cart.recipes.length) ||
          (cart.recipe_ids && cart.recipe_ids.length) ||
          (cart.shopping_list && cart.shopping_list.length) ||
          0;
        return (
          <div
            key={cart.cart_id}
            onClick={() => onOpenCart(cart)}
            className="flex justify-between items-center px-5 py-3 
                       bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition"
          >
            <div>
              <h2 className="font-semibold">{cart.name}</h2>
              <p className="text-sm text-gray-500">
                {recipeCount} recipes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCart(cart);
                }}
                disabled={deletingId === cart.cart_id}
                className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
              >
                {deletingId === cart.cart_id ? "..." : "X"}
              </button>

              <span className="text-gray-400 text-lg">{">"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
