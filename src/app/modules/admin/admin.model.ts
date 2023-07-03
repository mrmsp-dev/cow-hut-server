/* eslint-disable @typescript-eslint/no-this-alias */

import { Schema, model } from 'mongoose';
import { AdminModel, IAdmin } from './admin.interface';
import bcrypt from 'bcrypt';
import config from '../../../config';

const AdminSchema = new Schema<IAdmin, AdminModel>(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password; // Exclude password field from the response
        return ret;
      },
    },
  }
);

AdminSchema.statics.isUserExist = async function (
  phoneNumber: string
): Promise<IAdmin | null> {
  console.log('AAMI JEI ID PASSI', phoneNumber);

  return await Admin.findOne(
    { phoneNumber },
    { phoneNumber: 1, password: 1, role: 1, id: 1 }
  );
};
AdminSchema.statics.isRefreshedAdminExist = async function (
  id: string
): Promise<IAdmin | null> {
  return await Admin.findById(id, {
    phoneNumber: 1,
    password: 1,
    role: 1,
    id: 1,
  });
};

AdminSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

AdminSchema.pre('save', async function (next) {
  //hash password
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bycrypt_salt_rounds)
  );
  next();
});

export const Admin = model<IAdmin, AdminModel>('Admin', AdminSchema);
