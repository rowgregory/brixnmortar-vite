const { Schema, SchemaTypes, model } = require('mongoose');

const UserSchema = Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    emailAddress: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    tokenExpiration: {
      type: String,
    },
    userType: {
      type: String,
      enum: ['ADMIN', 'CLIENT', 'CONSUMER'],
    },
    newClientForm: {
      type: SchemaTypes.ObjectId,
      ref: 'NewClientForm',
    },
    address: {
      type: SchemaTypes.ObjectId,
      ref: 'Address',
    },
    pets: {
      type: SchemaTypes.ObjectId,
      ref: 'Pet',
    },
    lastLoginTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('User', UserSchema);
