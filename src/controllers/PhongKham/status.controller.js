const KhamBenh = require("../../model/KhamBenh");
const { handleError } = require("../../utils/errorUtils");

// API xác nhận lịch hẹn
const xacNhanLich = async (req, res) => {
  try {
    const { id, trangThaiXacNhan } = req.body;

    // Cập nhật trạng thái lịch hẹn
    const updatedAccount = await KhamBenh.findByIdAndUpdate(
      id,
      { trangThaiXacNhan },
      { new: true }
    );

    if (updatedAccount) {
      return res.status(200).json({
        message: "Cập nhật trạng thái lịch khám thành công!",
        data: updatedAccount,
      });
    } else {
      return res.status(404).json({ message: "Lịch khám không tìm thấy." });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn.");
  }
};

// API cập nhật thông tin bệnh nhân
const updateTTBN = async (req, res) => {
  try {
    let { _id, benhAn, trangThaiKham } = req.body;

    // Cập nhật bệnh án và trạng thái khám
    let updatedAppointment = await KhamBenh.updateOne(
      { _id: _id },
      { benhAn, trangThaiKham, trangThaiThanhToan: true }
    );

    if (updatedAppointment) {
      return res.status(200).json({
        data: updatedAppointment,
        message: "Cập nhật thông tin bệnh nhân thành công!",
      });
    } else {
      return res.status(404).json({
        message: "Cập nhật thông tin bệnh nhân thất bại.",
      });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật thông tin bệnh nhân.");
  }
};

// API xác nhận lịch hẹn (phiên bản khác)
const xacNhanLich1 = async (req, res) => {
  try {
    const { id, trangThaiXacNhan } = req.body;

    const updatedAccount = await KhamBenh.findByIdAndUpdate(
      id,
      { trangThaiXacNhan },
      { new: true }
    );

    if (updatedAccount) {
      return res
        .status(200)
        .json({ message: "Cập nhật thành công", data: updatedAccount });
    } else {
      return res.status(404).json({ message: "Lịch hẹn không tìm thấy." });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xác nhận lịch hẹn.");
  }
};

// API cập nhật thông tin bệnh nhân (phiên bản khác)
const updateTTBN1 = async (req, res) => {
  try {
    let { _id, benhAn, trangThaiKham } = req.body;

    let updatedAppointment = await KhamBenh.updateOne(
      { _id: _id },
      { benhAn, trangThaiKham }
    );

    if (updatedAppointment) {
      return res.status(200).json({
        data: updatedAppointment,
        message: "Cập nhật thông tin bệnh nhân thành công!",
      });
    } else {
      return res.status(404).json({
        message: "Cập nhật thông tin bệnh nhân thất bại.",
      });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi cập nhật thông tin bệnh nhân.");
  }
};

module.exports = {
  xacNhanLich,
  updateTTBN,
  xacNhanLich1,
  updateTTBN1,
};
