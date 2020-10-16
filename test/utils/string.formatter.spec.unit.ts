import { removeNonPrintableChars } from "../../src/utils/string.formatter";


describe("String formatter tests", () => {
  it("should remove non printable chars", () => {
    const dodgyString: string = "hello.\r\nThis string is \t dodgy!";
    const formattedString: string = removeNonPrintableChars(dodgyString);

    expect(formattedString).toEqual("hello. This string is dodgy!");
  });

  it("should not remove printable chars", () => {
    const notDodgyString: string = "hello. This string is not dodgy !@£$%^&*()€#¢§¶ªº";
    const formattedString: string = removeNonPrintableChars(notDodgyString);

    expect(formattedString).toEqual("hello. This string is not dodgy !@£$%^&*()€#¢§¶ªº");
  });

  it("should return original string if it is empty", () => {
    const emptyString: string = "";
    const formattedString: string = removeNonPrintableChars(emptyString);

    expect(formattedString).toEqual(emptyString);
  });

  it("should return original string if it is single blank", () => {
    const blankString: string = " ";
    const formattedString: string = removeNonPrintableChars(blankString);

    expect(formattedString).toEqual(blankString);
  });

  it("should return single space string if it is multiple blank", () => {
    const blankString: string = "    ";
    const formattedString: string = removeNonPrintableChars(blankString);

    expect(formattedString).toEqual(" ");
  });
});
