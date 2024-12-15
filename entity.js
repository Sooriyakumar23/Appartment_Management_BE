const PROPERTY = {
  id: null,
  referenceId: null,
  userId: null,
  propertyImageUrl: null,
  address: null,
  district: null,
  city: null,
  price: 0,
  name: null,
  count: 0,
  type: 0,
  bedroomCount: 0,
  bathroomType: null,
  bathroomCount: 0,
  rentOrSale: null,
  status: 0,
  area: null,
  checkInDateTime: new Date(),
  checkOutDateTime: new Date(),
  createdBy: null,
  createdAt: new Date(),
  lastUpdatedBy: null,
  lastUpdatedAt: null,
};

const PROPERTY_IMAGE = {
  _id: null,
  url: null,
  createdBy: null,
  createdAt: new Date(),
};

const USER = {
  _id: null,
  userName: null,
  password: null,
  role: null,
  emailAddress: null,
  contactNumber: 0,
  createdAt: new Date(),
  lastUpdatedBy: null,
  lastUpdatedAt: null,
};
