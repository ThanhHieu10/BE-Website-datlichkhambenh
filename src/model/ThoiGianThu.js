const mongoose = require("mongoose");

const ThoiGianThu_Schema = new mongoose.Schema(
  {
    ngayKhamBenh: { type: String },
    tenGioId: [{ ref: "ThoiGianGio", type: mongoose.SchemaTypes.ObjectId }],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ThoiGianThu", ThoiGianThu_Schema);
