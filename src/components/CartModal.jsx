import { useState } from "react";
// import ShoppingApi from "../api/ShoppingApi"; // odkomentiraj, ko implementiraš pravi API

export default function CartModal({
  recipe,
  onClose,
  carts = [],
  onCreateCart,
  onAddToExistingCart,
}) {
  if (!recipe) return null;

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [cartName, setCartName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCreateNewCart() {
    const name =
      cartName.trim() !== ""
        ? cartName
        : `New cart #${Math.floor(Math.random() * 1000)}`;

    // trenutno:mock
    onCreateCart({
      name,
      recipe,
    });

    /*
    // KASNEJE: PRAVI API (ShoppingApi)
    try {
      setLoading(true);

      // POST /cart
      await ShoppingApi.post("/", {
        name,
        recipe_ids: [recipe.recipe_id],
      });

    } catch (err) {
      console.error("Error creating cart:", err);
    } finally {
      setLoading(false);
    }
    */

    onClose();
  }

  function handleAddToExistingCart(cart) {
    // TRENUTNO: MOCK
    onAddToExistingCart(cart.cart_id, recipe);

    /*
    // KASNEJE: PRAVI API (ShoppingApi)
    try {
      setLoading(true);

      const existingIds = cart.recipe_ids || [];

      // PUT /cart/{id}
      await ShoppingApi.put(`/${cart.cart_id}`, {
        recipe_ids: [...existingIds, recipe.recipe_id],
      });

    } catch (err) {
      console.error("Error adding recipe to cart:", err);
    } finally {
      setLoading(false);
    }
    */

    onClose();
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-lg rounded-xl p-4 w-72 z-[60]">

      <h3 className="font-semibold text-lg mb-3">Add to Cart</h3>

      <p className="text-gray-600 mb-4">
        {recipe.recipe_name}
      </p>

      {!showCreateInput ? (
        <button
          onClick={() => {
            setShowCreateInput(true);
            setCartName("");
          }}
          className="w-full bg-blue-500 text-white rounded-lg py-2 mb-3"
        >
          Create new cart
        </button>
      ) : (
        <div className="mb-3 flex flex-col gap-2">
          <input
            type="text"
            placeholder="New cart name"
            className="border rounded-lg px-3 py-2 text-sm"
            value={cartName}
            onChange={(e) => setCartName(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleCreateNewCart}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm disabled:opacity-50"
            >
              Create
            </button>

            <button
              onClick={() => setShowCreateInput(false)}
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-2">Add to existing cart:</p>

      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
        
        {carts.length === 0 && (
          <p className="text-sm text-gray-400">No carts yet.</p>
        )}

        {carts.map((cart) => (
          <button
            key={cart.cart_id}
            onClick={() => handleAddToExistingCart(cart)}
            disabled={loading}
            className="border rounded-lg p-2 hover:bg-gray-100 text-left disabled:opacity-50"
          >
            {cart.name}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="text-red-500 text-sm mt-4 hover:underline"
      >
        Close
      </button>
    </div>
  );
}

