const crypto = require("crypto");

const secret = crypto.randomBytes(31);
const nullifier = crypto.randomBytes(31);

module.exports = { secret, nullifier };
