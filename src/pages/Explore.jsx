import { useState, useMemo, useEffect, useContext } from "react";

import RecipeCard from "../components/RecipeCard";
import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";

import searchApi from "../api/search";
import socialApi from "../api/social";
import recipeApi from "../api/recipe";
import {
  normalizeRecipe,
  normalizeRecipes,
  hydrateMissingImages,
  hydrateAuthors,
  hydrateLikes,
  hydrateLikeCounts,
  hydrateSaved
} from "../utils/normalizeRecipe";
import { AuthContext } from "../context/AuthContext";

export default function Explore() {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
  const MIN_QUERY_LEN = 2;

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const trimmed = search.trim();
    const query = trimmed.length >= MIN_QUERY_LEN ? trimmed : "";
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchApi.get("/search/explore", {
          params: {
            q: query || undefined,
            category:
              selectedCategories.length === 1
                ? selectedCategories[0].toLowerCase()
                : undefined,
            max_time: maxTime || undefined,
          },
          signal: controller.signal,
        });
        const data = normalizeRecipes(res.data?.results || res.data || []);
        const withAuthors = await hydrateAuthors(data);
        const baseSocial = await hydrateLikeCounts(withAuthors);
        const withSocial = user
          ? await hydrateSaved(await hydrateLikes(baseSocial))
          : baseSocial.map((r) => ({ ...r, isLiked: false, isSaved: false }));
        const withImages = await hydrateMissingImages(withSocial, async (id) => {
          const detail = await recipeApi.get(`/recipes/${id}`);
          return detail.data;
        });
        if (!isMounted) return;
        setRecipes(withImages);
        setError(null);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
        console.error("Failed to load explore recipes", err);
        if (isMounted) {
          setRecipes([]);
          setError("Failed to load explore recipes");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [search, selectedCategories, maxTime, user]);

  async function toggleLike(recipeId) {
    if (!user) {
      alert("Please log in to like recipes.");
      return;
    }
    const current = recipes.find((r) => r.id === recipeId);
    const currentLikeId = current?.like_id;
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? {
              ...r,
              isLiked: !r.isLiked,
              like_id: r.isLiked ? null : r.like_id,
            }
          : r
      )
    );

    setSelectedRecipe((prev) =>
      prev && prev.id === recipeId
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            like_id: prev.isLiked ? null : prev.like_id,
          }
        : prev
    );

    try {
      if (current?.isLiked && currentLikeId) {
        await socialApi.delete(`/likes/${currentLikeId}`);
      } else {
        const res = await socialApi.post(`/likes/${recipeId}`);
        const newLikeId = res?.data?.like_id ?? res?.data?.id ?? null;
        if (newLikeId) {
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === recipeId ? { ...r, like_id: newLikeId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && prev.id === recipeId ? { ...prev, like_id: newLikeId } : prev
          );
        }
      }
      // Refresh like count from API
      const target =
        recipes.find((r) => r.id === recipeId) ||
        selectedRecipe ||
        current ||
        null;
      if (target) {
        const [withCount] = await hydrateLikeCounts([target]);
        if (withCount) {
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === recipeId ? { ...r, likes: withCount.likes } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && prev.id === recipeId
              ? { ...prev, likes: withCount.likes }
              : prev
          );
        }
      }
    } catch (err) {
      console.error("Like toggle failed", err);
    }
  }

  async function toggleSave(recipeId) {
    if (!user) {
      alert("Please log in to save recipes.");
      return;
    }
    const current = recipes.find((r) => r.id === recipeId);
    const currentSavedId = current?.saved_id;
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? { ...r, isSaved: !r.isSaved, saved_id: r.isSaved ? null : r.saved_id }
          : r
      )
    );

    setSelectedRecipe((prev) =>
      prev && prev.id === recipeId
        ? { ...prev, isSaved: !prev.isSaved, saved_id: prev.isSaved ? null : prev.saved_id }
        : prev
    );

    try {
      if (current?.isSaved && currentSavedId) {
        await socialApi.delete(`/saved/${currentSavedId}`);
      } else {
        const res = await socialApi.post(`/saved/${recipeId}`);
        const newSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        if (newSavedId) {
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === recipeId ? { ...r, saved_id: newSavedId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && prev.id === recipeId ? { ...prev, saved_id: newSavedId } : prev
          );
        }
      }
    } catch (err) {
      console.error("Save toggle failed", err);
    }
  }

  async function postComment(recipeId, text) {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? { ...r, comments: [...r.comments, { author: "You", text }] }
          : r
      )
    );

    setSelectedRecipe((prev) =>
      prev && prev.id === recipeId
        ? { ...prev, comments: [...prev.comments, { author: "You", text }] }
        : prev
    );

    try {
      await socialApi.post(`/comments/${recipeId}`, { text });
    } catch (err) {
      console.error("Post comment failed", err);
    }
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
    // If we already have details, use them; otherwise hydrate from recipe API.
    if (recipe.ingredients?.length && recipe.instructions && recipe.img) {
      setSelectedRecipe(recipe);
      return;
    }

    try {
      const res = await recipeApi.get(`/recipes/${recipe.id}`);
      console.log("Explore detail raw", res.data);
      const base = normalizeRecipe(res.data);
      const [withAuthor] = await hydrateAuthors([base]);
      const enriched = user
        ? await hydrateLikeCounts(await hydrateLikes([withAuthor]))
        : [withAuthor];
      const [withCounts] = enriched;
      console.log("Explore detail hydrated", withCounts);
      setSelectedRecipe(withCounts);
    } catch (err) {
      console.error("Failed to load recipe details", err);
      setSelectedRecipe(recipe);
    }
  }
    const timeToMinutes = (t) => {
    if (t == null) return 999;
    if (typeof t === "number") return t;
    if (typeof t === "string") {
      const [h = 0, m = 0, s = 0] = t.split(":").map(Number);
      return h * 60 + m + Math.floor(s / 60);
    }
    return 999;
  };

  const visibleRecipes = useMemo(() => {
    let filtered = recipes;

    if (selectedCategories.length > 1) {
      const catSet = new Set(selectedCategories.map((c) => c.toLowerCase()));
      filtered = filtered.filter((r) =>
        catSet.has((r.category || "").toLowerCase())
      );
    }

    return filtered;
  }, [recipes, selectedCategories]);


  return (
    <div className="flex gap-6 px-8 py-6">
      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && (
            <div className="col-span-full text-gray-500 text-center py-6">
              Loading recipes...
            </div>
          )}

          {error && (
            <div className="col-span-full text-red-600 text-center py-6">
              {error}
            </div>
          )}

          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              user = {user}
              onOpen={() => openRecipe(recipe)}
              onToggleSave={() => toggleSave(recipe.id)}
              onToggleLike={() => toggleLike(recipe.id)}
              onOpenComments={() => openRecipe(recipe)}
              onOpenCart={() => openCartModal(recipe)}
              isSaved={recipe.isSaved}
              isLiked={recipe.isLiked}
            />
          ))}

          {!loading && !error && visibleRecipes.length === 0 && (
            <div className="col-span-full text-gray-500 text-center py-10">
              No recipes found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <FilterSidebar
        maxTime={maxTime}
        setMaxTime={setMaxTime}
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />
      
      {/* DETAIL MODAL */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          user={user}
          onClose={() => setSelectedRecipe(null)}
          isLiked={selectedRecipe.isLiked}
          isSaved={selectedRecipe.isSaved}
          onToggleLike={() => toggleLike(selectedRecipe.id)}
          onToggleSave={() => toggleSave(selectedRecipe.id)}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <CartModal recipe={activeCartRecipe} onClose={closeCartModal} />
      )}
    </div>
  );
}
