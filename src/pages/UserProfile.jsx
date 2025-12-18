import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import userApi from "../api/user";
import recipeApi from "../api/recipe";
import socialApi from "../api/social";
import { AuthContext } from "../context/AuthContext";

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
  const { user: me } = useContext(AuthContext)
  const [profileUser, setProfileUser] = useState(null);

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  const [error, setError] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const getId = (r) => (r && typeof r === "object" ? (r.recipe_id ?? r.id) : r);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [u, r, followersRes, followingRes, myFollowingRes] =
          await Promise.all([
            userApi.get(`/users/${id}`),
            recipeApi.get(`/recipes/user/${id}`),
            socialApi.get(`/follows/followers/${id}`),
            socialApi.get(`/follows/following/${id}`),
            socialApi.get(`/follows/following/me`),
          ]);

        if (!isMounted) return;

        const normalized = normalizeRecipes(r.data || []);
        const withAuthors = await hydrateAuthors(normalized);
        const withLikes = me ? await hydrateLikes(withAuthors) : withAuthors;
        const withSaved = me ? await hydrateSaved(withLikes) : withLikes;
        const withCounts = await hydrateLikeCounts(withSaved);

        setProfileUser(u.data);
        setRecipes(withCounts);

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
  }, [id, me]);

  async function toggleLike(recipeId) {
    if (!me) return;

    const targetId = getId(recipeId);
    if (!targetId) return;

    const current = recipes.find((r) => getId(r) === targetId);
    if (!current) return;

    const currentLikeId = current.like_id;

    setRecipes((prev) =>
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
      prev && getId(prev) === targetId ? { ...prev, isLiked: !prev.isLiked } : prev
    );

    try {
      if (current.isLiked && currentLikeId) {
        await socialApi.delete(`/likes/${currentLikeId}`);
      } else {
        const res = await socialApi.post(`/likes/${targetId}`);
        const newLikeId = res?.data?.like_id ?? res?.data?.id ?? null;
        if (newLikeId) {
          setRecipes((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, like_id: newLikeId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId ? { ...prev, like_id: newLikeId } : prev
          );
        }
      }

      const snapshot =
        recipes.find((r) => getId(r) === targetId) || current || null;
      if (snapshot) {
        const [withCount] = await hydrateLikeCounts([snapshot]);
        if (withCount) {
          setRecipes((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, likes: withCount.likes } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId ? { ...prev, likes: withCount.likes } : prev
          );
        }
      }
    } catch (err) {
      console.error("toggleLike failed", err);
    }
  }

  async function toggleSave(recipeId) {
    if (!me) return;

    const targetId = getId(recipeId);
    if (!targetId) return;

    const current = recipes.find((r) => getId(r) === targetId);
    if (!current) return;

    let currentSavedId = current.saved_id;

    setRecipes((prev) =>
      prev.map((r) =>
        getId(r) === targetId
          ? {
              ...r,
              isSaved: !r.isSaved,
              saved_id: r.isSaved ? null : r.saved_id,
            }
          : r
      )
    );
    setSelectedRecipe((prev) =>
      prev && getId(prev) === targetId ? { ...prev, isSaved: !prev.isSaved } : prev
    );

    try {
      if (current.isSaved) {
        if (!currentSavedId) {
          const res = await socialApi.get(`/saved/recipe/${targetId}/me`);
          currentSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        }
        if (currentSavedId) await socialApi.delete(`/saved/${currentSavedId}`);
      } else {
        const res = await socialApi.post(`/saved/${targetId}`);
        const newSavedId = res?.data?.saved_id ?? res?.data?.id ?? null;
        if (newSavedId) {
          setRecipes((prev) =>
            prev.map((r) =>
              getId(r) === targetId ? { ...r, saved_id: newSavedId } : r
            )
          );
          setSelectedRecipe((prev) =>
            prev && getId(prev) === targetId ? { ...prev, saved_id: newSavedId } : prev
          );
        }
      }
    } catch (err) {
      console.error("toggleSave failed", err);
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

  async function toggleFollow() {
    if (!me || !id || followBusy) return;
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
    } finally {
      setFollowBusy(false);
    }
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!profileUser) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
            {profileUser.public_name?.[0] || "?"}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{profileUser.public_name}</h1>
            <p className="text-gray-600">@{profileUser.username}</p>
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

          {/* Optional: hide follow button on own profile */}
          {me && String(me.user_id) !== String(id) && (
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
          )}
        </div>
      </div>

      <RecipeGridMy recipes={recipes} onOpenRecipe={setSelectedRecipe} showAdd={false} />

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          user={me}
          onClose={() => setSelectedRecipe(null)}
          isLiked={Boolean(selectedRecipe.isLiked)}
          isSaved={Boolean(selectedRecipe.isSaved)}
          onToggleLike={() => toggleLike(getId(selectedRecipe))}
          onToggleSave={() => toggleSave(getId(selectedRecipe))}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}

      {showCartModal && (
        <CartModal recipe={activeCartRecipe} onClose={closeCartModal} />
      )}
    </div>
  );
}