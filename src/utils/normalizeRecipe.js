import userApi from "../api/user";
import socialApi from "../api/social";

const recipeHost = (import.meta.env.VITE_API_RECIPE_URL || "http://localhost:8001").replace(/\/$/, "");

// Normalize a recipe shape coming from various APIs so components can rely on consistent fields.
export function normalizeRecipe(recipe) {
  if (!recipe) return null;

  // Some endpoints wrap the recipe in a `recipe` field; flatten if present.
  const base = recipe.recipe ? { ...recipe.recipe, ...recipe } : recipe;

  const nested = base.recipe || {};

  const id = base.recipe_id ?? base.id ?? recipe.id ?? recipe.recipe_id ?? null;
  const authorUsername = base.author_username ?? base.authorUsername ?? base.username ?? nested.username ?? "";
  const authorName = base.author_name ?? base.authorName ?? base.public_name ?? nested.public_name ?? authorUsername;

  const rawImg =
    base.img ||
    base.image_url ||
    base.image ||
    base.imageUrl ||
    base.thumbnail ||
    base.thumbnail_url ||
    base.image_path ||
    base.imagePath ||
    base.photo ||
    base.photo_url ||
    nested.img ||
    nested.image_url ||
    nested.image ||
    nested.imageUrl ||
    nested.thumbnail ||
    nested.thumbnail_url ||
    nested.image_path ||
    nested.imagePath ||
    nested.photo ||
    nested.photo_url;

  const img = rawImg;
  const fullImg = img
    ? img.startsWith("http")
      ? img
      : `${recipeHost}${img.startsWith("/") ? "" : "/"}${img}`
    : null;

  const preferredIsLiked =
    recipe.isLiked ??
    base.isLiked ??
    recipe.is_liked ??
    base.is_liked ??
    false;
  const preferredIsSaved =
    recipe.isSaved ??
    base.isSaved ??
    recipe.is_saved ??
    base.is_saved ??
    false;

  return {
    ...base,
    id,
    img: fullImg,
    authorName,
    authorUsername,
    isLiked: preferredIsLiked,
    isSaved: preferredIsSaved,
    likes: recipe.likes ?? base.likes ?? 0,
    comments: recipe.comments ?? base.comments ?? [],
  };
}

export function normalizeRecipes(list = []) {
  return (list || []).map(normalizeRecipe).filter(Boolean);
}

// Attach liked/saved flags based on id lists from social API.
export function attachSocialFlags(recipes = [], likedIds = [], savedIds = []) {
  const liked = new Set(likedIds || []);
  const saved = new Set(savedIds || []);
  return (recipes || []).map((r) => {
    const id = r?.id ?? r?.recipe_id;
    const isLiked = r?.is_liked || liked.has(id);
    const isSaved = r?.is_saved || saved.has(id);
    return {
      ...r,
      isLiked,
      isSaved,
    };
  });
}

// Hydrate author details for recipes that only include user_id.
// Fetches each unique user_id via userApi and fills author_name/author_username.
export async function hydrateAuthors(recipes = []) {
  const ids = Array.from(
    new Set(
      (recipes || [])
        .map((r) => r?.user_id ?? r?.recipe?.user_id)
        .filter(Boolean)
        .map((id) => id.toString())
    )
  );
  if (!ids.length) return recipes;

  const authorMap = new Map();
  await Promise.all(
    ids.map(async (idStr) => {
      const id = Number.isNaN(Number(idStr)) ? idStr : Number(idStr);
      try {
        const res = await userApi.get(`/users/${id}`);
        const u = res.data || {};
        authorMap.set(idStr, {
          name: u.public_name || "",
          username: u.username || "",
          avatar: u.avatar || null,
        });
      } catch (err) {
        console.error("hydrateAuthors: failed to fetch user", id, err);
      }
    })
  );

  return (recipes || []).map((r) => {
    const idRaw = r?.user_id ?? r?.recipe?.user_id;
    const idKey = idRaw != null ? idRaw.toString() : null;
    const info = idKey ? authorMap.get(idKey) || {} : {};
    const existingName = r?.authorName || null;
    const existingUsername = r?.authorUsername || null;
    return {
      ...r,
      authorName:
        existingName ||
        info.name ||
        info.username ||
        (idRaw != null ? `User ${idRaw}` : ""),
      authorUsername:
        existingUsername || info.username || (idRaw != null ? `${idRaw}` : ""),
      author_avatar: r?.author_avatar ?? info.avatar ?? null,
    };
  });
}

// Hydrate like status per recipe by calling socialApi.
export async function hydrateLikes(recipes = []) {
  return Promise.all(
    (recipes || []).map(async (r) => {
      const id = r?.recipe_id ?? r?.id;
      if (!id) return r;
      try {
        const res = await socialApi.get(`/likes/recipe/${id}/me`);
        const data = res?.data;
        const likeId = data?.like_id ?? data?.id ?? null;
        const liked = Boolean(likeId);
        return {
          ...r,
          isLiked: liked,
          like_id: likeId,
        };
      } catch (err) {
        console.error("hydrateLikes: failed to fetch like status", id, err);
        return r;
      }
    })
  );
}

// Hydrate like counts only (useful for detail views).
export async function hydrateLikeCounts(recipes = []) {
  return Promise.all(
    (recipes || []).map(async (r) => {
      const id = r?.recipe_id ?? r?.id;
      if (!id) return r;
      try {
        const res = await socialApi.get(`/likes/count/${id}`);
        const likeCount =
          res?.data?.like_count ??
          res?.data?.count ??
          res?.data?.total ??
          r?.likes ??
          0;
        return { ...r, likes: likeCount };
      } catch (err) {
        console.error("hydrateLikeCounts: failed to fetch like count", id, err);
        return r;
      }
    })
  );
}

// Hydrate saved status per recipe by calling socialApi.
export async function hydrateSaved(recipes = []) {
  return Promise.all(
    (recipes || []).map(async (r) => {
      const id = r?.recipe_id ?? r?.id;
      if (!id) return r;
      try {
        const res = await socialApi.get(`/saved/recipe/${id}/me`);
        const data = res?.data;
        const savedId = data?.saved_id ?? data?.id ?? null;
        const saved = Boolean(savedId);
        return {
          ...r,
          isSaved: saved,
          saved_id: savedId,
        };
      } catch (err) {
        console.error("hydrateSaved: failed to fetch save status", id, err);
        return r;
      }
    })
  );
}

// Hydrate recipes that are missing an image by calling the provided fetcher.
// fetchRecipeById should be an async function: (id) => recipeData
export async function hydrateMissingImages(recipes = [], fetchRecipeById) {
  if (!fetchRecipeById) return recipes;
  return Promise.all(
    (recipes || []).map(async (item) => {
      if (item?.img || item?.image_url || item?.image) return item;
      try {
        const detail = await fetchRecipeById(item.id);
        // Merge detail into the existing item so we don't drop hydrated fields (author, likes, etc.)
        return normalizeRecipe({ ...item, ...detail });
      } catch (err) {
        console.error("hydrateMissingImages failed for", item?.id, err);
        return item;
      }
    })
  );
}
