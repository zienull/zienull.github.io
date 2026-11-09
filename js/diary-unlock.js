(() => {
  "use strict";

  const pageStoragePrefix = "hexo-blog-encrypt:#";
  const sessionStoragePrefix = "diary-reader:unlock:";
  const diaryGroups = new Set(["baka-diary", "diary-baka"]);

  if (window.__diaryUnlockBridgeInstalled) {
    return;
  }
  window.__diaryUnlockBridgeInstalled = true;

  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;

  function currentDiaryGroup() {
    const group = window.location.pathname.split("/").filter(Boolean)[0];
    return diaryGroups.has(group) ? group : null;
  }

  function sessionKey(group) {
    return `${sessionStoragePrefix}${group}`;
  }

  function isLocalStorage(storage) {
    try {
      return storage === window.localStorage;
    } catch {
      return false;
    }
  }

  Storage.prototype.getItem = function getItem(key) {
    const value = nativeGetItem.call(this, key);

    if (
      value === null &&
      isLocalStorage(this) &&
      typeof key === "string" &&
      key.startsWith(pageStoragePrefix)
    ) {
      const group = currentDiaryGroup();
      if (group) {
        return nativeGetItem.call(window.sessionStorage, sessionKey(group));
      }
    }

    return value;
  };

  Storage.prototype.setItem = function setItem(key, value) {
    nativeSetItem.call(this, key, value);

    if (
      isLocalStorage(this) &&
      typeof key === "string" &&
      key.startsWith(pageStoragePrefix)
    ) {
      const group = currentDiaryGroup();
      if (group) {
        nativeSetItem.call(window.sessionStorage, sessionKey(group), value);
      }
    }
  };

  Storage.prototype.removeItem = function removeItem(key) {
    nativeRemoveItem.call(this, key);

    if (
      isLocalStorage(this) &&
      typeof key === "string" &&
      key.startsWith(pageStoragePrefix)
    ) {
      const group = currentDiaryGroup();
      if (group) {
        nativeRemoveItem.call(window.sessionStorage, sessionKey(group));
      }
    }
  };
})();
