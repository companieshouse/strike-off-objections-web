import { formatCHSDateForDisplay } from "../../src/utils/date.formatter";

describe("date formatter tests", () => {

  it("should return a formatted date for displaying when given a CHS date", () => {
    const formattedDate: string = formatCHSDateForDisplay("1906-11-03");
    expect(formattedDate).toEqual("3 November 1906");
  });

  it("should return 'Invalid date' when given empty string", () => {
    const formattedDate: string = formatCHSDateForDisplay("");
    expect(formattedDate).toEqual("Invalid date");
  });

  it("should return 'Invalid date' when given date in the wrong format", () => {
    const invalid = "Invalid date";

    let formattedDate: string = formatCHSDateForDisplay("03/11/1906");
    expect(formattedDate).toEqual(invalid);

    formattedDate = formatCHSDateForDisplay("1906/11/03");
    expect(formattedDate).toEqual(invalid);

    formattedDate = formatCHSDateForDisplay("03-11-1906");
    expect(formattedDate).toEqual(invalid);

    formattedDate = formatCHSDateForDisplay("1906-25-11");
    expect(formattedDate).toEqual(invalid);
  });

  it("should return 'Invalid date' when given 'undefined'", () => {
    const formattedDate: string = formatCHSDateForDisplay(undefined as unknown as string);
    expect(formattedDate).toEqual("Invalid date");
  });
});
