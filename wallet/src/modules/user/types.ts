import { Document } from 'mongoose'

export interface SerializedUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type User = SerializedUser & Document & { 
  serialize(): SerializedUser
}