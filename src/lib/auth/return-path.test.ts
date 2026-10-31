import assert from "node:assert/strict";
import test from "node:test";
import { authPageHref, safeReturnPath } from "./return-path";

test("posting destinations survive login, registration and the return to login", () => {
  for (const path of ["/events/new", "/offerings/new?type=wanted&region=ballina", "/community/new?topic=seeds#question", "/listings/123/edit"]) {
    const registration = new URL(authPageHref("register", path), "https://www.permabrella.org");
    const destination = safeReturnPath(registration.searchParams.get("callbackUrl"));
    assert.equal(destination, path);
    const login = new URL(authPageHref("login", destination), registration.origin);
    assert.equal(safeReturnPath(login.searchParams.get("callbackUrl")), path);
  }
});

test("direct registration and missing return destinations lead home", () => {
  for (const value of [null, undefined, "", "/"]) assert.equal(safeReturnPath(value), "/");
  assert.equal(authPageHref("register", "/"), "/register");
});

test("untrusted destinations cannot navigate off-site or execute scripts", () => {
  for (const path of ["https://example.org", "//example.org", "javascript:alert(1)", "/\\example.org", "/%5cexample.org", "/%2fexample.org", "/\n/example.org", "/%0a/example.org", "/bad%escape", "/a/..//example.org", "/%2e%2e//example.org"]) {
    assert.equal(safeReturnPath(path), "/", path);
    assert.equal(authPageHref("register", path), "/register", path);
  }
});

test("auth pages cannot create a sign-up redirect loop", () => {
  for (const path of ["/login", "/register?callbackUrl=/events/new", "/foo/../login", "/%72egister"]) assert.equal(safeReturnPath(path), "/");
});
