const { generateToken } = require("./auth");
const {
  ROLE,
  PROPERTY_STATUS,
  BATHROOM_TYPE,
  RENT_OR_SALE,
  PRICE_RANGE,
} = require("./enums");

const { ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const serviceAccount = require("./appartment-management-5ddea-17958998ae73.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function signIn(userName, password) {
  const docSnapshot = await db
    .collection("c_user")
    .where("userName", "==", userName)
    .where("password", "==", password)
    .get();

  if (docSnapshot.empty) {
    throw new Error("UserName or Password is incorrect");
  }

  let result = docSnapshot.docs[0].data();
  const token = generateToken(result._id, result.userName, result.role);
  result.token = token;
  console.log(`User SignIn success: ${result._id}`);
  return result;
}

async function signUp(requestData) {
  const docSnapshot = await db
    .collection("c_user")
    .where("userName", "==", requestData.userName)
    .get();
  if (!docSnapshot.empty) {
    throw new Error("UserName is already exists");
  }

  const id = new ObjectId().toString();
  const docRef = db.collection("c_user").doc(id);
  const result = {
    _id: id,
    userName: requestData.userName,
    password: requestData.password,
    role: ROLE.PROPERTY_OWNER,
    emailAddress: requestData.userName,
    contactNumber: requestData.contactNumber,
    createdAt: new Date(),
    lastUpdatedBy: null,
    lastUpdatedAt: null,
  };
  await docRef.set(result);
  const token = generateToken(result._id, result.userName, result.role);
  result.token = token;
  console.log(`User SignUp success: ${result._id}`);
  return result;
}

async function getMainProperties(decoded, district, price, type) {
  let isGetActiveOnly = true;
  if (decoded) {
    const userId = decoded.userId;

    const docSnapshot = await db
      .collection("c_user")
      .where("_id", "==", userId)
      .get();

    if (docSnapshot.empty) {
      throw new Error(`User not found for userId: ${userId}`);
    }

    const user = docSnapshot.docs[0].data();
    if (user.role === ROLE.ADMIN) {
      isGetActiveOnly = false;
    }
  }

  const properties = [];
  let query = db.collection("c_property").where("referenceId", "==", null);

  if (district) {
    query = query.where("district", "==", district);
  }

  if (price) {
    query = query.where("price", "==", price);
  }

  if (!isNaN(type)) {
    query = query.where("type", "==", Number(type));
  }

  if (isGetActiveOnly) {
    query = query.where("status", "in", [1]);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    return properties;
  }

  snapshot.forEach((doc) => {
    properties.push(doc.data());
  });

  return properties;
}

async function getSubPropertiesForPropertyId(propertyId, decoded) {
  const properties = { main: null, sub: [] };

  let isActiveOnly = true;
  if (decoded) {
    const userId = decoded.userId;

    const docSnapshot = await db
      .collection("c_user")
      .where("_id", "==", userId)
      .get();

    if (docSnapshot.empty) {
      throw new Error(`User not found for userId: ${userId}`);
    }

    const user = docSnapshot.docs[0].data();
    if (user) {
      isActiveOnly = false;
    }
  }

  let mainPropertySnapshot = db
    .collection("c_property")
    .where("_id", "==", propertyId)
    .where("referenceId", "==", null);

  if (isActiveOnly) {
    mainPropertySnapshot.where("status", "in", [1]);
  }

  mainPropertySnapshot = await mainPropertySnapshot.get();

  if (mainPropertySnapshot.empty) {
    return properties;
  }

  const mainProperty = mainPropertySnapshot.docs[0].data();
  properties["main"] = mainProperty;

  let subPropertiesSnapshot = db
    .collection("c_property")
    .where("referenceId", "==", propertyId);

  if (isActiveOnly) {
    subPropertiesSnapshot.where("status", "in", [1]);
  }
  subPropertiesSnapshot = await subPropertiesSnapshot.get();

  if (subPropertiesSnapshot.empty) {
    return properties;
  }

  const subProperties = [];

  subPropertiesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    subProperties.push(data);
  });

  properties["sub"] = subProperties;
  return properties;
}

async function createProperty(property) {
  const id = new ObjectId().toString();
  const docRef = db.collection("c_property").doc(id);
  const result = {
    _id: id,
    referenceId: property.referenceId ? property.referenceId : null,
    userId: property.userId,
    propertyImageUrl: property.propertyImageUrl,
    address: property.address,
    district: property.district,
    city: property.city,
    price: PRICE_RANGE[property.price],
    name: property.name,
    count: property.count,
    type: property.type,
    bathroomType: BATHROOM_TYPE[property.bathroomType],
    bathroomCount: property.bathroomCount,
    rentOrSale: RENT_OR_SALE[property.rentOrSale],
    status: 1,
    area: property.area,
    checkInDateTime: new Date(),
    checkOutDateTime: new Date("2199-01-01"),
    createdBy: property.userId,
    createdAt: new Date(),
    lastUpdatedBy: null,
    lastUpdatedAt: null,
  };
  await docRef.set(result);
  console.log(`Created Property successfully: ${id}`);
  return result;
}

async function editProperty(property) {
  const docRef = db.collection("c_property").doc(property._id);
  const result = {
    _id: property._id,
    referenceId: property.referenceId,
    userId: property.userId,
    propertyImageUrl: property.propertyImageUrl,
    address: property.address,
    district: property.district,
    city: property.city,
    price: PRICE_RANGE[property.price],
    name: property.name,
    count: property.count,
    type: property.type,
    bathroomType: PROPERTY_STATUS[property.bathroomType],
    bathroomCount: property.bathroomCount,
    rentOrSale: PROPERTY_STATUS[property.rentOrSale],
    status: PROPERTY_STATUS[property.status],
    area: property.area,
    checkInDateTime: new Date(),
    checkOutDateTime: new Date("2199-01-01"),
    createdBy: property.userId,
    createdAt: new Date(),
    lastUpdatedBy: null,
    lastUpdatedAt: null,
  };
  await docRef.set(result);
  console.log(`Edited Property successfully: ${id}`);
  return result;
}

async function changePropertyStatus(propertyId, newStatus, decoded) {
  const docSnapshot1 = await db
    .collection("c_user")
    .where("_id", "==", decoded.userId)
    .get();

  if (docSnapshot1.empty) {
    throw new Error("User not found");
  }

  const user = docSnapshot1.docs[0].data();

  const docSnapshot2 = await db
    .collection("c_property")
    .where("_id", "==", propertyId)
    .get();

  if (docSnapshot2.empty) {
    throw new Error("Property not found");
  }

  const property = docSnapshot1.docs[0].data();

  const isAdminUser = user.role === ROLE.ADMIN;

  if (!isAdminUser && property.status === PROPERTY_STATUS.PENDING) {
    throw new Error(
      `Change Property Status from Pending supported for ${decoded.userId}`
    );
  }

  if (!isAdminUser && property.userId !== user._id) {
    throw new Error(
      `Change Property Status of another owner is not supported for ${decoded.userId}`
    );
  }

  const docRef = db.collection("c_property").doc(propertyId);
  property.status = PROPERTY_STATUS[newStatus];
  await docRef.set(property);
  console.log(`Changed Property Status successfully: ${propertyId}`);
  return property;
}

async function changePropertyCheckinCheckoutTime(
  userId,
  propertyId,
  newCheckInTime,
  newCheckOutTime
) {
  const docSnapshot1 = await db
    .collection("c_property")
    .where("_id", "==", propertyId)
    .get();

  if (docSnapshot1.empty) {
    throw new Error("Property not Found");
  }

  const property = docSnapshot1.docs[0].data();

  const docSnapshot2 = await db
    .collection("c_user")
    .where("_id", "==", userId)
    .get();

  if (docSnapshot2.empty) {
    throw new Error("User not Found");
  }

  const user = docSnapshot2.docs[0].data();

  if (user.role !== ROLE.ADMIN && property.userId !== userId) {
    throw new Error(
      "Change Property CheckIn/CheckOut time of another Property Owner is restricted"
    );
  }

  const docRef = db.collection("c_property").doc(propertyId);
  property.checkInDateTime = new Date(newCheckInTime);
  property.checkOutDateTime = new Date(newCheckOutTime);
  await docRef.set(property);
  console.log(
    `Changed Property CheckIn/CheckOut time is success: ${propertyId}`
  );
  return property;
}

async function createPropertyImage(propertyImageUrl, userId) {
  const id = new ObjectId().toString();
  const docRef = db.collection("c_property_image").doc(id);
  const result = {
    _id: id,
    url: propertyImageUrl,
    createdBy: userId,
    createdAt: new Date(),
  };
  await docRef.set(result);
  console.log(`Created Property Image successfully: ${id}`);
  return result;
}

module.exports = {
  signIn,
  signUp,
  getMainProperties,
  getSubPropertiesForPropertyId,
  createProperty,
  editProperty,
  changePropertyStatus,
  changePropertyCheckinCheckoutTime,
  createPropertyImage,
};
