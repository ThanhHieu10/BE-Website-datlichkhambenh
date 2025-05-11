const bcrypt = require("bcrypt");
const Doctor = require("../../model/Doctor");
const ThoiGianGio = require("../../model/ThoiGianGio");
const { handleError } = require("../../utils/errorUtils");
require("dotenv").config();

module.exports = {
  //Thêm bác sĩ
  createDoctor: async (req, res) => {
    try {
      let {
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        giaKhamVN,
        giaKhamNuocNgoai,
        chucVuId,
        gender,
        image,
        chuyenKhoaId,
        phongKhamId,
        roleId,
        mota,
      } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp đầy đủ thông tin (email, password, firstName, lastName)",
        });
      }

      const existingDoctor = await Doctor.findOne({ email: email });
      if (existingDoctor) {
        return res.status(409).json({
          message: "Email đã tồn tại. Vui lòng sử dụng email khác.",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      let createDoctor = await Doctor.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        address,
        phoneNumber,
        chucVuId: chucVuId || [],
        gender,
        image,
        chuyenKhoaId: chuyenKhoaId || [],
        phongKhamId,
        roleId,
        mota,
        giaKhamVN,
        giaKhamNuocNgoai,
      });

      if (createDoctor) {
        console.log("thêm thành công tài khoản");
        return res.status(200).json({
          data: createDoctor,
          message: "Thêm tài khoản bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Thêm tài khoản bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      handleError(
        res,
        error,
        "Có lỗi xảy ra khi chỉnh sửa thông tin khám bác sĩ."
      );
    }
  },

  //Lấy tất cả bác sĩ
  fetchAllDoctor: async (req, res) => {
    try {
      // Lấy trang và kích thước trang từ query
      const { page, limit, firstName, lastName, address } = req.query;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      const skip = (pageNumber - 1) * limitNumber;

      const query = {};
      // Tạo điều kiện tìm kiếm
      if (firstName || lastName || address) {
        const searchKeywords =
          (firstName || "") + " " + (lastName || "") + " " + (address || "");
        const keywordsArray = searchKeywords.trim().split(/\s+/);

        const searchConditions = keywordsArray.map((keyword) => ({
          $or: [
            { firstName: { $regex: keyword, $options: "i" } },
            { lastName: { $regex: keyword, $options: "i" } },
            { address: { $regex: keyword, $options: "i" } },
          ],
        }));

        query.$or = searchConditions;
      }

      // Tìm tất cả bác sĩ và phân trang
      const fetchAll = await Doctor.find(query)
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId",
          model: "ThoiGianGio",
        })
        .skip(skip)
        .limit(limitNumber);

      console.log("fetchAll: ", fetchAll);

      const totalDoctors = await Doctor.countDocuments(query); //Tổng số bác sĩ

      const totalPages = Math.ceil(totalDoctors / limitNumber); // Tính tổng số trang

      return res.status(200).json({
        data: fetchAll,
        totalDoctors,
        totalPages,
        currentPage: pageNumber,
        message: "Đã tìm ra tất cả bác sĩ",
      });
    } catch (error) {
      console.error(error);
      handleError(
        res,
        error,
        "Có lỗi xảy ra khi chỉnh sửa thông tin khám bác sĩ."
      );
    }
  },

  //Lấy tất cả bác sĩ = id
  fetchAllDoctorById: async (req, res) => {
    try {
      const { _id } = req.query;

      const fetchAll = await Doctor.findOne({ _id: _id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId",
          model: "ThoiGianGio",
        });

      return res.status(200).json({
        data: fetchAll,
        message: "Đã tìm ra bác sĩ",
      });
    } catch (error) {
      console.error(error);
      handleError(
        res,
        error,
        "Có lỗi xảy ra khi chỉnh sửa thông tin khám bác sĩ."
      );
    }
  },

  //update tất cả bác sĩ theo id
  updateDoctor: async (req, res) => {
    try {
      let {
        _id,
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        giaKhamVN,
        giaKhamNuocNgoai,
        chucVuId,
        gender,
        image,
        chuyenKhoaId,
        phongKhamId,
        roleId,
        mota,
      } = req.body;

      console.log("id: ", _id);

      let createDoctor = await Doctor.updateOne(
        { _id: _id },
        {
          email,
          firstName,
          lastName,
          address,
          phoneNumber,
          chucVuId: chucVuId || [],
          gender,
          image,
          chuyenKhoaId: chuyenKhoaId || [],
          phongKhamId,
          roleId,
          mota,
          giaKhamVN,
          giaKhamNuocNgoai,
        }
      );

      if (createDoctor) {
        console.log("Chỉnh sửa thành công tài khoản");
        return res.status(200).json({
          data: createDoctor,
          message: "Chỉnh sửa tài khoản bác sĩ thành công",
        });
      } else {
        return res.status(404).json({
          message: "Chỉnh sửa tài khoản bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error(error);
      handleError(
        res,
        error,
        "Có lỗi xảy ra khi chỉnh sửa thông tin khám bác sĩ."
      );
    }
  },

  //Xoá bác sĩ theo id
  deleteDoctor: async (req, res) => {
    const _id = req.params.id;

    let xoaAD = await Doctor.deleteOne({ _id: _id });

    if (xoaAD) {
      return res.status(200).json({
        data: xoaAD,
        message: "Bạn đã xoá tài khoản bác sĩ thành công!",
      });
    } else {
      handleError(res, error, "Bạn đã xoá tài khoản bác sĩ thất bại!.");
    }
  },

  //Chi tiết doctor
  fetchDoctorById: async (req, res) => {
    let id = req.query.id;
    console.log("id doctor: ", id);
    try {
      const doctor = await Doctor.findById(id)
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId",
          model: "ThoiGianGio",
        });
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy bác sĩ",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      handleError(res, error, "Có lỗi xảy ra!.");
    }
  },

  // tìm tt bác sĩ khi bệnh nhân đặt lịch
  fetchDoctorByNgayGio: async (req, res) => {
    try {
      const { id, idGioKhamBenh, ngayKham } = req.query;
      console.log("id, idGioKhamBenh, ngayKham: ", id, idGioKhamBenh, ngayKham);

      // Tìm bác sĩ theo ID
      const doctor = await Doctor.findById(id).populate(
        "chucVuId chuyenKhoaId phongKhamId roleId"
      );
      if (!doctor) {
        return res.status(404).json({ message: "Bác sĩ không tồn tại!" });
      }

      const timeGio = await ThoiGianGio.findById(idGioKhamBenh);
      if (!timeGio) {
        return res.status(404).json({ message: "tên giờ không tồn tại!" });
      }

      return res.status(200).json({
        message: "Da tim thay!",
        infoDoctor: doctor,
        tenGio: timeGio,
        ngayKham: ngayKham,
      });
    } catch (error) {
      console.error(error);
      handleError(res, error, "Có lỗi xảy ra!.");
    }
  },

  fetchDoctorByChuyenKhoa: async (req, res) => {
    let id = req.query.idChuyenKhoa;
    console.log("id chuyenKhoa: ", id);

    try {
      const doctor = await Doctor.find({ chuyenKhoaId: id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId",
          model: "ThoiGianGio",
        });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Doctor",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      handleError(res, error, "Có lỗi xảy ra.");
    }
  },

  fetchDoctorByPhongKham: async (req, res) => {
    let id = req.query.idPhongKham;
    console.log("idPhongKham: ", id);

    try {
      const doctor = await Doctor.find({ phongKhamId: id })
        .populate("chucVuId chuyenKhoaId phongKhamId roleId")
        .populate({
          path: "thoiGianKham.thoiGianId",
          model: "ThoiGianGio",
        });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor không tồn tại!" });
      }
      return res.status(200).json({
        message: "Đã tìm thấy Doctor",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      handleError(
        res,
        error,
        "Có lỗi xảy ra khi chỉnh sửa thông tin khám bác sĩ."
      );
    }
  },
};
