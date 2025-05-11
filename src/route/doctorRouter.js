const express = require("express");
import userDoctor from "../controllers/User/user.doctor.controller";
import KhamBenh from "../model/KhamBenh";

//import controller
const { doanhThu } = require("../../controllers/PhongKham/revenue.controller");
const { xacNhanLich, updateTTBN } = require("../PhongKham/status.controller");
const {
  datLichKham,
  datLichKhamTTVNPay,
  getLichHen,
  findAllLichHen,
  findAllLichHenByDoctor,
  handleHuyOrder,
  deleteLichHen,
} = require("../PhongKham/appointment.controller");
const {
  fetchAllChuyenKhoa,
  fetchChuyenKhoaByID,
  createChuyenKhoa,
  updateChuyenKhoa,
  deleteChuyenKhoa,
} = require("../PhongKham/specialty.controller");
const {
  fetchAllChucVu,
  createChucVu,
  updateChucVu,
  deleteChucVu,
} = require("../PhongKham/position.controller");
const {
  fetchAllPhongKham,
  fetchPhongKhamByID,
  createPhongKham,
  updatePhongKham,
  deletePhongKham,
} = require("../PhongKham/clinic.controller");
const {
  fetchAllThoiGianGio,
  addTimeKhamBenhDoctor,
  deleteOldTimeSlots,
  getTimeSlotsByDoctorAndDate,
} = require("../PhongKham/timeSlot.controller");

const router = express.Router();

//Route cho bác sĩ
router.post("/create-doctor", userDoctor.createDoctor);
router.get("/fetch-all-doctor", userDoctor.fetchAllDoctor);
// find doctor by id
router.get("/fetch-doctor-by-id", userDoctor.fetchAllDoctorById);
router.put("/update-doctor", userDoctor.updateDoctor);
router.delete("/delete-doctor/:id", userDoctor.deleteDoctor);
//thông tin bác sĩ
router.get("/view-doctor", userDoctor.fetchDoctorById);
// hiển thị info doctor kèm theo thgian khám cho page đặt lịch khám
router.get("/page-dat-lich-kham", userDoctor.fetchDoctorByNgayGio);
// tim bac si thong qua id chuyen khoa
router.get("/doctor-chuyen-khoa", userDoctor.fetchDoctorByChuyenKhoa);
router.get("/doctor-phong-kham", userDoctor.fetchDoctorByPhongKham);

//Route Chuyên khoa
router.get("/fetch-all-chuyen-khoa", fetchAllChuyenKhoa);
// get by id
router.get("/fetch-chuyen-khoa-by-id", fetchChuyenKhoaByID);
router.post("/create-chuyen-khoa", createChuyenKhoa);
router.delete("/delete-chuyen-khoa/:id", deleteChuyenKhoa);
router.put("/update-chuyen-khoa", updateChuyenKhoa);

// Route Chức vụ
router.get("/fetch-all-chuc-vu", fetchAllChucVu);
router.post("/create-chuc-vu", createChucVu);
router.put("/update-chuc-vu", updateChucVu);
router.delete("/delete-chuc-vu/:id", deleteChucVu);

//Route phòng khám
router.get("/fetch-all-phong-kham", fetchAllPhongKham);
router.get("/fetch-phong-kham-by-id", fetchPhongKhamByID);
router.post("/create-phong-kham", createPhongKham);
router.put("/update-phong-kham", updatePhongKham);
router.delete("/delete-phong-kham/:id", deletePhongKham);

//Route đặt lịch
router.post("/dat-lich-kham", datLichKham);
router.post("/dat-lich-kham-vnpay", datLichKhamTTVNPay);

//Route lịch khám
router.get("/find-all-order", findAllLichHen);
router.get("/find-all-order-by-doctor", findAllLichHenByDoctor);
router.delete("/delete-lich-hen/:id", deleteLichHen);
router.get("/lich-hen", getLichHen);
//Route hủy lịch khám
router.post("/huy-order", handleHuyOrder);
//Route cho bác sĩ update lịch khám
router.put("/edit-xacnhan-lich", xacNhanLich);
router.put("/edit-thongtinkham", updateTTBN);

//Route cho bác sĩ lấy lịch khám
// fetch all thoi gian gio
router.get("/fetch-all-time-gio", fetchAllThoiGianGio);
// them thoi gian kham benh
router.post("/add-time", addTimeKhamBenhDoctor);
// xóa lịch trình cũ
router.post("/delete-old-time-slots", deleteOldTimeSlots);
// Thời gian khám của bác sĩ theo ngày
router.get("/get-time-slots", getTimeSlotsByDoctorAndDate);

//Route doanh thu
router.post("/thong-ke", doanhThu);

//Route thanh toán vnpay
router.get("/vnpay_return", async (req, res) => {
  const vnp_TxnRef = req.query.vnp_TxnRef; // Lấy mã giao dịch từ callback
  const vnp_ResponseCode = req.query.vnp_ResponseCode; // Lấy mã phản hồi từ VNPay

  console.log("vnp_TxnRef: ", vnp_TxnRef);

  if (vnp_ResponseCode === "00") {
    // '00' là mã thành công
    // So sánh vnp_TxnRef với _id trong model Order
    const order = await KhamBenh.findById(vnp_TxnRef);
    if (order) {
      // Cập nhật trạng thái đơn hàng
      order.trangThaiXacNhan = true;
      order.trangThaiThanhToan = true;
      await order.save();

      res.render("tbThanhToan.ejs");
    } else {
      res.status(404).send("Không tìm thấy đơn hàng");
    }
  } else {
    res.send(
      "Thanh toán không thành công, đã đặt đơn nhưng chưa được thanh toán"
    );
  }
});

module.exports = router;
