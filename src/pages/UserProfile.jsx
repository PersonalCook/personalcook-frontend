import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import userApi from "../api/user";
import recipeApi from "../api/recipe";
import socialApi from "../api/social";
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
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [u, r, followersRes, followingRes, myFollowingRes] = await Promise.all([
          userApi.get(`/users/${id}`),
          recipeApi.get(`/recipes/user/${id}`),
          socialApi.get(`/follows/followers/${id}`),
          socialApi.get(`/follows/following/${id}`),
          socialApi.get(`/follows/following/me`),
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
        setFollowersCount((followersRes.data || []).length);
        setFollowingCount((followingRes.data || []).length);

        const myFollowing = myFollowingRes.data || [];
        const amIFollowing = myFollowing.some(
          (f) => String(f.following_id) === String(id)
        );
        setIsFollowing(amIFollowing);
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

  async function toggleFollow() {
    if (!id || followBusy) return;
    setFollowBusy(true);
  
    try {
      if (isFollowing) {
        await socialApi.delete(`/follows/${id}`);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await socialApi.post(`/follows/${id}`);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      // optional: tu lahko pokažeš toast ali setError
    } finally {
      setFollowBusy(false);
    }
  }
  

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
            {user.public_name?.[0] || "?"}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{user.public_name}</h1>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="font-semibold">{recipes.length}</div>
              <div className="text-gray-600">Recipes</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{followingCount}</div>
              <div className="text-gray-600">Following</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{followersCount}</div>
              <div className="text-gray-600">Followers</div>
            </div>
          </div>

          <button
            onClick={toggleFollow}
            disabled={followBusy}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              isFollowing
                ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                : "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
            } ${followBusy ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {followBusy ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
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
