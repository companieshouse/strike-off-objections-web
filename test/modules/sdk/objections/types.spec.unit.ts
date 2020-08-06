import { Objection } from "../../../../src/modules/sdk/objections";

describe("objections class", () => {
  it("should encode using html encoding",  () => {
    const oldObjection: Objection = new Objection("\"'`&<>",
      [{name: "&<>\"'`"}]);

    const encodedObjection: Objection = oldObjection.getHtmlEncoded();

    expect(encodedObjection.reason).toBe("&#x22;&#x27;&#x60;&#x26;&#x3C;&#x3E;");
    expect(encodedObjection.attachments[0].name).toBe("&#x26;&#x3C;&#x3E;&#x22;&#x27;&#x60;");
  });
});
