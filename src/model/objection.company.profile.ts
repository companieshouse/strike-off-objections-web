export default interface ObjectionCompanyProfile {
  companyName: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  address: {
    line_1: string;
    line_2: string;
    postCode: string;
  };
  incorporationDate: string;
}
