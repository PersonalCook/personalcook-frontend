import { useState, useMemo, useContext, useEffect } from "react";
import SearchBar from "./SearchBar";
import FilterSidebar from "./FilterSidebar";
import RecipeCard from "./RecipeCard";
import CartModal from "./CartModal";
import RecipeDetailModal from "./RecipeDetailModal";
import socialApi from "../api/social";
import { AuthContext } from "../context/AuthContext";
import {
  hydrateLikeCounts,
  hydrateLikes,
  hydrateSaved,
} from "../utils/normalizeRecipe";


export default function SavedRecipes({ recipes }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState(recipes || []);

  // SEARCH + FILTERING
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  // CART MODAL
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  // DETAIL MODAL
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // -------------------------
  const getId = (r) => {
    if (r == null) return null;
    if (typeof r === "object") return r.id ?? r.recipe_id;
    return r;
  };

  useEffect(() => {
    let active = true;
    const base = recipes || [];
    setItems(base);

    if (!user || base.length === 0) return;

    (async () => {
      try {
        const withLikes = await hydrateLikes(base);
        const withSaved = await hydrateSaved(withLikes);
        const withCounts = await hydrateLikeCounts(withSaved);
        if (active) setItems(withCounts);
      } catch (err) {
        console.error("SavedRecipes: failed to sync likes/saves", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [recipes, user]);

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function timeToMinutes(t) {
    if (!t) return 999;
    if (typeof t === "number") return t;
    if (typeof t === "string") {
      const [h = 0, m = 0, s = 0] = t.split(":").map(Number);
      return h * 60 + m + Math.floor(s / 60);
    }
    return 999;
  }

  const filteredRecipes = useMemo(() => {
    let list = items || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.recipe_name || r.name || "").toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter(r => selectedCategories.includes(r.category));
    }

    list = list.filter(r => timeToMinutes(r.total_time) <= maxTime);

    return list;
  }, [search, maxTime, selectedCategories, items]);

  async function toggleLike(recipeId) {
    if (!user) {
      alert("Please log in to like recipes.");
      return;
    }
    const targetId = getId(recipeId);
    if (!targetId) return;
    const current = items.find((r) => getId(r) === targetId);
    if (!current) return;
    const currentLikeId = current?.like_id;
    setItems((prev) =>
      prev.map((r) =>
        getId(r) === targetId
          ? {
              ...r,
              isLiked: !r.isLiked,
              like_id: r.isLiked ? null : r.like_id,
            }
          : r
      )
    );
    setSelectedRecipe((prev) =>
      prev && getId(prev) === targetId
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
        const res = await socialApi.post(`/likes/${targetId}`);
        const newLikeId = res?.data?.like_id ?? res?.data?.id ?? null;
        if (newLikeId) {
          setItems((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, like_id: newLikeId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId
              ? { ...prev, like_id: newLikeId }
              : prev
          );
        }
      }

      const target =
        items.find((r) => getId(r) === targetId) ||
        selectedRecipe ||
        current ||
        null;
      if (target) {
        const [withCount] = await hydrateLikeCounts([target]);
        if (withCount) {
          setItems((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, likes: withCount.likes } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId
              ? { ...prev, likes: withCount.likes }
              : prev
          );
        }
      }
    } catch (err) {
      console.error("SavedRecipes: like toggle failed", err);
    }
  }

  async function toggleSave(recipeId) {
    if (!user) {
      alert("Please log in to save recipes.");
      return;
    }
    const targetId = getId(recipeId);
    if (!targetId) return;
    const current = items.find((r) => getId(r) === targetId);
    if (!current) return;
    let currentSavedId = current?.saved_id;
    const currentIsSaved = current?.isSaved ?? current?.is_saved ?? true;
    setItems((prev) => {
      if (currentIsSaved) {
        return prev.filter((r) => getId(r) !== targetId);
      }
      return prev.map((r) =>
        getId(r) === targetId
          ? {
              ...r,
              isSaved: !r.isSaved,
              is_saved: !r.isSaved,
              saved_id: r.isSaved ? null : r.saved_id,
            }
          : r
      );
    });

    setSelectedRecipe((prev) =>
      prev && getId(prev) === targetId
        ? {
            ...prev,
            isSaved: !prev.isSaved,
            is_saved: !prev.isSaved,
            saved_id: prev.isSaved ? null : prev.saved_id,
          }
        : prev
    );

    try {
      if (currentIsSaved && !currentSavedId) {
        try {
          const res = await socialApi.get(`/saved/recipe/${targetId}/me`);
          currentSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        } catch (err) {
          console.error("SavedRecipes: failed to fetch saved id", err);
        }
      }
      if (currentIsSaved && currentSavedId) {
        await socialApi.delete(`/saved/${currentSavedId}`);
      } else if (!currentIsSaved) {
        const res = await socialApi.post(`/saved/${targetId}`);
        const newSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        if (newSavedId) {
          setItems((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, saved_id: newSavedId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId
              ? { ...prev, saved_id: newSavedId }
              : prev
          );
        }
      }
    } catch (err) {
      console.error("SavedRecipes: save toggle failed", err);
    }
  }

  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setActiveCartRecipe(null);
    setShowCartModal(false);
  }

  function openDetail(recipe) {
    setSelectedRecipe({
      ...recipe,
      isLiked: Boolean(recipe.isLiked),
      isSaved: recipe.isSaved ?? recipe.is_saved ?? true,
    });
  }

  function closeDetail() {
    setSelectedRecipe(null);
  }


  return (
    <div className="flex gap-6 px-8 py-6">

      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredRecipes.map(r => (
            <RecipeCard
              key={getId(r)}
              recipe={r}

              onOpen={() => openDetail(r)}

              onToggleSave={() => toggleSave(getId(r))}
              onToggleLike={() => toggleLike(getId(r))}
              onOpenCart={() => openCartModal(r)}
              onOpenComments={() => openDetail(r)}

              isSaved={r.isSaved ?? r.is_saved ?? true}
              isLiked={Boolean(r.isLiked)}
            />
          ))}

          {filteredRecipes.length === 0 && (
            <p className="text-center text-gray-500 col-span-full py-10">
              No saved recipes found.
            </p>
          )}
        </div>
      </div>

      <FilterSidebar
        maxTime={maxTime}
        setMaxTime={setMaxTime}
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />

      {showCartModal && (
        <CartModal recipe={activeCartRecipe} onClose={closeCartModal} />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          user={user}
          onClose={closeDetail}

          isLiked={Boolean(selectedRecipe.isLiked)}
          isSaved={selectedRecipe.isSaved ?? selectedRecipe.is_saved ?? true}

          onToggleLike={() => toggleLike(getId(selectedRecipe))}
          onToggleSave={() => toggleSave(getId(selectedRecipe))}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}

    </div>
  );
}
