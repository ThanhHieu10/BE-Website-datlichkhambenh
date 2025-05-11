const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const KhamBenh = require("../../model/KhamBenh");
const { handleError } = require("../../utils/errorUtils");

const doanhThu = async (req, res) => {
  try {
    let { trangThaiKham, _idDoctor } = req.body;

    console.log("trangThaiKham, _idDoctor: ", trangThaiKham, _idDoctor);

    let filter = {};

    if (trangThaiKham !== undefined) {
      if (trangThaiKham === "dakham") {
        filter.trangThaiKham = true; // Đã khám
      } else if (trangThaiKham === "chokham") {
        filter.trangThaiKham = false; // Chưa khám
      }
    }

    if (_idDoctor && ObjectId.isValid(_idDoctor)) {
      _idDoctor = new ObjectId(_idDoctor);
    }

    const orders = await KhamBenh.aggregate([
      {
        $match: {
          _idDoctor: _idDoctor,
          trangThaiKham: trangThaiKham === "dakham" ? true : false,
          trangThaiXacNhan: true,
        },
      },
      {
        $project: {
          totalCaKham: "$totalCaKham",
          status: 1,
        },
      },
      {
        $group: {
          _id: "$_idDoctor",
          totalCaKham: { $sum: 1 }, // Tổng số ca khám (1 đơn hàng = 1 ca khám)
          totalOrders: { $sum: 1 }, // Tổng số đơn hàng thành công (1 đơn hàng = 1)
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo _idDoctor
      },
    ]);

    console.log("data orders: ", orders);

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Có lỗi xảy ra khi lấy thông tin doanh thu.");
  }
};

module.exports = {
  doanhThu,
};
