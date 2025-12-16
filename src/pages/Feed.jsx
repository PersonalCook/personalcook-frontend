import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import searchApi from "../api/search";
import socialApi from "../api/social";
import recipeApi from "../api/recipe";
import {
  normalizeRecipe,
  hydrateMissingImages,
  hydrateAuthors,
  hydrateLikes,
  hydrateLikeCounts,
  hydrateSaved,
} from "../utils/normalizeRecipe";

import {
  ChatBubbleOvalLeftEllipsisIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

  import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
  import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
  import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
  import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";

export default function Feed() {
  const { user, loading } = useContext(AuthContext);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFeed([]);
      setLikedRecipes([]);
      setSavedRecipes([]);
      setError(null);
      return;
    }
    let isMounted = true;
    async function loadFeed() {
      try {
        const res = await searchApi.get("/search/feed");
        const raw = res.data?.results || res.data || [];
        const normalized = raw.map(normalizeRecipe).filter(Boolean);
        const withAuthors = await hydrateAuthors(normalized);
        const withLikes = await hydrateLikes(withAuthors);
        const withSaved = await hydrateSaved(withLikes);
        const withCounts = await hydrateLikeCounts(withSaved);
        const hydrated = await hydrateMissingImages(withCounts, async (id) => {
          const detail = await recipeApi.get(`/recipes/${id}`);
          return detail.data;
        });
        if (!isMounted) return;
        setFeed(hydrated);
        setLikedRecipes(
          hydrated
            .filter((r) => r.isLiked)
            .map((r) => r.id || r.recipe_id)
        );
        setSavedRecipes(
          hydrated
            .filter((r) => r.isSaved || r.is_saved)
            .map((r) => r.id || r.recipe_id)
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load feed", err);
        if (isMounted) setError("Failed to load feed");
      }
    }
    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  const sortedFeed = useMemo(
    () =>
      [...feed].sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      ),
    [feed]
  );

  if (loading) {
    return <div className="px-6 py-6 max-w-xl mx-auto">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="px-6 py-6 max-w-xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Please log in to view your feed
          </h2>
          <p className="text-gray-600">
            The feed is available after you sign in.
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
  }

  function toggleSave(recipeId) {
    const current = feed.find((r) => (r.id || r.recipe_id) === recipeId);
    const currentSavedId = current?.saved_id;
    setFeed((prev) =>
      prev.map((r) =>
        r.id === recipeId || r.recipe_id === recipeId
          ? {
              ...r,
              isSaved: !r.isSaved,
              is_saved: !r.isSaved,
              saved_id: r.isSaved ? null : r.saved_id,
            }
          : r
      )
    );
    setSavedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
    setSelectedRecipe((prev) =>
      prev && (prev.id === recipeId || prev.recipe_id === recipeId)
        ? {
            ...prev,
            isSaved: !prev.isSaved,
            is_saved: !prev.isSaved,
            saved_id: prev.isSaved ? null : prev.saved_id,
          }
        : prev
    );

    (async () => {
      try {
        if (current?.isSaved && currentSavedId) {
          await socialApi.delete(`/saved/${currentSavedId}`);
        } else {
          const res = await socialApi.post(`/saved/${recipeId}`);
          const newSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
          if (newSavedId) {
            setFeed((prev) =>
              prev.map((r) =>
                r.id === recipeId || r.recipe_id === recipeId
                  ? { ...r, saved_id: newSavedId }
                  : r
              )
            );
            setSelectedRecipe((prev) =>
              prev && (prev.id === recipeId || prev.recipe_id === recipeId)
                ? { ...prev, saved_id: newSavedId }
                : prev
            );
          }
        }
      } catch (err) {
        console.error("Save toggle failed", err);
      }
    })();
  }

  function toggleLike(recipeId) {
    const current = feed.find((r) => (r.id || r.recipe_id) === recipeId);
    const currentLikeId = current?.like_id;
    setFeed((prev) =>
      prev.map((r) =>
        r.id === recipeId || r.recipe_id === recipeId
          ? {
              ...r,
              isLiked: !r.isLiked,
              like_id: r.isLiked ? null : r.like_id,
            }
          : r
      )
    );
    setLikedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
    setSelectedRecipe((prev) =>
      prev && (prev.id === recipeId || prev.recipe_id === recipeId)
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            like_id: prev.isLiked ? null : prev.like_id,
          }
        : prev
    );

    (async () => {
      try {
        if (current?.isLiked && currentLikeId) {
          await socialApi.delete(`/likes/${currentLikeId}`);
        } else {
          const res = await socialApi.post(`/likes/${recipeId}`);
          const newLikeId = res?.data?.like_id ?? res?.data?.id ?? null;
          if (newLikeId) {
            setFeed((prev) =>
              prev.map((r) =>
                r.id === recipeId || r.recipe_id === recipeId
                  ? { ...r, like_id: newLikeId }
                  : r
              )
            );
            setSelectedRecipe((prev) =>
              prev && (prev.id === recipeId || prev.recipe_id === recipeId)
                ? { ...prev, like_id: newLikeId }
                : prev
            );
          }
        }
        // refresh like count
        const target =
          feed.find((r) => (r.id || r.recipe_id) === recipeId) ||
          selectedRecipe ||
          current ||
          null;
        if (target) {
          const [withCount] = await hydrateLikeCounts([target]);
          if (withCount) {
            setFeed((prev) =>
              prev.map((r) =>
                r.id === recipeId || r.recipe_id === recipeId
                  ? { ...r, likes: withCount.likes }
                  : r
              )
            );
            setSelectedRecipe((prev) =>
              prev && (prev.id === recipeId || prev.recipe_id === recipeId)
                ? { ...prev, likes: withCount.likes }
                : prev
            );
          }
        }
      } catch (err) {
        console.error("Like toggle failed", err);
      }
    })();
  }

  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  async function openRecipe(recipe) {
    if (recipe.ingredients?.length && recipe.instructions && recipe.img) {
      setSelectedRecipe(recipe);
      return;
    }
    try {
      const res = await recipeApi.get(`/recipes/${recipe.id || recipe.recipe_id}`);
      const base = normalizeRecipe(res.data);
      const [withAuthor] = await hydrateAuthors([base]);
      const [withLikes] = await hydrateLikes([withAuthor]);
      setSelectedRecipe(withLikes);
    } catch (err) {
      console.error("Failed to load recipe details", err);
      setSelectedRecipe(recipe);
    }
  }

  if (error) {
    return (
      <div className="px-6 py-6 max-w-xl mx-auto">
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    );
}

return (
  <div className="px-6 py-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Following</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="flex flex-col gap-8 pb-20">
        {sortedFeed.map((recipe) => (
          <div
            key={recipe.id || recipe.recipe_id}
            className="bg-gray-50 border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
            onClick={() => openRecipe(recipe)}
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                {recipe.authorName?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-800">
                {recipe.authorName}
              </span>
            </div>

            {/* IMAGE */}
            <div className="w-full h-80 overflow-hidden">
              <img
                src={recipe.img}
                className="w-full h-full object-cover"
                alt={recipe.recipe_name}
              />
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg text-gray-800 truncate">
                  {recipe.recipe_name}
                </p>

                {/* ACTION ICONS */}
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {recipe.isSaved ? (
                    <BookmarkSolid
                      onClick={() => toggleSave(recipe.id || recipe.recipe_id)}
                      className="h-5 w-5 text-blue-600 cursor-pointer transition"
                    />
                  ) : (
                    <BookmarkOutline
                      onClick={() => toggleSave(recipe.id || recipe.recipe_id)}
                      className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600 transition"
                    />
                  )}

                  {recipe.isLiked ? (
                    <HeartSolid
                      onClick={() => toggleLike(recipe.id || recipe.recipe_id)}
                      className="h-5 w-5 text-red-500 cursor-pointer transition"
                    />
                  ) : (
                    <HeartOutline
                      onClick={() => toggleLike(recipe.id || recipe.recipe_id)}
                      className="h-5 w-5 text-gray-400 cursor-pointer hover:text-red-400 transition"
                    />
                  )}

                  <ChatBubbleOvalLeftEllipsisIcon
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    onClick={() => openRecipe(recipe)}
                  />
                  <ShoppingCartIcon
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    onClick={() => openCartModal(recipe)}
                  />
                </div>
              </div>

              {/* CAPTION */}
              {recipe.caption && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {recipe.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RECIPE DETAIL MODAL */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isLiked={selectedRecipe.isLiked}
          isSaved={selectedRecipe.isSaved}
          onToggleLike={() => toggleLike(selectedRecipe.id || selectedRecipe.recipe_id)}
          onToggleSave={() => toggleSave(selectedRecipe.id || selectedRecipe.recipe_id)}
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
