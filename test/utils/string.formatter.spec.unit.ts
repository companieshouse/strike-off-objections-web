import { removeNonPrintableChars } from "../../src/utils/string.formatter";


describe("String formatter tests", () => {
  it("should not remove formatting chars", () => {
    const preFormattedString: string = "hello.\r\nThis string is not dodgy!";
    const formattedString: string = removeNonPrintableChars(preFormattedString);

    expect(formattedString).toEqual("hello.\r\nThis string is not dodgy!");
  });

  it("should not remove accented character chars used in Welsh", () => {
    const preFormattedString: string = "Hylô amgáu düwch mẁg";
    const formattedString: string = removeNonPrintableChars(preFormattedString);

    expect(formattedString).toEqual("Hylô amgáu düwch mẁg");
  });

  it("should not remove accented character chars used in Welsh in capitals", () => {
    const preFormattedString: string = "HYLÔ AMGÁU DÜWCH MẀG";
    const formattedString: string = removeNonPrintableChars(preFormattedString);

    expect(formattedString).toEqual("HYLÔ AMGÁU DÜWCH MẀG");
  });

  it("should remove non printable chars", () => {
    const preFormattedString: string = "hello. This string is dodgy !`@\t£$%^&*()€#¢§¶ªº";
    const formattedString: string = removeNonPrintableChars(preFormattedString);

    expect(formattedString).toEqual("hello. This string is dodgy ! @ £$% &*()€# ");
  });

  it("should not remove printable chars", () => {
    const preFormattedString: string = "hello. This string is not dodgy !@£$%&*()€#";
    const formattedString: string = removeNonPrintableChars(preFormattedString);

    expect(formattedString).toEqual("hello. This string is not dodgy !@£$%&*()€#");
  });

  it("should return original string if it is empty", () => {
    const emptyString: string = "";
    const formattedString: string = removeNonPrintableChars(emptyString);

    expect(formattedString).toEqual(emptyString);
  });

  it("should return original string if it is blank", () => {
    const blankString: string = " ";
    const formattedString: string = removeNonPrintableChars(blankString);

    expect(formattedString).toEqual(blankString);
  });
});
