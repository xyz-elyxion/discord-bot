/**
 * Local JSON-file database + tiny in-memory cache.
 *
 * Replaces MongoDB (mongoose) and Redis (ioredis) so the bot runs
 * fully on local data. Exposes a small Mongoose-like API:
 *   findOne / find / create / findOneAndUpdate / findOneAndDelete
 * and documents get a .save() method.
 *
 * Data is persisted to data/localdb.json (auto-created on first run).
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "localdb.json");

let root = {};

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      root = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } else {
      root = {};
      persist();
    }
  } catch (err) {
    console.error("[LocalStore] Failed to load local database:", err);
    root = {};
  }
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(root, null, 2));
  } catch (err) {
    console.error("[LocalStore] Failed to save local database:", err);
  }
}

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof o[parts[i]] !== "object" || o[parts[i]] === null) {
      o[parts[i]] = {};
    }
    o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = value;
}

function getPath(obj, dotted) {
  let o = obj;
  for (const part of dotted.split(".")) {
    if (o === null || o === undefined) return undefined;
    o = o[part];
  }
  return o;
}

function matches(doc, query) {
  if (!query) return true;
  return Object.keys(query).every((key) => getPath(doc, key) === query[key]);
}

function mergeDefaults(target, defaults) {
  for (const [key, value] of Object.entries(defaults)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      if (typeof target[key] !== "object" || target[key] === null) {
        target[key] = {};
      }
      mergeDefaults(target[key], value);
    } else if (target[key] === undefined) {
      target[key] = value;
    }
  }
  return target;
}

// Array subclass so `.find().sort({ field: -1 })` works like Mongoose.
class DocArray extends Array {
  sort(sortQuery) {
    if (!sortQuery) return super.sort();
    const [field, dir] = Object.entries(sortQuery)[0];
    return super.sort((a, b) => {
      const av = getPath(a, field);
      const bv = getPath(b, field);
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return av > bv ? dir : -dir;
    });
  }
}

class Collection {
  constructor(name, defaults = {}) {
    this.name = name;
    this.defaults = defaults;
    if (!root[name]) root[name] = [];
  }

  get docs() {
    if (!root[this.name]) root[this.name] = [];
    return root[this.name];
  }

  attachSave(doc) {
    const col = this;
    Object.defineProperty(doc, "save", {
      value: async function () {
        persist();
        return doc;
      },
      enumerable: false,
      writable: true,
      configurable: true,
    });
    return doc;
  }

  find(query) {
    const result = new DocArray();
    for (const doc of this.docs) {
      if (matches(doc, query)) result.push(this.attachSave(doc));
    }
    return result;
  }

  findOne(query) {
    const doc = this.docs.find((d) => matches(d, query));
    return doc ? Promise.resolve(this.attachSave(doc)) : Promise.resolve(null);
  }

  async create(data) {
    const doc = JSON.parse(JSON.stringify(data));
    // Dates need to be revived properly.
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) doc[key] = value;
    }
    mergeDefaults(doc, this.defaults);
    this.docs.push(doc);
    persist();
    return this.attachSave(doc);
  }

  async findOneAndUpdate(query, update, options = {}) {
    let doc = this.docs.find((d) => matches(d, query));
    if (!doc) {
      if (!options.upsert) return Promise.resolve(null);
      const seed =
        query && typeof query === "object" ? { ...query } : {};
      doc = mergeDefaults(seed, this.defaults);
      this.docs.push(doc);
    }
    const before = options.new ? null : JSON.parse(JSON.stringify(doc));
    for (const [key, value] of Object.entries(update)) {
      setPath(doc, key, value);
    }
    persist();
    return this.attachSave(options.new ? doc : before ?? doc);
  }

  async findOneAndDelete(query) {
    const index = this.docs.findIndex((d) => matches(d, query));
    if (index === -1) return Promise.resolve(null);
    const [doc] = this.docs.splice(index, 1);
    persist();
    return this.attachSave(doc);
  }
}

// Tiny in-memory cache with a Redis-like surface (get/set/del). "EX" is accepted but ignored.
class LocalCache {
  constructor() {
    this.store = new Map();
  }
  get(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  set(key, value) {
    this.store.set(key, value);
    return "OK";
  }
  del(...keys) {
    keys.forEach((k) => this.store.delete(k));
    return keys.length;
  }
}

module.exports = { Collection, LocalCache, load: load, persist };
