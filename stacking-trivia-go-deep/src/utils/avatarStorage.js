/**
 * Avatar storage and retrieval utilities
 */

const STORAGE_KEY_PREFIX = 'deeply_trivial_avatar_';

export const saveAvatar = (userId, avatarData) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const payload = {
      ...avatarData,
      savedAt: Date.now(),
      version: 1,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Failed to save avatar:', error);
    return false;
  }
};

export const loadAvatar = (userId) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load avatar:', error);
    return null;
  }
};

export const clearAvatar = (userId) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear avatar:', error);
  }
};


