// backend/misconceptions/library-index.js
// Central export for the Misconception Library.
// Case studies reference misconceptions by ID.
// Add new misconception files here to make them available.

const namingCollision      = require('./naming-collision');
const scaleFailure         = require('./scale-failure');
const staticStructure      = require('./static-structure');
const positionBasedLookup  = require('./position-based-lookup');
const piecewiseUpdate      = require('./piecewise-update');

const library = {
  "naming-collision":       namingCollision,
  "scale-failure":          scaleFailure,
  "static-structure":       staticStructure,
  "position-based-lookup":  positionBasedLookup,
  "piecewise-update":       piecewiseUpdate
};

function getMisconception(id) {
  return library[id] || null;
}

function getAllMisconceptions() {
  return { ...library };
}

function getMisconceptionsByFamily(family) {
  return Object.values(library).filter(m => m.family === family);
}

function getMisconceptionsByTag(tag) {
  return Object.values(library).filter(m => m.tag === tag);
}

module.exports = {
  getMisconception,
  getAllMisconceptions,
  getMisconceptionsByFamily,
  getMisconceptionsByTag,
  library
};