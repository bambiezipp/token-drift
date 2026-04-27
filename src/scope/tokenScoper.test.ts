import {
  extractScope,
  listScopes,
  groupByScope,
  buildScopeResult,
  formatScopeResult,
} from "./tokenScoper";

const tokens: Record<string, string> = {
  "color.primary": "#0055ff",
  "color.secondary": "#ff5500",
  "spacing.sm": "4px",
  "spacing.md": "8px",
  "typography.size.base": "16px",
  rootToken: "value",
};

describe("extractScope", () => {
  it("extracts tokens under a scope prefix", () => {
    const result = extractScope(tokens, "color");
    expect(result).toEqual({ primary: "#0055ff", secondary: "#ff5500" });
  });

  it("returns empty object for unknown scope", () => {
    expect(extractScope(tokens, "animation")).toEqual({});
  });

  it("handles trailing dot in scope", () => {
    const result = extractScope(tokens, "spacing.");
    expect(result).toEqual({ sm: "4px", md: "8px" });
  });
});

describe("listScopes", () => {
  it("returns sorted unique top-level scopes", () => {
    expect(listScopes(tokens)).toEqual(["color", "spacing", "typography"]);
  });

  it("returns empty array for flat tokens with no dots", () => {
    expect(listScopes({ foo: "bar", baz: "qux" })).toEqual([]);
  });
});

describe("groupByScope", () => {
  it("groups tokens by top-level scope", () => {
    const groups = groupByScope(tokens);
    expect(groups["color"]).toEqual({ primary: "#0055ff", secondary: "#ff5500" });
    expect(groups["spacing"]).toEqual({ sm: "4px", md: "8px" });
  });

  it("places root-level tokens under __root__", () => {
    const groups = groupByScope(tokens);
    expect(groups["__root__"]).toEqual({ rootToken: "value" });
  });
});

describe("buildScopeResult", () => {
  it("builds a scope result with count", () => {
    const result = buildScopeResult(tokens, "spacing");
    expect(result.scope).toBe("spacing");
    expect(result.count).toBe(2);
    expect(result.tokens).toEqual({ sm: "4px", md: "8px" });
  });
});

describe("formatScopeResult", () => {
  it("formats scope result as a readable string", () => {
    const result = buildScopeResult(tokens, "color");
    const output = formatScopeResult(result);
    expect(output).toContain("Scope: color (2 tokens)");
    expect(output).toContain("primary: #0055ff");
    expect(output).toContain("secondary: #ff5500");
  });
});
