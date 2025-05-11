const Doctor = require("../../model/Doctor");
const ThoiGianGio = require("../../model/ThoiGianGio");
const moment = require("moment");
const { handleError } = require("../../utils/errorUtils");

// API lấy tất cả thời gian khám
const fetchAllThoiGianGio = async (req, res) => {
  try {
    const resGio = await ThoiGianGio.find({});
    if (resGio) {
      return res.status(200).json({
        data: resGio,
        message: "Đã tìm ra tất cả thời gian",
      });
    } else {
      return res.status(404).json({ message: "Không tìm thấy thời gian!" });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy danh sách thời gian.");
  }
};

// API thêm thời gian khám bệnh cho bác sĩ
const addTimeKhamBenhDoctor = async (req, res) => {
  const { date, time, _id } = req.body;

  try {
    const doctor = await Doctor.findById(_id);
    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
    }

    const requestDate = moment(date, "DD-MM-YYYY")
      .startOf("day")
      .format("YYYY-MM-DD");

    if (!moment(requestDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ message: "Ngày không hợp lệ!" });
    }

    const existingTimeSlot = doctor.thoiGianKham.find(
      (slot) => slot.date === requestDate
    );

    if (existingTimeSlot) {
      // Nếu có time slot, cập nhật lại danh sách thoiGianId
      const updatedTimeIds = time;
      existingTimeSlot.thoiGianId = updatedTimeIds;
    } else if (time.length > 0) {
      // Nếu không có time slot, tạo mới khi `time` không rỗng
      doctor.thoiGianKham.push({ date: requestDate, thoiGianId: time });
    }

    await doctor.removeExpiredTimeSlots();
    await doctor.save();

    return res.status(200).json({
      message: "Cập nhật lịch trình khám bệnh thành công!",
      data: doctor,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi thêm thời gian khám bệnh.");
  }
};

// API xóa lịch trình cũ
const deleteOldTimeSlots = async (req, res) => {
  const { _id } = req.body;

  try {
    const doctor = await Doctor.findById(_id);
    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
    }

    const oldSlots = doctor.thoiGianKham.filter((slot) =>
      moment(slot.date).isBefore(moment(), "day")
    );

    if (oldSlots.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có lịch trình cũ để xóa!" });
    }

    doctor.thoiGianKham = doctor.thoiGianKham.filter((slot) =>
      moment(slot.date).isSameOrAfter(moment(), "day")
    );

    await doctor.save();

    return res.status(200).json({
      message: "Đã xóa các lịch trình cũ thành công!",
      data: doctor,
    });
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi xóa lịch trình cũ.");
  }
};

// API lấy thời gian khám của bác sĩ theo ngày
const getTimeSlotsByDoctorAndDate = async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
    }

    const queryDate = moment.utc(date).startOf("day");

    const timeSlot = doctor.thoiGianKham.find((slot) => {
      const slotDate = moment.utc(slot.date).startOf("day");
      return slotDate.isSame(queryDate);
    });

    if (timeSlot) {
      const timeGioIds = timeSlot.thoiGianId;

      const timeGioList = await ThoiGianGio.find({
        _id: { $in: timeGioIds },
      });

      const tenGioArray = timeGioList.map((item) => item.tenGio);

      return res.status(200).json({
        message: "Lấy thời gian thành công!",
        timeSlots: timeSlot.thoiGianId,
        tenGioArray,
        timeGioList,
      });
    } else {
      return res.status(200).json({
        message: "Không có thời gian khám cho ngày này!",
        timeSlots: [],
      });
    }
  } catch (error) {
    handleError(res, error, "Có lỗi xảy ra khi lấy thời gian khám.");
  }
};

module.exports = {
  fetchAllThoiGianGio,
  addTimeKhamBenhDoctor,
  deleteOldTimeSlots,
  getTimeSlotsByDoctorAndDate,
};
