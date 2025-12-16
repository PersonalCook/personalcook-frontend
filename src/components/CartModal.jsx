import { useEffect, useState } from "react";
import shoppingApi from "../api/shopping";

export default function CartModal({
  recipe,
  onClose,
  onCreateCart,
  onAddToExistingCart,
}) {
  if (!recipe) return null;

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [cartName, setCartName] = useState("");
  const [loadingCarts, setLoadingCarts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [carts, setCarts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  function closeWithDelay() {
    // Give the success message a brief moment to show
    setTimeout(() => {
      onClose?.();
    }, 800);
  }

  useEffect(() => {
    let active = true;

    async function fetchCarts() {
      setLoadingCarts(true);
      try {
        const res = await shoppingApi.get("/cart/my");
        if (!active) return;
        setCarts(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Error loading carts:", err);
        if (active) setError("Failed to load your carts.");
      } finally {
        if (active) setLoadingCarts(false);
      }
    }

    fetchCarts();
    return () => {
      active = false;
    };
  }, [recipe?.recipe_id]);

  async function handleCreateNewCart() {
    const name =
      cartName.trim() !== ""
        ? cartName
        : `New cart #${carts.length + 1}`;

    try {
      setSubmitting(true);

      const res = await shoppingApi.post("/cart", {
        name,
        recipe_ids: [recipe.recipe_id],
      });

      const createdCart = res?.data ?? { name, recipe_ids: [recipe.recipe_id] };
      setCarts((prev) => [createdCart, ...prev]);
      onCreateCart?.(createdCart);
      onAddToExistingCart?.(createdCart.cart_id, recipe);
      setSuccess("Added to cart!");
      setTimeout(() => setSuccess(""), 5000);
      closeWithDelay();
    } catch (err) {
      console.error("Error creating cart:", err);
      setError("Failed to create cart.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddToExistingCart(cart) {
    if (!cart || !recipe) return;

    const existingIds = cart.recipe_ids || [];
    const updatedIds = Array.from(new Set([...existingIds, recipe.recipe_id]));
    
    //checks for duplicates
    if (existingIds.includes(recipe.recipe_id)) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      const res = await shoppingApi.put(`/cart/${cart.cart_id}`, {
        recipe_ids: updatedIds,
      });

      const updatedCart = res?.data ?? { ...cart, recipe_ids: updatedIds };
      setCarts((prev) =>
        prev.map((c) => (c.cart_id === cart.cart_id ? updatedCart : c))
      );

      onAddToExistingCart?.(cart.cart_id, recipe);
      setSuccess("Added to cart!");
      setTimeout(() => setSuccess(""), 5000);
      closeWithDelay();
    } catch (err) {
      console.error("Error adding recipe to cart:", err);
      setError("Failed to add recipe to cart.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-lg rounded-xl p-4 w-72 z-[60]">
      <h3 className="font-semibold text-lg mb-3">Add to Cart</h3>

      {success && <p className="text-sm text-green-600 mb-2">{success}</p>}
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      <p className="text-gray-600 mb-4">{recipe.recipe_name}</p>

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
              disabled={submitting}
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
        {loadingCarts && (
          <p className="text-sm text-gray-400">Loading carts...</p>
        )}

        {!loadingCarts && carts.length === 0 && (
          <p className="text-sm text-gray-400">No carts yet.</p>
        )}

        {carts.map((cart) => (
          <button
            key={cart.cart_id}
            onClick={() => handleAddToExistingCart(cart)}
            disabled={submitting}
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
