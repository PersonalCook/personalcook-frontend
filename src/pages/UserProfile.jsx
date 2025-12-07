import { useParams } from "react-router-dom";
import { mockUsers, mockFeedRecipes } from "../mock";
import { useState } from "react";
import RecipeGridMy from "../components/RecipeGridMy";
import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";

export default function UserProfile() {
  const { id } = useParams();

  const user = mockUsers.find(u => u.user_id === Number(id));
  const userRecipes = mockFeedRecipes.filter(
    r => r.user_id === Number(id)
  );
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);

  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  if (!user) return <p className="p-6">User not found.</p>;

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

  return (
    <div className="p-6">

      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
          {user.public_name[0]}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.public_name}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>


      <RecipeGridMy
        recipes={userRecipes}
        onOpenRecipe={setSelectedRecipe}
        showAdd={false}   
      />

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
    </div>
  );
}
