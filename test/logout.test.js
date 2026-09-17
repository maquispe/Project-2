const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const passportRequest = require("passport/lib/http/request");

describe("logout route", () => {
  let logout;

  beforeEach(() => {
    const sandbox = {
      module: { exports: {} },
      require: name => name === "../models" ? {} : {
        authenticate: () => "unused middleware"
      }
    };
    vm.runInNewContext(
      fs.readFileSync(path.join(__dirname, "../routes/api-routes.js"), "utf8"),
      sandbox
    );
    sandbox.module.exports({
      post: () => undefined,
      get: (route, handler) => {
        if (route === "/logout") {
          logout = handler;
        }
      }
    });
  });

  it("waits for Passport session logout before redirecting", () => {
    let complete;
    let redirected = false;
    const req = {
      user: { id: 1 },
      logout: passportRequest.logout,
      _sessionManager: {
        logOut: (request, options, callback) => {
          complete = callback;
        }
      }
    };
    logout(req, { redirect: url => {
      assert.strictEqual(url, "/");
      redirected = true;
    } }, err => {
      throw err;
    });
    assert.strictEqual(redirected, false);
    assert.strictEqual(req.user, null);
    complete();
    assert.strictEqual(redirected, true);
  });

  it("forwards session errors without redirecting", () => {
    const failure = new Error("session failure");
    let forwarded;
    logout({ logout: callback => callback(failure) }, {
      redirect: () => assert.fail("must not redirect on error")
    }, err => {
      forwarded = err;
    });
    assert.strictEqual(forwarded, failure);
  });
});
