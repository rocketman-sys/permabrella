import assert from "node:assert/strict";
import test from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";
import { normalizeSearchQuery, searchPattern, SEARCH_QUERY_LIMIT } from "./filters";
import { postTextMatch, titleRelevance } from "./conditions";
import { posts } from "@/lib/db/schema";

test("search normalises whitespace and safely handles repeated URL parameters", () => {
  assert.equal(normalizeSearchQuery("  Mullum\n  garden  "), "Mullum garden");
  assert.equal(normalizeSearchQuery(["SEED", "ignored"]), "SEED");
  assert.equal(normalizeSearchQuery(undefined), "");
  assert.equal(normalizeSearchQuery("a".repeat(200)).length, SEARCH_QUERY_LIMIT);
  assert.equal(postTextMatch(" \n "), undefined);
});

test("SQL wildcard characters are literal search terms", () => {
  assert.equal(searchPattern("100%_\\"), "%100\\%\\_\\\\%");
  const compiled = new PgDialect().sqlToQuery(postTextMatch("%_\\")!);
  assert.ok(compiled.params.every((p) => p === "%\\%\\_\\\\%"));
});

test("each search word can match the name, description or location", () => {
  const compiled = new PgDialect().sqlToQuery(postTextMatch("Mullum garden")!);
  for (const field of ["title", "description", "location_detail", "region"]) assert.ok(compiled.sql.includes(`"${field}"`));
  assert.ok(compiled.params.includes("%Mullum%"));
  assert.ok(compiled.params.includes("%garden%"));
  assert.match(compiled.sql, /\) and \(/);
});

test("queries remain bound parameters, including quotes and SQL-looking text", () => {
  const query = "' OR 1=1 --";
  const compiled = new PgDialect().sqlToQuery(postTextMatch(query)!);
  assert.ok(!compiled.sql.includes("1=1"));
  assert.ok(compiled.params.includes("%1=1%"));
  const rank = new PgDialect().sqlToQuery(titleRelevance(posts.title, "Seed Northern Rivers"));
  assert.deepEqual(rank.params, ["Seed Northern Rivers", "%Seed Northern Rivers%"]);
});
