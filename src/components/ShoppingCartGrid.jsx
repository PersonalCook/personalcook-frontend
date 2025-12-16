import { useState } from "react";

export default function ShoppingCartGrid({ carts, onOpenCart, onCreateCart }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCartName, setNewCartName] = useState("");

  function handleCreate() {
    const name =
      newCartName.trim() !== ""
        ? newCartName
        : `New cart #${Math.floor(Math.random() * 1000)}`;

    onCreateCart(name);

    setNewCartName("");
    setIsCreating(false);
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
            onClick={handleCreate}
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

            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        );
      })}
    </div>
  );
}
