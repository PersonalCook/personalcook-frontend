import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import recipeApi from "../api/recipe";

// Components
import RecipeGridMy from "../components/RecipeGridMy";
import SavedRecipes from "../components/SavedRecipes";
import ShoppingCartGrid from "../components/ShoppingCartGrid";

import AddRecipeModal from "../components/AddRecipeModal";
import RecipeDetailModal from "../components/RecipeDetailModal";
import ShoppingCartDetail from "../components/ShoppingCartDetail";
import CartModal from "../components/CartModal";

// Mock data
import { mockRecipes, mockSavedRecipes, mockCarts } from "../mock";


export default function Home() {
  const { user, loading } = useContext(AuthContext);
  if (loading || !user) return <div>Loading...</div>;

  const [activeTab, setActiveTab] = useState("myRecipes");
  const [showModal, setShowModal] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);

  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

  const myRecipes = useMock ? mockRecipes : [];
  const savedRecipesShow = useMock ? mockSavedRecipes : [];
  const shoppingCarts = useMock ? mockCarts : [];

  

  async function handleCreateRecipe(data) {
    try {
      await recipeApi.post("/recipes", data);
    } catch (err) {
      console.error("Error saving recipe", err);
    }
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

  // ✅ CART MODAL HANDLERS
  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  return (
    <div className="px-8 py-6">

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
            {user.public_name[0]}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{user.public_name}</h1>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* -------- CONTENT -------- */}
      <div className="mt-8">

        {/* MY RECIPES */}
        {activeTab === "myRecipes" && (
          <RecipeGridMy
            recipes={myRecipes}
            onAdd={() => setShowModal(true)}
            onOpenRecipe={setSelectedRecipe}
          />
        )}

        {/* SAVED */}
        {activeTab === "saved" && (
          <SavedRecipes
            recipes={savedRecipesShow}
            onOpenRecipe={setSelectedRecipe}
            onOpenCart={openCartModal}   // ✅ ZDAJ PRAVILNO VEZANO
          />
        )}

        {/* SHOPPING CARTS */}
        {activeTab === "carts" && (
          <ShoppingCartGrid
            carts={shoppingCarts}
            onOpenCart={setSelectedCart}
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
        />
      )}

      {showCartModal && (
        <CartModal
          recipe={activeCartRecipe}
          onClose={closeCartModal}
        />
      )}
    </div>
  );
}
