const KhamBenh = require("../../model/KhamBenh");
const Doctor = require("../../model/Doctor");
const { handleError } = require("../../utils/errorUtils");
const { vnpay, ProductCode, VnpLocale } = require("../../utils/vnpayUtils");
const {
  sendAppointmentEmail,
  sendAppointmentEmailHuyLich,
} = require("../../utils/emailUtils");

// API đặt lịch khám
const datLichKham = async (req, res) => {
  try {
    const {
      _idDoctor,
      _idTaiKhoan,
      patientName,
      email,
      gender,
      phone,
      dateBenhNhan,
      address,
      lidokham,
      hinhThucTT,
      tenGioKham,
      ngayKhamBenh,
      giaKham,
    } = req.body;

    const existingAppointments = await KhamBenh.find({
      _idDoctor,
      ngayKhamBenh,
      trangThaiXacNhan: true,
    });

    for (const appointment of existingAppointments) {
      const [existingStartStr, existingEndStr] =
        appointment.tenGioKham.split(" - ");
      const [existingStartHour, existingStartMinute] = existingStartStr
        .split(":")
        .map(Number);
      const [existingEndHour, existingEndMinute] = existingEndStr
        .split(":")
        .map(Number);

      const existingStartTime = new Date(ngayKhamBenh);
      existingStartTime.setHours(existingStartHour, existingStartMinute);

      const existingEndTime = new Date(ngayKhamBenh);
      existingEndTime.setHours(existingEndHour, existingEndMinute);

      const [startHour, startMinute] = tenGioKham.split(":").map(Number);
      const newStartTime = new Date(ngayKhamBenh);
      newStartTime.setHours(startHour, startMinute);

      if (newStartTime < existingEndTime && newStartTime > existingStartTime) {
        return res.status(400).json({
          message: "Lịch khám đã được đặt. Vui lòng chọn thời gian khác.",
        });
      }
    }

    const datlich = await KhamBenh.create({
      _idDoctor,
      _idTaiKhoan,
      patientName,
      email,
      gender,
      phone,
      dateBenhNhan,
      address,
      lidokham,
      hinhThucTT,
      tenGioKham,
      ngayKhamBenh,
      giaKham,
    });

    if (!datlich) {
      return res.status(404).json({ message: "Đặt lịch thất bại!" });
    }

    await sendAppointmentEmail(
      email,
      patientName,
      "Bác sĩ",
      tenGioKham,
      ngayKhamBenh,
      giaKham,
      address,
      phone,
      lidokham,
      "Đã đặt lịch",
      "Phòng khám",
      "Địa chỉ phòng khám",
      "Số điện thoại bác sĩ",
      "Số điện thoại phòng khám"
    );

    return res.status(200).json({
      message: "Đặt lịch khám thành công!",
      data: datlich,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi đặt lịch khám.");
  }
};

// API đặt lịch khám với VNPay
const datLichKhamTTVNPay = async (req, res) => {
  try {
    const {
      _idDoctor,
      _idTaiKhoan,
      patientName,
      email,
      gender,
      phone,
      dateBenhNhan,
      address,
      lidokham,
      hinhThucTT,
      tenGioKham,
      ngayKhamBenh,
      giaKham,
    } = req.body;

    const datlich = await KhamBenh.create({
      _idDoctor,
      _idTaiKhoan,
      patientName,
      email,
      gender,
      phone,
      dateBenhNhan,
      address,
      lidokham,
      hinhThucTT,
      tenGioKham,
      ngayKhamBenh,
      giaKham,
    });

    if (!datlich) {
      return res.status(404).json({ message: "Đặt lịch thất bại!" });
    }

    const returnUrl =
      req.body?.returnUrl || "http://localhost:8089/api/doctor/vnpay_return";

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: giaKham,
      vnp_IpAddr: req.ip,
      vnp_TxnRef: datlich._id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${datlich._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
    });

    return res.status(200).json({
      message: "Đặt lịch khám thành công!",
      data: datlich,
      paymentUrl,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi đặt lịch khám với VNPay.");
  }
};

// API lấy lịch hẹn
const getLichHen = async (req, res) => {
  try {
    const { idKhachHang } = req.query;

    const findLichHen = await KhamBenh.find({ _idTaiKhoan: idKhachHang })
      .populate("_idDoctor _idTaiKhoan")
      .populate({
        path: "_idDoctor",
        populate: [
          { path: "chucVuId" },
          { path: "chuyenKhoaId" },
          { path: "phongKhamId" },
        ],
      });

    if (!findLichHen) {
      return res.status(404).json({ message: "Tìm lịch hẹn thất bại!" });
    }

    return res.status(200).json({
      message: "Tìm lịch hẹn thành công!",
      data: findLichHen,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy lịch hẹn.");
  }
};

// API lấy tất cả lịch hẹn
const findAllLichHen = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const findOrder = await KhamBenh.find({})
      .skip(skip)
      .limit(limitNumber)
      .populate("_idDoctor _idTaiKhoan");

    const totalOrder = await KhamBenh.countDocuments({});
    const totalPages = Math.ceil(totalOrder / limitNumber);

    return res.status(200).json({
      message: "Lấy danh sách lịch hẹn thành công!",
      data: findOrder,
      totalOrder,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
  }
};

// API lấy lịch hẹn theo bác sĩ
const findAllLichHenByDoctor = async (req, res) => {
  try {
    const { idDoctor } = req.query;

    const findOrder = await KhamBenh.find({ _idDoctor: idDoctor }).populate(
      "_idDoctor _idTaiKhoan"
    );

    return res.status(200).json({
      message: "Lấy danh sách lịch hẹn theo bác sĩ thành công!",
      data: findOrder,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
  }
};

// API hủy lịch hẹn
const handleHuyOrder = async (req, res) => {
  try {
    const { id } = req.query;

    const checkOrder = await KhamBenh.findById(id);

    if (!checkOrder) {
      return res.status(404).json({ message: "Lịch hẹn không tồn tại." });
    }

    const updateOrder = await KhamBenh.updateOne(
      { _id: id },
      { trangThaiHuyDon: "Đã Hủy" }
    );

    if (updateOrder) {
      return res.status(200).json({
        message: "Hủy lịch hẹn thành công!",
        data: updateOrder,
      });
    } else {
      return res.status(404).json({ message: "Hủy lịch hẹn thất bại." });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi hủy lịch hẹn.");
  }
};

// API xóa lịch hẹn
const deleteLichHen = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAppointment = await KhamBenh.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Lịch hẹn không tồn tại." });
    }

    return res.status(200).json({
      message: "Xóa lịch hẹn thành công!",
      data: deletedAppointment,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xóa lịch hẹn.");
  }
};

module.exports = {
  datLichKham,
  datLichKhamTTVNPay,
  getLichHen,
  findAllLichHen,
  findAllLichHenByDoctor,
  handleHuyOrder,
  deleteLichHen,
};
