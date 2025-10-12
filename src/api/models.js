// JSDoc typedefs for API models used across the app

/**
 * @typedef {Object} Attributes
 * @property {number=} strength
 * @property {number=} intelligence
 * @property {number=} charisma
 * @property {number=} leadership
 * @property {number=} attack
 * @property {number=} defense
 * @property {number=} speed
 * @property {number=} health
 */

/**
 * @typedef {Object} Card
 * @property {string|number} id
 * @property {string} name
 * @property {string=} image
 * @property {Attributes} attributes
 * @property {string} tier
 * @property {string=} description
 * @property {number=} birthYear
 * @property {number=} deathYear
 * @property {string=} status
 * @property {string|Date=} createdAt
 * @property {string|Date=} updatedAt
 */

/**
 * @typedef {Object} Proposal
 * @property {string|number} id
 * @property {string} name
 * @property {string=} image
 * @property {Attributes} attributes
 * @property {string=} tier
 * @property {string=} description
 * @property {number=} birthYear
 * @property {number=} deathYear
 * @property {string} status
 * @property {string|Date=} createdAt
 * @property {string|Date=} updatedAt
 * @property {string=} proposerName
 * @property {string=} proposerInstagram
 * @property {string=} email
 */

/**
 * @typedef {Object} AdminSettings
 * @property {string=} email
 * @property {string=} instagramUrl
 * @property {string=} twitterUrl
 * @property {string=} facebookUrl
 * @property {string=} linkedinUrl
 * @property {string=} youtubeUrl
 */

/** @type {Attributes} */
export const DEFAULT_ATTRIBUTES = {
  strength: 50,
  intelligence: 50,
  charisma: 50,
  leadership: 50,
  attack: 50,
  defense: 50,
  speed: 50,
  health: 50,
};


