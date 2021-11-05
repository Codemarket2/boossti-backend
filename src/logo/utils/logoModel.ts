import * as mongoose from "mongoose";

const LogoSchema = new mongoose.Schema({
  logo: String,
  description: String,
});

export const Logo = mongoose.model("Logo", LogoSchema);
