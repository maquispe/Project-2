const assert = require("assert");

describe("Sequelize model initialization", () => {
  it("loads all model factories and registers associations without connecting", () => {
    const db = require("../models");
    for (const name of ["Artist", "Book", "Tag", "Track", "User"]) {
      assert.strictEqual(db[name].sequelize, db.sequelize);
    }
    assert.strictEqual(db.Book.associations.Artist.target, db.Artist);
    assert.strictEqual(db.Book.associations.Track.target, db.Track);
    assert.strictEqual(db.Book.associations.Tags.target, db.Tag);
    assert.strictEqual(db.Tag.associations.Books.target, db.Book);
    assert.strictEqual(db.Artist.associations.Books.target, db.Book);
    assert.strictEqual(db.Track.associations.Books.target, db.Book);
    assert.strictEqual(db.User.rawAttributes.email.allowNull, false);
    assert.strictEqual(typeof db.User.prototype.validPassword, "function");
  });
});
