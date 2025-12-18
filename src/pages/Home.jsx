import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import recipeApi from "../api/recipe";
import shoppingApi from "../api/shopping";
import socialApi from "../api/social";
import {
  normalizeRecipe,
  normalizeRecipes,
  hydrateAuthors,
  hydrateLikes,
} from "../utils/normalizeRecipe";

// Components
import RecipeGridMy from "../components/RecipeGridMy";
import SavedRecipes from "../components/SavedRecipes";
import ShoppingCartGrid from "../components/ShoppingCartGrid";
import AddRecipeModal from "../components/AddRecipeModal";
import RecipeDetailModal from "../components/RecipeDetailModal";
import ShoppingCartDetail from "../components/ShoppingCartDetail";
import CartModal from "../components/CartModal";

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("myRecipes");
  const [showModal, setShowModal] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  const [recipes, setRecipes] = useState([]);
  const [savedRecipesShow, setSavedRecipesShow] = useState([]);
  const [shoppingCarts, setShoppingCarts] = useState([]);
  const [error, setError] = useState(null);

  const myRecipes = recipes.filter((r) => r.user_id === user?.user_id);

  const hydrateSaved = async (savedList) => {
    if (!savedList?.length) return [];
    const fetched = await Promise.all(
      savedList.map(async (item) => {
        try {
          const res = await recipeApi.get(`/recipes/${item.recipe_id}`);
          return normalizeRecipe(res.data);
        } catch (err) {
          console.error("Failed to fetch saved recipe", item.recipe_id, err);
          return null;
        }
      })
    );
    const filtered = fetched.filter(Boolean);
    const withAuthors = await hydrateAuthors(filtered);
    return hydrateLikes(withAuthors);
  };

  const normalizeShoppingList = (items = []) =>
    items.map((i) => ({
      name: i.name,
      amount: i.amount ?? i.quantity ?? i.qty ?? null,
      unit: i.unit || "",
    }));

  const hydrateCarts = async (carts) => {
    if (!carts?.length) return [];
    return Promise.all(
      carts.map(async (cart) => {
        const recipeIds = cart.recipe_ids || [];
        const recipesDetailed = await Promise.all(
          recipeIds.map(async (id) => {
            try {
              const res = await recipeApi.get(`/recipes/${id}`);
              return normalizeRecipe(res.data);
            } catch (err) {
              console.error("Failed to fetch cart recipe", id, err);
              return null;
            }
          })
        );
        return {
          ...cart,
          recipe_ids: recipeIds,
          recipes: await hydrateLikes(
            await hydrateAuthors(recipesDetailed.filter(Boolean))
          ),
          shopping_list: normalizeShoppingList(
            cart.ingredients || cart.shopping_list || []
          ),
        };
      })
    );
  };


  useEffect(() => {
    if (loading || !user) return;
    async function load() {
      try {
        const [r, c, s] = await Promise.all([
          recipeApi.get("/recipes/"),
          shoppingApi.get("/cart/my"),
          socialApi.get("/saved/my"),
        ]);
        const normalized = await hydrateLikes(
          await hydrateAuthors(normalizeRecipes(r.data))
        );
        setRecipes(normalized);
        setShoppingCarts(await hydrateCarts(c.data));
        setSavedRecipesShow(await hydrateSaved(s.data));
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }
    load();
  }, [loading, user]);

  async function handleCreateRecipe(formData) {
    try {
      await recipeApi.post("/recipes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const r = await recipeApi.get("/recipes/");
      const normalized = await hydrateLikes(
        await hydrateAuthors(normalizeRecipes(r.data || []))
      );
      setRecipes(normalized);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving recipe", err);
    }
  }

  function requestDeleteRecipe(recipe) {
    if (!recipe) return;
    setDeleteTarget(recipe);
  }

  async function confirmDeleteRecipe() {
    if (!deleteTarget || deleteBusy) return;
    const recipeId = deleteTarget?.recipe_id ?? deleteTarget?.id;
    if (!recipeId) return;
    setDeleteBusy(true);
    try {
      await recipeApi.delete(`/recipes/${recipeId}`);
      setRecipes((prev) =>
        prev.filter((r) => (r.recipe_id ?? r.id) !== recipeId)
      );
      setSelectedRecipe((prev) =>
        prev && (prev.recipe_id ?? prev.id) === recipeId ? null : prev
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting recipe", err);
      setError("Failed to delete recipe");
    } finally {
      setDeleteBusy(false);
    }
  }

  function cancelDeleteRecipe() {
    if (deleteBusy) return;
    setDeleteTarget(null);
  }

  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function toggleSave(recipeId) {
    setSavedRecipes(prev =>
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

  function handleCreateCart(cart) {
    if (!cart) return;
    setShoppingCarts((prev) => [cart, ...prev]);
  }

  function handleAddToExistingCart(cartId, recipe) {
    if (!cartId || !recipe) return;
    setShoppingCarts((prev) =>
      prev.map((c) =>
        c.cart_id === cartId
          ? {
              ...c,
              recipe_ids: Array.from(
                new Set([...(c.recipe_ids || []), recipe.recipe_id])
              ),
            }
          : c
      )
    );
  }

  function handleDeleteCart(cart) {
    if (!cart?.cart_id) return;
    setShoppingCarts((prev) =>
      prev.filter((c) => c.cart_id !== cart.cart_id)
    );
    if (selectedCart?.cart_id === cart.cart_id) {
      setSelectedCart(null);
    }
  }

  function handleUpdateCart(nextCart) {
    if (!nextCart?.cart_id) return;
    setShoppingCarts((prev) =>
      prev.map((c) => (c.cart_id === nextCart.cart_id ? { ...c, ...nextCart } : c))
    );
    setSelectedCart((prev) =>
      prev && prev.cart_id === nextCart.cart_id ? { ...prev, ...nextCart } : prev
    );
  }

  if (loading) return <div>Loading...</div>;
  if (!user)
    return (
      <div className="px-8 py-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Please log in to view your home
          </h2>
          <p className="text-gray-600">
            Home, saved recipes, and shopping carts are available after you sign in.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );

  return (
    <div className="px-8 py-6">
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* -------- TABS -------- */}
      <div className="flex gap-6 text-lg font-medium">
        {["myRecipes", "saved", "carts"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "underline underline-offset-4" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "myRecipes" && "My Recipes"}
            {tab === "saved" && "Saved"}
            {tab === "carts" && "Shopping Carts"}
          </button>
        ))}
      </div>

      {/* -------- USER INFO -------- */}
      <div className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-semibold">
            {user.public_name?.[0]}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{user.public_name}</h1>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* -------- CONTENT -------- */}
      <div className="mt-8">
        {activeTab === "myRecipes" && (
          <RecipeGridMy
            recipes={myRecipes}
            onAdd={() => setShowModal(true)}
            onOpenRecipe={setSelectedRecipe}
            onDeleteRecipe={requestDeleteRecipe}
          />
        )}

        {activeTab === "saved" && (
          <SavedRecipes
            recipes={savedRecipesShow}
            onOpenRecipe={setSelectedRecipe}
            onOpenCart={openCartModal}
          />
        )}

        {activeTab === "carts" && (
          <ShoppingCartGrid
            carts={shoppingCarts}
            onOpenCart={setSelectedCart}
            onCreateCart={handleCreateCart}
            onDeleteCart={handleDeleteCart}
          />
        )}
      </div>

      {/* -------- MODALS -------- */}
      {showModal && (
        <AddRecipeModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateRecipe}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          user = {user}
          onClose={() => setSelectedRecipe(null)}
          isLiked={likedRecipes.includes(selectedRecipe.recipe_id)}
          isSaved={savedRecipes.includes(selectedRecipe.recipe_id)}
          onToggleLike={() => toggleLike(selectedRecipe.recipe_id)}
          onToggleSave={() => toggleSave(selectedRecipe.recipe_id)}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}

      {selectedCart && (
        <ShoppingCartDetail
          cart={selectedCart}
          onClose={() => setSelectedCart(null)}
          onUpdateCart={handleUpdateCart}
        />
      )}

      {showCartModal && (
        <CartModal
          recipe={activeCartRecipe}
          onClose={closeCartModal}
          onCreateCart={handleCreateCart}
          onAddToExistingCart={handleAddToExistingCart}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete recipe?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDeleteRecipe}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecipe}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleteBusy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
