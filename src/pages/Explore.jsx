import { useState, useMemo, useEffect } from "react";
import { mockFeedRecipes } from "../mock";

import RecipeCard from "../components/RecipeCard";
import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSideBar";

// import searchApi from "../api/searchApi";
// import socialApi from "../api/socialApi";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  const [recipes, setRecipes] = useState([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };


  useEffect(() => {
    setRecipes(
      mockFeedRecipes.map(r => ({
        ...r,
        id: r.recipe_id,
        total_time: 30,
        category: "Lunch",
        is_liked: false,
        is_saved: false,
        likes: 0,
        comments: []
      }))
    );

    return;

    /* ✅ BACKEND MODE – SAMO ODKOMENTIRAŠ
    async function fetchExplore() {
      const res = await searchApi.get("/search/explore", {
        params: {
          q: search || undefined,
          category: selectedCategories[0] || undefined,
          max_time: maxTime || undefined,
        },
      });

      const data = res.data.results.map(r => ({
        id: r.id,
        ...r.recipe
      }));

      setRecipes(data);
    }

    fetchExplore();
    */
  }, [search, selectedCategories, maxTime]);

  async function toggleLike(recipeId) {
    setRecipes(prev =>
      prev.map(r =>
        r.id === recipeId
          ? {
              ...r,
              is_liked: !r.is_liked,
              likes: r.is_liked ? r.likes - 1 : r.likes + 1
            }
          : r
      )
    );

    setSelectedRecipe(prev =>
      prev && prev.id === recipeId
        ? {
            ...prev,
            is_liked: !prev.is_liked,
            likes: prev.is_liked ? prev.likes - 1 : prev.likes + 1
          }
        : prev
    );

    /* ✅ BACKEND – SAMO ODKOMENTIRAŠ
    if (recipes.find(r => r.id === recipeId)?.is_liked) {
      await socialApi.delete(`/likes/${likeId}`);
    } else {
      await socialApi.post(`/likes/${recipeId}`);
    }
    */
  }

  async function toggleSave(recipeId) {
    setRecipes(prev =>
      prev.map(r =>
        r.id === recipeId
          ? { ...r, is_saved: !r.is_saved }
          : r
      )
    );

    setSelectedRecipe(prev =>
      prev && prev.id === recipeId
        ? { ...prev, is_saved: !prev.is_saved }
        : prev
    );

    /* ✅ BACKEND – SAMO ODKOMENTIRAŠ
    if (recipes.find(r => r.id === recipeId)?.is_saved) {
      await socialApi.delete(`/saved/${savedId}`);
    } else {
      await socialApi.post(`/saved/${recipeId}`);
    }
    */
  }


  async function postComment(recipeId, text) {
    setRecipes(prev =>
      prev.map(r =>
        r.id === recipeId
          ? {
              ...r,
              comments: [...r.comments, { author: "You", text }]
            }
          : r
      )
    );

    setSelectedRecipe(prev =>
      prev && prev.id === recipeId
        ? {
            ...prev,
            comments: [...prev.comments, { author: "You", text }]
          }
        : prev
    );

    /* ✅ BACKEND – SAMO ODKOMENTIRAŠ
    await socialApi.post(`/comments/${recipeId}`, { text });
    */
  }

  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  // =========================
  // ✅ FRONTEND FILTERING (MOCK)
  // =========================
  const visibleRecipes = useMemo(() => {
    let filtered = recipes;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.recipe_name.toLowerCase().includes(q) ||
          r.author_name.toLowerCase().includes(q)
      );
    }

    filtered = filtered.filter(
      r => (r.total_time || 999) <= maxTime
    );

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(r =>
        selectedCategories.includes(r.category)
      );
    }

    return filtered;
  }, [recipes, search, selectedCategories, maxTime]);

  return (
    <div className="flex gap-6 px-8 py-6">

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={() => setSelectedRecipe(recipe)}
              onToggleSave={() => toggleSave(recipe.id)}
              onToggleLike={() => toggleLike(recipe.id)}
              onOpenComments={() => setSelectedRecipe(recipe)}
              onOpenCart={() => openCartModal(recipe)}
              isSaved={recipe.is_saved}
              isLiked={recipe.is_liked}
            />
          ))}

          {visibleRecipes.length === 0 && (
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
          onClose={() => setSelectedRecipe(null)}
          isLiked={selectedRecipe.is_liked}
          isSaved={selectedRecipe.is_saved}
          onToggleLike={() => toggleLike(selectedRecipe.id)}
          onToggleSave={() => toggleSave(selectedRecipe.id)}
          onOpenCart={() => openCartModal(selectedRecipe)}
          onPostComment={(text) => postComment(selectedRecipe.id, text)}
        />
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <CartModal
          recipe={activeCartRecipe}
          onClose={closeCartModal}
        />
      )}

    </div>
  );
}
