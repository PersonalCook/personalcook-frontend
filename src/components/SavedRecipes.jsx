import { useState, useMemo, useContext, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import FilterSidebar from "./FilterSidebar";
import RecipeCard from "./RecipeCard";
import CartModal from "./CartModal";
import RecipeDetailModal from "./RecipeDetailModal";

import socialApi from "../api/social";
import searchApi from "../api/search";
import recipeApi from "../api/recipe";

import { AuthContext } from "../context/AuthContext";
import {
  normalizeRecipes,
  hydrateMissingImages,
  hydrateAuthors,
  hydrateLikes,
  hydrateLikeCounts,
} from "../utils/normalizeRecipe";

export default function SavedRecipes({ recipes }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const savedIdsRef = useRef(savedIds);
  const [savedMetaById, setSavedMetaById] = useState(() => new Map()); 
  const savedMetaRef = useRef(savedMetaById);
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(600);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
  const MIN_QUERY_LEN = 2;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const getId = (r) => {
    if (r == null) return null;
    if (typeof r === "object") return r.id ?? r.recipe_id;
    return r;
  };

  const timeToMinutes = (t) => {
    if (t == null) return 999;
    if (typeof t === "number") return t;
    if (typeof t === "string") {
      const [h = 0, m = 0, s = 0] = t.split(":").map(Number);
      return h * 60 + m + Math.floor(s / 60);
    }
    return 999;
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  useEffect(() => {
    const base = recipes || [];
    const nextIds = new Set();
    const nextMeta = new Map();

    for (const r of base) {
      const id = getId(r);
      if (id == null) continue;

      nextIds.add(String(id));
      const sid = r?.saved_id ?? null;
      if (sid) nextMeta.set(String(id), { saved_id: sid });
    }

    setSavedIds(nextIds);
    setSavedMetaById(nextMeta);
    setItems(base.map((r) => ({ ...r, isSaved: true, is_saved: true })));
  }, [recipes]);


  useEffect(() => {
    savedIdsRef.current = savedIds;
  }, [savedIds]);

  useEffect(() => {
    savedMetaRef.current = savedMetaById;
  }, [savedMetaById]);

  useEffect(() => {
    if (!user) return;

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
        const withCounts = await hydrateLikeCounts(withAuthors);
        const withLikes = await hydrateLikes(withCounts);

        const withImages = await hydrateMissingImages(withLikes, async (id) => {
          const detail = await recipeApi.get(`/recipes/${id}`);
          return detail.data;
        });

        const idSet = savedIdsRef.current;
        let onlySaved = withImages.filter((r) => idSet.has(String(getId(r))));

        if (selectedCategories.length > 1) {
          const catSet = new Set(selectedCategories.map((c) => c.toLowerCase()));
          onlySaved = onlySaved.filter((r) =>
            catSet.has((r.category || "").toLowerCase())
          );
        }

        onlySaved = onlySaved.filter((r) => timeToMinutes(r.total_time) <= maxTime);
        onlySaved = onlySaved.map((r) => ({ ...r, isSaved: true, is_saved: true }));

        if (!isMounted) return;
        setItems(onlySaved);
        setError(null);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
        console.error("SavedRecipes: search MS failed", err);
        if (isMounted) setError("Failed to search saved recipes");
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [user, search, selectedCategories, maxTime]);


  async function toggleLike(recipeId) {
    if (!user) {
      alert("Please log in to like recipes.");
      return;
    }
    const targetId = String(getId(recipeId));
    if (!targetId) return;

    const current = items.find((r) => String(getId(r)) === targetId);
    if (!current) return;

    const currentLikeId = current?.like_id;

    setItems((prev) =>
      prev.map((r) =>
        String(getId(r)) === targetId
          ? { ...r, isLiked: !r.isLiked, like_id: r.isLiked ? null : r.like_id }
          : r
      )
    );

    setSelectedRecipe((prev) =>
      prev && String(getId(prev)) === targetId
        ? { ...prev, isLiked: !prev.isLiked, like_id: prev.isLiked ? null : prev.like_id }
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
              String(getId(r)) === targetId ? { ...r, like_id: newLikeId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && String(getId(prev)) === targetId ? { ...prev, like_id: newLikeId } : prev
          );
        }
      }


      const target = current || selectedRecipe || null;
      if (target) {
        const [withCount] = await hydrateLikeCounts([target]);
        if (withCount) {
          setItems((prev) =>
            prev.map((r) =>
              String(getId(r)) === targetId ? { ...r, likes: withCount.likes } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && String(getId(prev)) === targetId ? { ...prev, likes: withCount.likes } : prev
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
    const targetId = String(getId(recipeId));
    if (!targetId) return;

    const currentlySaved = savedIdsRef.current.has(targetId);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(targetId);
      else next.add(targetId);
      return next;
    });

    setItems((prev) =>
      prev.map((r) =>
        String(getId(r)) === targetId
          ? { ...r, isSaved: !currentlySaved, is_saved: !currentlySaved }
          : r
      )
    );

    setSelectedRecipe((prev) =>
      prev && String(getId(prev)) === targetId
        ? { ...prev, isSaved: !currentlySaved, is_saved: !currentlySaved }
        : prev
    );

    try {
      if (currentlySaved) {
        let savedId = savedMetaRef.current.get(targetId)?.saved_id ?? null;

        if (!savedId) {
          const res = await socialApi.get(`/saved/recipe/${targetId}/me`);
          savedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        }

        if (savedId) {
          await socialApi.delete(`/saved/${savedId}`);
        }

        setSavedMetaById((prev) => {
          const next = new Map(prev);
          next.delete(targetId);
          return next;
        });

      } else {
        const res = await socialApi.post(`/saved/${targetId}`);
        const newSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;

        if (newSavedId) {
          setSavedMetaById((prev) => {
            const next = new Map(prev);
            next.set(targetId, { saved_id: newSavedId });
            return next;
          });

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
      isSaved: savedIdsRef.current.has(String(getId(recipe))),
      is_saved: savedIdsRef.current.has(String(getId(recipe))),
    });
  }


  function closeDetail() {
    const id = selectedRecipe ? String(getId(selectedRecipe)) : null;
    const stillSaved = id ? savedIdsRef.current.has(id) : true;

    setSelectedRecipe(null);

    if (id && !stillSaved) {
      setItems((prev) => prev.filter((r) => String(getId(r)) !== id));
    }
  }

  const visibleItems = useMemo(() => items || [], [items]);

  return (
    <div className="flex gap-6 px-8 py-6">
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && (
            <div className="col-span-full text-gray-500 text-center py-6">
              Searching saved recipes...
            </div>
          )}

          {error && (
            <div className="col-span-full text-red-600 text-center py-6">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            visibleItems.map((r) => (
              <RecipeCard
                key={getId(r)}
                recipe={r}
                onOpen={() => openDetail(r)}
                onToggleSave={() => toggleSave(getId(r))}
                onToggleLike={() => toggleLike(getId(r))}
                onOpenCart={() => openCartModal(r)}
                onOpenComments={() => openDetail(r)}
                isSaved={savedIdsRef.current.has(String(getId(r)))}
                isLiked={Boolean(r.isLiked)}
              />
            ))}

          {!loading && !error && visibleItems.length === 0 && (
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
          isSaved={savedIdsRef.current.has(String(getId(selectedRecipe)))}
          onToggleLike={() => toggleLike(getId(selectedRecipe))}
          onToggleSave={() => toggleSave(getId(selectedRecipe))}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}
    </div>
  );
}
