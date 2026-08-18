import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

// html5shiv is inside <!--[if lt IE 9]--> and only runs in IE8 which has no CSP support
const EXEMPTED_SCRIPTS = ["html5shiv"];

const viewsDir = path.join(__dirname, "../../views");

describe("CSP nonce in view templates", () => {
  const htmlFiles = glob.sync("**/*.html", { cwd: viewsDir, absolute: true });

  htmlFiles.forEach((filePath) => {
    const relativePath = path.relative(viewsDir, filePath);

    it(`all <script src=> tags in ${relativePath} should have a nonce attribute`, () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const scriptTags = content.match(/<script\s[^>]*src=[^>]*>/g) ?? [];
      const scriptsWithoutNonce = scriptTags.filter(
        (tag) =>
          !tag.includes("nonce=") &&
          !EXEMPTED_SCRIPTS.some((exempt) => tag.includes(exempt))
      );
      expect(scriptsWithoutNonce).toHaveLength(0);
    });
  });
});
