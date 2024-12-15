const ROLE = Object.freeze({
  ADMIN: "ADMIN",
  PROPERTY_OWNER: "PROPERTY_OWNER",
});

const PROPERTY_STATUS = Object.freeze({
  PENDING: 0,
  ACTIVE: 1,
  INACTIVE: -1,
  DELETED: -2,
});

const BATHROOM_TYPE = Object.freeze({
  ATTACHED: "ATTACHED",
  SEPARATE: "SEPARATE",
});

const RENT_OR_SALE = Object.freeze({
  RENT: "RENT",
  SALE: "SALE",
});

module.exports = {
  ROLE,
  PROPERTY_STATUS,
  BATHROOM_TYPE,
  RENT_OR_SALE,
};
