import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import userApi from "../api/user";
import recipeApi from "../api/recipe";
import RecipeGridMy from "../components/RecipeGridMy";
import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";
import {
  normalizeRecipes,
  hydrateAuthors,
  hydrateLikes,
  hydrateSaved,
  hydrateLikeCounts,
} from "../utils/normalizeRecipe";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [u, r] = await Promise.all([
          userApi.get(`/users/${id}`),
          recipeApi.get(`/recipes/user/${id}`),
        ]);
        if (!isMounted) return;

        const normalized = normalizeRecipes(r.data || []);
        const withAuthors = await hydrateAuthors(normalized);
        const withLikes = await hydrateLikes(withAuthors);
        const withSaved = await hydrateSaved(withLikes);
        const withCounts = await hydrateLikeCounts(withSaved);

        setUser(u.data);
        setRecipes(withCounts);
        setLikedRecipes(
          withCounts
            .filter((rec) => rec.isLiked)
            .map((rec) => rec.recipe_id ?? rec.id)
        );
        setSavedRecipes(
          withCounts
            .filter((rec) => rec.isSaved)
            .map((rec) => rec.recipe_id ?? rec.id)
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load profile", err);
        if (isMounted) setError("User not found.");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const getId = (r) => r?.recipe_id ?? r?.id ?? r;

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!user) return <p className="p-6">Loading...</p>;

  function toggleLike(recipeId) {
    const targetId = getId(recipeId);
    if (!targetId) return;
    setLikedRecipes((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
    setRecipes((prev) =>
      prev.map((r) =>
        getId(r) === targetId ? { ...r, isLiked: !r.isLiked } : r
      )
    );
    setSelectedRecipe((prev) =>
      prev && getId(prev) === targetId ? { ...prev, isLiked: !prev.isLiked } : prev
    );
  }

  function toggleSave(recipeId) {
    const targetId = getId(recipeId);
    if (!targetId) return;
    setSavedRecipes((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
    setRecipes((prev) =>
      prev.map((r) =>
        getId(r) === targetId ? { ...r, isSaved: !r.isSaved } : r
      )
    );
    setSelectedRecipe((prev) =>
      prev && getId(prev) === targetId ? { ...prev, isSaved: !prev.isSaved } : prev
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
          {user.public_name?.[0] || "?"}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.public_name}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>

      <RecipeGridMy
        recipes={recipes}
        onOpenRecipe={setSelectedRecipe}
        showAdd={false}
      />

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isLiked={likedRecipes.includes(getId(selectedRecipe))}
          isSaved={savedRecipes.includes(getId(selectedRecipe))}
          onToggleLike={() => toggleLike(getId(selectedRecipe))}
          onToggleSave={() => toggleSave(getId(selectedRecipe))}
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
